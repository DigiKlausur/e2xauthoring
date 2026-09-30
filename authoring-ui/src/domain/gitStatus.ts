import type { GitStatusValue, TaskGitStatus } from "@api/types";

export const GitStatus = {
  Unchanged: "unchanged",
  Modified: "modified",
  NotVersionControlled: "not version controlled",
} as const satisfies Record<string, GitStatusValue>;

export type GitStatus = (typeof GitStatus)[keyof typeof GitStatus];

export type StatusTone = "success" | "warning" | "neutral" | "info";

export const gitStatusLabels = {
  [GitStatus.Unchanged]: { label: "Committed", tone: "success" },
  [GitStatus.Modified]: { label: "Uncommitted changes", tone: "warning" },
  [GitStatus.NotVersionControlled]: {
    label: "Not version controlled",
    tone: "neutral",
  },
} satisfies Record<GitStatusValue, { label: string; tone: StatusTone }>;

export const FileChange = {
  New: "new",
  Modified: "modified",
} as const;

export type FileChange = (typeof FileChange)[keyof typeof FileChange];

export const fileChangeLabels = {
  [FileChange.New]: "New file",
  [FileChange.Modified]: "Modified",
} satisfies Record<FileChange, string>;

export interface ChangedFile {
  path: string;
  change: FileChange;
}

/** Lists the files of a task that a commit would include. */
export function changedFiles(status: TaskGitStatus): ChangedFile[] {
  return [
    ...status.untracked.map((path) => ({ path, change: FileChange.New })),
    ...status.unstaged.map((path) => ({ path, change: FileChange.Modified })),
    ...status.staged.map((path) => ({ path, change: FileChange.Modified })),
  ];
}
