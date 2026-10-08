import { config } from "@/config";
import { actions } from "./client";
import { urlJoin } from "./http";
import type { Task } from "./types";

const tasks_url = urlJoin(config.apiUrl, "tasks");

export const taskAPI = {
  fetchTasks: async (pool: string): Promise<Task[]> =>
    actions.get<Task[]>(tasks_url, "list", { pool }),
  fetchAllTasks: async (): Promise<Task[]> =>
    actions.get<Task[]>(tasks_url, "list_all"),
  fetchTaskDiff: async (
    pool: string,
    task: string,
    file: string,
  ): Promise<string> =>
    actions.get<string>(tasks_url, "git_diff", { pool, task, file }),
  createTask: async (
    pool: string,
    name: string,
    kernelName: string,
  ): Promise<void> =>
    actions.post<void>(tasks_url, "create", {
      pool,
      name,
      kernel_name: kernelName,
    }),
  renameTask: async (
    pool: string,
    oldName: string,
    newName: string,
  ): Promise<void> =>
    actions.put<void>(tasks_url, "rename", {
      pool,
      old_name: oldName,
      new_name: newName,
    }),
  copyTask: async (
    pool: string,
    oldName: string,
    newName: string,
  ): Promise<void> =>
    actions.put<void>(tasks_url, "copy", {
      pool,
      old_name: oldName,
      new_name: newName,
    }),
  commitTask: async (
    pool: string,
    task: string,
    message: string,
  ): Promise<void> =>
    actions.put<void>(tasks_url, "commit", { pool, task, message }),
  deleteTask: async (pool: string, name: string): Promise<void> =>
    actions.delete<void>(tasks_url, "remove", { pool, name }),
};
