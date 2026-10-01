/*
 * Shapes of the data the backend sends and accepts.
 *
 * The frontend guide asks for these to be aliases of types generated from an
 * OpenAPI document. The authoring backend is a Tornado extension without one,
 * so until it gains an OpenAPI export these are written by hand from the
 * Python dataclasses in `e2xauthoring/dataclasses/` and the managers in
 * `e2xauthoring/managers/`. Keep them in sync with those files; the compiler
 * cannot catch drift here.
 */

// ── Git ─────────────────────────────────────────────────────────────────────

/** `Task.git_status["status"]` in `e2xauthoring/models/task.py`. */
export type GitStatusValue =
  "unchanged" | "modified" | "not version controlled";

/** `GitStatus` dataclass. The file lists are empty for `list_all`. */
export type TaskGitStatus = {
  status: GitStatusValue;
  untracked: string[];
  unstaged: string[];
  staged: string[];
};

/** `get_author()`: null when no global git author is configured. */
export type GitAuthor = { name: string; email: string } | null;

export type GitAuthorUpdate = { name: string; email: string };

/** `set_author()` answers without the usual action envelope. */
export type GitAuthorUpdateResult = { success: boolean; message?: string };

// ── Tasks and pools ─────────────────────────────────────────────────────────

/** `TaskRecord` dataclass. */
export type Task = {
  name: string;
  pool: string;
  points: number;
  n_questions: number;
  git_status: TaskGitStatus;
};

/** `PoolRecord` dataclass. */
export type Pool = {
  name: string;
  base_path: string;
  n_tasks: number;
  tasks: Task[];
  is_repo: boolean;
};

// ── Templates ───────────────────────────────────────────────────────────────

/** `TemplateRecord` dataclass. */
export type Template = {
  name: string;
  variables: string[];
};

// ── Assignments and worksheets ──────────────────────────────────────────────

/**
 * An assignment as nbgrader's formgrader API lists it. Only the fields the UI
 * reads are declared. `duedate` is an ISO timestamp in UTC without an offset.
 */
export type Assignment = {
  name: string;
  duedate: string | null;
  status: "draft" | "released";
  num_submissions: number;
};

/** `WorksheetManager.list()` entries. */
export type Worksheet = {
  name: string;
  assignment: string;
  link: string;
};

/** The `resources` argument of `WorksheetManager.create()`. */
export type WorksheetResources = {
  assignment: string;
  exercise: string;
  template: string | null;
  "template-options": Record<string, string>;
  exercise_options: WorksheetOptions;
  tasks: (Task & { task: string })[];
};

export type WorksheetOptions = {
  "task-headers": boolean;
  kernel?: string;
};

// ── Kernels ─────────────────────────────────────────────────────────────────

/** `KernelSpecManager().get_all_specs()`, keyed by kernel name. */
export type KernelSpecs = Record<
  string,
  { resource_dir: string; spec: { display_name: string; language: string } }
>;
