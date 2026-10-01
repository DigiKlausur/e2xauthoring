import { urlJoin } from "@api/http";
import { config } from "@/config";

// Router paths, relative to the router basename.

export const routes = {
  pools: "/pools",
  pool: (pool: string) => `/pools/${pool}`,
  task: (pool: string, task: string) => `/pools/${pool}/${task}`,
  templates: "/templates",
  template: (template: string) => `/templates/${template}`,
  assignments: "/assignments",
  assignment: (assignment: string) => `/assignments/${assignment}`,
  newWorksheet: (assignment: string, name: string) =>
    `/assignments/${assignment}/new/${name}`,
  diff: (pool: string, task: string, file: string) =>
    `/diff/${pool}/${task}?${new URLSearchParams({ file })}`,
};

// Notebooks are opened in Jupyter itself, outside the router.

export const notebookUrls = {
  task: (pool: string, task: string) =>
    urlJoin(config.notebookUrl, "pools", pool, task, `${task}.ipynb`),
  template: (template: string) =>
    urlJoin(config.notebookUrl, "templates", template, `${template}.ipynb`),
  worksheet: (assignment: string, name: string) =>
    urlJoin(config.notebookUrl, "source", assignment, `${name}.ipynb`),
};
