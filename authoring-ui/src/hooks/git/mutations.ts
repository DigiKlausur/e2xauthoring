import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gitAPI, type GitAuthorUpdate } from "@api";
import { gitKeys } from "./keys";

export function useUpdateGitAuthor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (author: GitAuthorUpdate) => gitAPI.updateAuthor(author),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: gitKeys.author }),
  });
}
