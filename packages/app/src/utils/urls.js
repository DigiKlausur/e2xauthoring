import { urlJoin } from "../api";

export const appUrl = urlJoin(window.base_url, "e2x", "authoring", "app");
export const poolUrl = urlJoin(appUrl, "pools");
export const templateUrl = urlJoin(appUrl, "templates");
export const assignmentsUrl = urlJoin(appUrl, "assignments");
export const notebookUrl = urlJoin(
  window.base_url,
  "notebooks",
  window.url_prefix
);
export const treeUrl = urlJoin(window.base_url, "tree", window.url_prefix);

export const getPoolUrl = (pool) => {
  return urlJoin(poolUrl, pool);
};
export const getTaskUrl = (pool, task) => {
  return urlJoin(poolUrl, pool, task);
};
export const getTemplateUrl = (template) => {
  return urlJoin(templateUrl, template);
};
export const getDiffUrl = (pool, task, file) => {
  let diffBaseUrl = urlJoin(appUrl, "nonav", "diff", pool, task);
  return diffBaseUrl + "?" + new URLSearchParams({ file: file }).toString();
};
export const getAssignmentUrl = (assignment) => {
  return urlJoin(assignmentsUrl, assignment);
};
export const getNotebookUrl = (notebook_path) => {
  return urlJoin(notebookUrl, notebook_path);
};
