import { queryOptions, useQuery } from "@tanstack/react-query";
import { taskAPI } from "@api";
import { taskKeys } from "./keys";

const tasksQuery = (pool: string) =>
  queryOptions({
    queryKey: taskKeys.pool(pool),
    queryFn: () => taskAPI.fetchTasks(pool),
    enabled: !!pool,
  });

export function useTasks(pool: string) {
  return useQuery(tasksQuery(pool));
}

export function useAllTasks() {
  return useQuery({
    queryKey: taskKeys.allPools,
    queryFn: () => taskAPI.fetchAllTasks(),
  });
}

export function useTaskDiff(pool: string, task: string, file: string) {
  return useQuery({
    queryKey: taskKeys.diff(pool, task, file),
    queryFn: () => taskAPI.fetchTaskDiff(pool, task, file),
    enabled: !!pool && !!task && !!file,
  });
}
