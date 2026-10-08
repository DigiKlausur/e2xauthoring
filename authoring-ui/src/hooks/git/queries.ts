import { useQuery } from "@tanstack/react-query";
import { gitAPI } from "@api";
import { gitKeys } from "./keys";

export function useGitAuthor() {
  return useQuery({
    queryKey: gitKeys.author,
    queryFn: () => gitAPI.fetchAuthor(),
  });
}
