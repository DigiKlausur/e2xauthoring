import { getCookie } from "./http";

export interface ApiError extends Error {
  response?: {
    status: number;
    type?: string;
    title?: string;
    detail?: string;
    extra?: Record<string, unknown>;
  };
}

const baseSettings: RequestInit = {
  credentials: "same-origin",
  headers: {
    "X-CSRFToken": getCookie("_xsrf") || "",
    "Content-Type": "application/json",
  },
};

type Params = Record<string, string | number | boolean>;

function createApiError(
  status: number,
  problem: Record<string, unknown>,
): ApiError {
  const { type, title, detail, ...extra } = problem;
  const text = (value: unknown) =>
    typeof value === "string" && value !== "" ? value : undefined;
  const error: ApiError = new Error(
    text(detail) ?? text(title) ?? text(extra.message) ?? `HTTP ${status}`,
  );
  error.response = {
    status,
    type: text(type),
    title: text(title),
    detail: text(detail),
    extra,
  };
  return error;
}

async function readJson(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const contentType = response.headers.get("Content-Type") ?? "";
  if (!contentType.includes("json")) {
    // Tornado writes json.dumps() results with a text/html content type,
    // so fall back to parsing the body instead of trusting the header.
    const body = await response.text();
    try {
      return body === "" ? null : JSON.parse(body);
    } catch {
      return null;
    }
  }
  return response.json();
}

async function send<T>(
  method: string,
  url: string,
  body?: unknown,
): Promise<T> {
  const response = await fetch(url, {
    ...baseSettings,
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await readJson(response);
  if (!response.ok) {
    const problem =
      data !== null && typeof data === "object"
        ? (data as Record<string, unknown>)
        : {};
    throw createApiError(response.status, problem);
  }
  return data as T;
}

export const requests = {
  get: <T>(url: string, params?: Params) => {
    const query = params
      ? "?" +
        new URLSearchParams(
          Object.entries(params).map(([k, v]) => [k, String(v)]),
        ).toString()
      : "";
    return send<T>("GET", url + query);
  },
  post: <T>(url: string, body?: unknown) => send<T>("POST", url, body),
  put: <T>(url: string, body?: unknown) => send<T>("PUT", url, body),
  patch: <T>(url: string, body?: unknown) => send<T>("PATCH", url, body),
  delete: <T>(url: string, body?: unknown) => send<T>("DELETE", url, body),
};

// ── Action endpoints ──────────────────────────────────────────────────────
// The authoring backend exposes one endpoint per resource and selects the
// operation with an `action` argument. Every call answers HTTP 200 with a
// `{ success, data }` or `{ success: false, error }` envelope instead of an
// error status, so failures have to be detected here and turned into an
// ApiError like any other failed request.

type ActionResult<T> =
  | { success: true; message: string; data: T }
  | { success: false; error: string };

function unwrap<T>(result: ActionResult<T>): T {
  if (result.success) return result.data;
  throw createApiError(200, { title: "Action failed", detail: result.error });
}

export const actions = {
  get: <T>(url: string, action: string, params: Params = {}) =>
    requests.get<ActionResult<T>>(url, { action, ...params }).then(unwrap),
  post: <T>(url: string, action: string, body: object = {}) =>
    requests.post<ActionResult<T>>(url, { action, ...body }).then(unwrap),
  put: <T>(url: string, action: string, body: object = {}) =>
    requests.put<ActionResult<T>>(url, { action, ...body }).then(unwrap),
  delete: <T>(url: string, action: string, body: object = {}) =>
    requests.delete<ActionResult<T>>(url, { action, ...body }).then(unwrap),
};

export function actionFailed(detail: string): ApiError {
  return createApiError(200, { title: "Action failed", detail });
}
