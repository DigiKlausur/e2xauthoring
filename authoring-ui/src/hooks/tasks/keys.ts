export const taskKeys = {
  all: ["tasks"] as const,
  /** Tasks of every pool, as the worksheet task picker lists them. */
  allPools: ["tasks", "all-pools"] as const,
  pool: (pool: string) => ["tasks", "pool", pool] as const,
  task: (pool: string, task: string) => ["tasks", "pool", pool, task] as const,
  diff: (pool: string, task: string, file: string) =>
    ["tasks", "pool", pool, task, "diff", file] as const,
};
