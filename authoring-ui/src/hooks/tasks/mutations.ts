import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskAPI } from "@api";
import { poolKeys } from "../pools/keys";
import { taskKeys } from "./keys";

// Adding, removing or renaming a task changes the pool's task list, the task
// count in the pool list and the task picker that spans every pool.
function useInvalidateTaskLists(pool: string) {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: taskKeys.pool(pool) }),
      queryClient.invalidateQueries({ queryKey: taskKeys.allPools }),
      queryClient.invalidateQueries({ queryKey: poolKeys.all }),
    ]);
}

export function useCreateTask(pool: string) {
  const invalidate = useInvalidateTaskLists(pool);
  return useMutation({
    mutationFn: ({ name, kernelName }: { name: string; kernelName: string }) =>
      taskAPI.createTask(pool, name, kernelName),
    onSuccess: invalidate,
  });
}

export function useRenameTask(pool: string, name: string) {
  const invalidate = useInvalidateTaskLists(pool);
  return useMutation({
    mutationFn: (newName: string) => taskAPI.renameTask(pool, name, newName),
    onSuccess: invalidate,
  });
}

export function useCopyTask(pool: string, name: string) {
  const invalidate = useInvalidateTaskLists(pool);
  return useMutation({
    mutationFn: (newName: string) => taskAPI.copyTask(pool, name, newName),
    onSuccess: invalidate,
  });
}

export function useCommitTask(pool: string, name: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (message: string) => taskAPI.commitTask(pool, name, message),
    // The pool key prefixes the task's diffs, which the commit also changes.
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: taskKeys.pool(pool) }),
  });
}

export function useDeleteTask(pool: string, name: string) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateTaskLists(pool);
  return useMutation({
    mutationFn: () => taskAPI.deleteTask(pool, name),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: taskKeys.task(pool, name) });
      return invalidate();
    },
  });
}
