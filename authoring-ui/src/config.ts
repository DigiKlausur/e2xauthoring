export interface AppConfig {
  baseUrl: string; // router basename, e.g. "/e2x/authoring/app"
  apiUrl: string; // authoring API root, e.g. "/e2x/authoring/api"
  formgraderApiUrl: string; // nbgrader formgrader API root, e.g. "/formgrader/api"
  notebookUrl: string; // Jupyter notebook view root, e.g. "/notebooks/course"
}

declare global {
  interface Window {
    __APP_CONFIG__?: AppConfig;
  }
}

export function getConfig(): AppConfig {
  if (window.__APP_CONFIG__) return window.__APP_CONFIG__;
  console.warn("Using development config fallback");
  return {
    baseUrl: import.meta.env.VITE_BASE_URL || "",
    apiUrl: import.meta.env.VITE_API_URL || "/api",
    formgraderApiUrl:
      import.meta.env.VITE_FORMGRADER_API_URL || "/formgrader/api",
    notebookUrl: import.meta.env.VITE_NOTEBOOK_URL || "/notebooks",
  };
}

export const config = getConfig();
