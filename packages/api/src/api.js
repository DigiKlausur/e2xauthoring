import { requests } from "./requests";
import { urlJoin } from "./utils";

const ROOT = window.base_url;
const NBGRADER_API_ROOT = urlJoin(ROOT, "formgrader", "api");
const AUTHORING_API_ROOT = urlJoin(ROOT, "e2x", "authoring", "api");

const PRESET_API_ROOT = urlJoin(AUTHORING_API_ROOT, "presets");
const POOL_API_ROOT = urlJoin(AUTHORING_API_ROOT, "pools");
const TASK_API_ROOT = urlJoin(AUTHORING_API_ROOT, "tasks");
const TEMPLATE_API_ROOT = urlJoin(AUTHORING_API_ROOT, "templates");
const WORKSHEET_API_ROOT = urlJoin(AUTHORING_API_ROOT, "worksheets");

export const API = {
  assignments: {
    list: (include_score = false) =>
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
      return requests.put(
        urlJoin(NBGRADER_API_ROOT, "assignment", name),
        params
      );
    },
  },
  git_author: {
    get: () => requests.get(urlJoin(AUTHORING_API_ROOT, "git", "author")),
    set: (name, email) =>
      requests.post(urlJoin(AUTHORING_API_ROOT, "git", "author"), {
        name: name,
        email: email,
      }),
  },
  kernels: {
    list: () => requests.get(urlJoin(AUTHORING_API_ROOT, "kernelspec")),
  },
  pools: {
    get: (name) => requests.get(POOL_API_ROOT, { action: "get", name: name }),
    list: () => requests.get(POOL_API_ROOT, { action: "list" }),
    create: (name, init_repository = false) =>
      requests.post(POOL_API_ROOT, {
        action: "create",
        name: name,
        init_repository: init_repository,
      }),
    rename: (old_name, new_name) =>
      requests.put(POOL_API_ROOT, {
        action: "rename",
        old_name: old_name,
        new_name: new_name,
      }),
    copy: (old_name, new_name) =>
      requests.put(POOL_API_ROOT, {
        action: "copy",
        old_name: old_name,
        new_name: new_name,
      }),
    turn_into_repository: (pool) =>
      requests.put(POOL_API_ROOT, {
        action: "turn_into_repository",
        pool: pool,
      }),
    remove: (name) =>
      requests.del(POOL_API_ROOT, { action: "remove", name: name }),
  },
  tasks: {
    get: (pool, name) =>
      requests.get(TASK_API_ROOT, { action: "get", name: name, pool: pool }),
    list: (pool) => requests.get(TASK_API_ROOT, { action: "list", pool: pool }),
    list_all: () => requests.get(TASK_API_ROOT, { action: "list_all" }),
    git_diff: (pool, name, file) =>
      requests.get(TASK_API_ROOT, {
        action: "git_diff",
        pool: pool,
        task: name,
        file: file,
      }),
    create: (pool, name, kernel_name) =>
      requests.post(TASK_API_ROOT, {
        action: "create",
        pool: pool,
        name: name,
        kernel_name: kernel_name,
      }),
    rename: (pool, old_name, new_name) =>
      requests.put(TASK_API_ROOT, {
        action: "rename",
        pool: pool,
        old_name: old_name,
        new_name: new_name,
      }),
    copy: (pool, old_name, new_name) =>
      requests.put(TASK_API_ROOT, {
        action: "copy",
        pool: pool,
        old_name: old_name,
        new_name: new_name,
      }),
    commit: (pool, name, message) =>
      requests.put(TASK_API_ROOT, {
        action: "commit",
        pool: pool,
        task: name,
        message: message,
      }),
    remove: (pool, name) =>
      requests.del(TASK_API_ROOT, { action: "remove", pool: pool, name: name }),
  },
  templates: {
    get: (name) =>
      requests.get(TEMPLATE_API_ROOT, { action: "get", name: name }),
    list: () => requests.get(TEMPLATE_API_ROOT, { action: "list" }),
    list_variables: (name) =>
      requests.get(TEMPLATE_API_ROOT, { action: "list_variables", name: name }),
    create: (name) =>
      requests.post(TEMPLATE_API_ROOT, { action: "create", name: name }),
    rename: (old_name, new_name) =>
      requests.put(TEMPLATE_API_ROOT, {
        action: "rename",
        old_name: old_name,
        new_name: new_name,
      }),
    copy: (old_name, new_name) =>
      requests.put(TEMPLATE_API_ROOT, {
        action: "copy",
        old_name: old_name,
        new_name: new_name,
      }),
    remove: (name) =>
      requests.del(TEMPLATE_API_ROOT, { action: "remove", name: name }),
  },
  worksheets: {
    get: (name, assignment) =>
      requests.get(WORKSHEET_API_ROOT, {
        action: "get",
        name: name,
        assignment: assignment,
      }),
    list: (assignment) =>
      requests.get(WORKSHEET_API_ROOT, {
        action: "list",
        assignment: assignment,
      }),
    remove: (name, assignment) =>
      requests.del(WORKSHEET_API_ROOT, {
        action: "remove",
        name: name,
        assignment: assignment,
      }),
    create: (resources) =>
      requests.post(WORKSHEET_API_ROOT, {
        action: "create",
        resources: resources,
      }),
  },
  presets: {
    list_question_presets: () =>
      requests.get(PRESET_API_ROOT, { action: "list_question_presets" }),
    list_template_presets: () =>
      requests.get(PRESET_API_ROOT, { action: "list_template_presets" }),
    get_question_preset: (name) =>
      requests.get(PRESET_API_ROOT, {
        action: "get_question_preset",
        preset_name: name,
      }),
    get_template_preset: (name) =>
      requests.get(PRESET_API_ROOT, {
        action: "get_template_preset",
        preset_name: name,
      }),
  },
};
