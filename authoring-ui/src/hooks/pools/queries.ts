import { queryOptions, useQuery } from "@tanstack/react-query";
import { poolAPI } from "@api";
import { poolKeys } from "./keys";

const poolsQuery = () =>
  queryOptions({
    queryKey: poolKeys.all,
    queryFn: () => poolAPI.fetchPools(),
  });

export function usePools() {
  return useQuery(poolsQuery());
}
