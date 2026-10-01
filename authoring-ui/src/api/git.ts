import { config } from "@/config";
import { actionFailed, requests } from "./client";
import { urlJoin } from "./http";
import type {
  GitAuthor,
  GitAuthorUpdate,
  GitAuthorUpdateResult,
} from "./types";

const author_url = urlJoin(config.apiUrl, "git", "author");

export const gitAPI = {
  fetchAuthor: async (): Promise<GitAuthor> =>
    requests.get<GitAuthor>(author_url),
  updateAuthor: async (author: GitAuthorUpdate): Promise<void> => {
    const result = await requests.post<GitAuthorUpdateResult>(
      author_url,
      author,
    );
    if (!result.success) {
      throw actionFailed(result.message ?? "Could not set the git author.");
    }
  },
};
