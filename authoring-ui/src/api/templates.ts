import { config } from "@/config";
import { actions } from "./client";
import { urlJoin } from "./http";
import type { Template } from "./types";

const templates_url = urlJoin(config.apiUrl, "templates");

export const templateAPI = {
  fetchTemplates: async (): Promise<Template[]> =>
    actions.get<Template[]>(templates_url, "list"),
  createTemplate: async (name: string): Promise<void> =>
    actions.post<void>(templates_url, "create", { name }),
  renameTemplate: async (oldName: string, newName: string): Promise<void> =>
    actions.put<void>(templates_url, "rename", {
      old_name: oldName,
      new_name: newName,
    }),
  copyTemplate: async (oldName: string, newName: string): Promise<void> =>
    actions.put<void>(templates_url, "copy", {
      old_name: oldName,
      new_name: newName,
    }),
  deleteTemplate: async (name: string): Promise<void> =>
    actions.delete<void>(templates_url, "remove", { name }),
};
