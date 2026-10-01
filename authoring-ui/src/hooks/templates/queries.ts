import { queryOptions, useQuery } from "@tanstack/react-query";
import { templateAPI } from "@api";
import { templateKeys } from "./keys";

const templatesQuery = () =>
  queryOptions({
    queryKey: templateKeys.all,
    queryFn: () => templateAPI.fetchTemplates(),
  });

export function useTemplates() {
  return useQuery(templatesQuery());
}
