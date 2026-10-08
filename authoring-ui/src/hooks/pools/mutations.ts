import { useMutation, useQueryClient } from "@tanstack/react-query";
import { poolAPI } from "@api";
import { taskKeys } from "../tasks/keys";
import { poolKeys } from "./keys";

export function useCreatePool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      name,
      initRepository,
    }: {
      name: string;
      initRepository: boolean;
    }) => poolAPI.createPool(name, initRepository),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: poolKeys.all }),
  });
}

// Renaming or copying a pool changes the `pool` field of its tasks, and the
// task list of every pool feeds the worksheet task picker.
function useInvalidatePoolsAndTasks() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: poolKeys.all }),
      queryClient.invalidateQueries({ queryKey: taskKeys.all }),
    ]);
}

export function useRenamePool(name: string) {
  const invalidate = useInvalidatePoolsAndTasks();
  return useMutation({
    mutationFn: (newName: string) => poolAPI.renamePool(name, newName),
    onSuccess: invalidate,
  });
}

export function useCopyPool(name: string) {
  const invalidate = useInvalidatePoolsAndTasks();
  return useMutation({
    mutationFn: (newName: string) => poolAPI.copyPool(name, newName),
    onSuccess: invalidate,
  });
}

export function useTurnPoolIntoRepository(name: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => poolAPI.turnPoolIntoRepository(name),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: poolKeys.all }),
        queryClient.invalidateQueries({ queryKey: taskKeys.pool(name) }),
      ]),
  });
}

export function useDeletePool(name: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => poolAPI.deletePool(name),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: taskKeys.pool(name) });
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: poolKeys.all }),
        queryClient.invalidateQueries({ queryKey: taskKeys.allPools }),
      ]);
    },
  });
}
