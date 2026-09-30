import { config } from "@/config";
import { actions } from "./client";
import { urlJoin } from "./http";
import type { Worksheet, WorksheetResources } from "./types";

const worksheets_url = urlJoin(config.apiUrl, "worksheets");

export const worksheetAPI = {
  fetchWorksheets: async (assignment: string): Promise<Worksheet[]> =>
    actions.get<Worksheet[]>(worksheets_url, "list", { assignment }),
  createWorksheet: async (resources: WorksheetResources): Promise<void> =>
    actions.post<void>(worksheets_url, "create", { resources }),
  deleteWorksheet: async (assignment: string, name: string): Promise<void> =>
    actions.delete<void>(worksheets_url, "remove", { assignment, name }),
};
