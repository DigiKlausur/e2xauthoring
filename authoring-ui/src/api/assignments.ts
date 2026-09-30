import { config } from "@/config";
import { requests } from "./client";
import { urlJoin } from "./http";
import type { Assignment } from "./types";

// Assignments belong to nbgrader, so these calls go to the formgrader API,
// which answers plain JSON and signals failures with HTTP status codes.

export const assignmentAPI = {
  fetchAssignments: async (): Promise<Assignment[]> =>
    requests.get<Assignment[]>(
      urlJoin(config.formgraderApiUrl, "assignments"),
      { include_score: false },
    ),
  /**
   * @param duedate UTC timestamp `YYYY-MM-DDTHH:MM`, or null for no due date.
   *   nbgrader reads a due date without a timezone as UTC.
   */
  createAssignment: async (
    name: string,
    duedate: string | null,
  ): Promise<Assignment> =>
    requests.put<Assignment>(
      urlJoin(config.formgraderApiUrl, "assignment", name),
      duedate === null ? {} : { duedate_notimezone: duedate },
    ),
};
