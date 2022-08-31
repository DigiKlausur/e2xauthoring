export const urlJoin = (...parts) => {
  parts = parts.map((part, index) => {
    if (index) {
      part = part.replace(/^\//, "");
    }
    if (index !== parts.length - 1) {
      part = part.replace(/\/$/, "");
    }
    return part;
  });
  return parts.join("/");
};

const getCookie = (name) => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    for (let cookie of document.cookie.split(";")) {
      if (cookie.trim().substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

const baseSettings = {
  credentials: "same-origin",
  headers: {
    "X-CSRFToken": getCookie("_xsrf"),
  },
};

const requests = {
  get: async (url, params = undefined) => {
    if (params !== undefined) {
      url += "?" + new URLSearchParams(params).toString();
    }
    const response = await fetch(url);
    return response.json();
  },
  post: async (url, data) => {
    let settings = {
      ...baseSettings,
      method: "POST",
      body: JSON.stringify(data),
    };
    const response = await fetch(url, settings);
    return response.json();
  },
  put: async (url, data) => {
    let settings = {
      ...baseSettings,
      method: "PUT",
      body: JSON.stringify(data),
    };
    const response = await fetch(url, settings);
    return response.json();
  },
  del: async (url, data) => {
    let settings = {
      ...baseSettings,
      method: "DELETE",
      body: JSON.stringify(data),
    };
    const response = await fetch(url, settings);
    return response.json();
  },
};

const ROOT = window.base_url;
const NBGRADER_API_ROOT = urlJoin(ROOT, "formgrader", "api");
const API_ROOT = urlJoin(ROOT, "e2x", "authoring", "api");

const TaskPools = {
  list: () => requests.get(urlJoin(API_ROOT, "pools")),
  get: (name) => requests.get(urlJoin(API_ROOT, "pool"), { name: name }),
  delete: (name) => requests.del(urlJoin(API_ROOT, "pool"), { name: name }),
  create: (name, initRepo) =>
    requests.post(urlJoin(API_ROOT, "pool"), {
      name: name,
      create_repository: initRepo,
    }),
  toRepo: (name) =>
    requests.put(urlJoin(API_ROOT, "pool"), {
      name: name,
      create_repository: true,
    }),
};

const Templates = {
  list: () => requests.get(urlJoin(API_ROOT, "templates")),
  get: (name) => requests.get(urlJoin(API_ROOT, "template"), { name: name }),
  delete: (name) => requests.del(urlJoin(API_ROOT, "template"), { name: name }),
  create: (name) =>
    requests.post(urlJoin(API_ROOT, "template"), { name: name }),
  list_variables: (name) =>
    requests.get(urlJoin(API_ROOT, "template", "variables"), { name: name }),
};

const Tasks = {
  list: (pool) => requests.get(urlJoin(API_ROOT, "tasks"), { pool: pool }),
  list_all: () => requests.get(urlJoin(API_ROOT, "tasks", "list_all")),
  get: (pool, task) =>
    requests.get(urlJoin(API_ROOT, "task"), { pool: pool, name: task }),
  delete: (pool, task) =>
    requests.get(urlJoin(API_ROOT, "task"), { pool: pool, name: task }),
  create: (pool, task) =>
    requests.post(urlJoin(API_ROOT, "task"), { pool: pool, name: task }),
  commit: (pool, task, message = undefined) =>
    requests.put(urlJoin(API_ROOT, "task", "commit"), {
      pool: pool,
      name: task,
      ...(message && { message: message }),
    }),
  diff: (pool, task, file) =>
    requests.get(urlJoin(API_ROOT, "tasks", "diff"), {
      pool: pool,
      task: task,
      file: file,
    }),
};

const Assignments = {
  list: (include_score = true) =>
    requests.get(urlJoin(NBGRADER_API_ROOT, "assignments"), {
      include_score: include_score,
    }),
  create: (name, date) => {
    let params = {};
    if (date !== null) {
      let duedate_notimezone = date.toISOString().split(".")[0];
      params["duedate_notimezone"] = duedate_notimezone.slice(
        0,
        duedate_notimezone.length - 3
      );
    }
    return requests.put(urlJoin(NBGRADER_API_ROOT, "assignment", name), params);
  },
};

const Worksheets = {};

export default {
  TaskPools,
  Tasks,
  Templates,
  Assignments,
  Worksheets,
};
