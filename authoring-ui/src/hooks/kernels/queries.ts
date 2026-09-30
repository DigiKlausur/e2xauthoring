import { useQuery } from "@tanstack/react-query";
import { kernelAPI } from "@api";
import { kernelKeys } from "./keys";

export interface KernelOption {
  name: string;
  displayName: string;
}

/** Installed Jupyter kernels, in the order the server lists them. */
export function useKernels() {
  return useQuery({
    queryKey: kernelKeys.all,
    queryFn: () => kernelAPI.fetchKernelSpecs(),
    // Installing a kernel needs a server restart, so the list is stable.
    staleTime: Infinity,
    select: (specs): KernelOption[] =>
      Object.entries(specs).map(([name, { spec }]) => ({
        name,
        displayName: spec.display_name,
      })),
  });
}
