import { config } from "@/config";
import { requests } from "./client";
import { urlJoin } from "./http";
import type { KernelSpecs } from "./types";

export const kernelAPI = {
  fetchKernelSpecs: async (): Promise<KernelSpecs> =>
    requests.get<KernelSpecs>(urlJoin(config.apiUrl, "kernelspec")),
};
