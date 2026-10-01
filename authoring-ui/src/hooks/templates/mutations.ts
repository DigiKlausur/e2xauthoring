import { useMutation, useQueryClient } from "@tanstack/react-query";
import { templateAPI } from "@api";
import { templateKeys } from "./keys";

function useInvalidateTemplates() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: templateKeys.all });
}

export function useCreateTemplate() {
  const invalidate = useInvalidateTemplates();
  return useMutation({
    mutationFn: (name: string) => templateAPI.createTemplate(name),
    onSuccess: invalidate,
  });
}

export function useRenameTemplate(name: string) {
  const invalidate = useInvalidateTemplates();
  return useMutation({
    mutationFn: (newName: string) => templateAPI.renameTemplate(name, newName),
    onSuccess: invalidate,
  });
}

export function useCopyTemplate(name: string) {
  const invalidate = useInvalidateTemplates();
  return useMutation({
    mutationFn: (newName: string) => templateAPI.copyTemplate(name, newName),
    onSuccess: invalidate,
  });
}

export function useDeleteTemplate(name: string) {
  const invalidate = useInvalidateTemplates();
  return useMutation({
    mutationFn: () => templateAPI.deleteTemplate(name),
    onSuccess: invalidate,
  });
}
