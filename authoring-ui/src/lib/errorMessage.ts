import type { ApiError } from "@api";

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function isPermissionError(error: unknown): boolean {
  return (error as ApiError | undefined)?.response?.status === 403;
}
