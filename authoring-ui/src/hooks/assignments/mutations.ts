import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assignmentAPI } from "@api";
import { assignmentKeys } from "./keys";

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, duedate }: { name: string; duedate: string | null }) =>
      assignmentAPI.createAssignment(name, duedate),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all }),
  });
}
