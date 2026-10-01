import { useMutation, useQueryClient } from "@tanstack/react-query";
import { worksheetAPI, type WorksheetResources } from "@api";
import { worksheetKeys } from "./keys";

export type NewWorksheet = Omit<WorksheetResources, "assignment" | "exercise">;

export function useCreateWorksheet(assignment: string, name: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (worksheet: NewWorksheet) =>
      worksheetAPI.createWorksheet({
        ...worksheet,
        assignment,
        exercise: name,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: worksheetKeys.assignment(assignment),
      }),
  });
}

export function useDeleteWorksheet(assignment: string, name: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => worksheetAPI.deleteWorksheet(assignment, name),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: worksheetKeys.assignment(assignment),
      }),
  });
}
