import { config } from "@/config";
import { actions } from "./client";
import { urlJoin } from "./http";
import type { Pool } from "./types";

const pools_url = urlJoin(config.apiUrl, "pools");

export const poolAPI = {
  fetchPools: async (): Promise<Pool[]> =>
    actions.get<Pool[]>(pools_url, "list"),
  createPool: async (name: string, initRepository: boolean): Promise<Pool> =>
    actions.post<Pool>(pools_url, "create", {
      name,
      init_repository: initRepository,
    }),
  renamePool: async (name: string, newName: string): Promise<Pool> =>
    actions.put<Pool>(pools_url, "rename", { name, new_name: newName }),
  copyPool: async (name: string, newName: string): Promise<Pool> =>
    actions.put<Pool>(pools_url, "copy", { name, new_name: newName }),
  turnPoolIntoRepository: async (pool: string): Promise<void> =>
    actions.put<void>(pools_url, "turn_into_repository", { pool }),
  deletePool: async (name: string): Promise<void> =>
    actions.delete<void>(pools_url, "remove", { name }),
};
