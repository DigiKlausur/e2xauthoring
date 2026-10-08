import { queryOptions, useQuery } from "@tanstack/react-query";
import { assignmentAPI } from "@api";
import { assignmentKeys } from "./keys";

const assignmentsQuery = () =>
  queryOptions({
    queryKey: assignmentKeys.all,
    queryFn: () => assignmentAPI.fetchAssignments(),
  });

export function useAssignments() {
  return useQuery(assignmentsQuery());
}
