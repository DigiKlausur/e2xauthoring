import type { Assignment } from "@api/types";
import type { StatusTone } from "./gitStatus";

export const AssignmentStatus = {
  Draft: "draft",
  Released: "released",
  // nbgrader has no "returned" status: an assignment that went back to draft
  // after students submitted is shown as returned.
  Returned: "returned",
} as const;

export type AssignmentStatus =
  (typeof AssignmentStatus)[keyof typeof AssignmentStatus];

export const assignmentStatusLabels = {
  [AssignmentStatus.Draft]: { label: "Draft", tone: "info" },
  [AssignmentStatus.Released]: { label: "Released", tone: "warning" },
  [AssignmentStatus.Returned]: { label: "Returned", tone: "success" },
} satisfies Record<AssignmentStatus, { label: string; tone: StatusTone }>;

export function assignmentStatus(assignment: Assignment): AssignmentStatus {
  if (assignment.status === "draft" && assignment.num_submissions > 0) {
    return AssignmentStatus.Returned;
  }
  return assignment.status;
}
