import { queryOptions, useQuery } from "@tanstack/react-query";
import { worksheetAPI } from "@api";
import { worksheetKeys } from "./keys";

const worksheetsQuery = (assignment: string) =>
  queryOptions({
    queryKey: worksheetKeys.assignment(assignment),
    queryFn: () => worksheetAPI.fetchWorksheets(assignment),
    enabled: !!assignment,
  });

export function useWorksheets(assignment: string) {
  return useQuery(worksheetsQuery(assignment));
}
