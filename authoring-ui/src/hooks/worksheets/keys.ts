export const worksheetKeys = {
  all: ["worksheets"] as const,
  assignment: (assignment: string) => ["worksheets", assignment] as const,
};
