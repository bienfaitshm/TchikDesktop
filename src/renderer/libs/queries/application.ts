import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { appInfos, search as searchApis } from "@/renderer/libs/apis";
import type { SearchEngineParams } from "@/packages/@core/data-access/schema-validations";
import { useCallback, useState } from "react";

/**
 * Centralized query keys factory for React Query cache management.
 */
export const applicationKeys = {
  all: ["schools", "search-engine"] as readonly unknown[],
  system: ["schools", "system-info"] as readonly unknown[],
  search: (params?: SearchEngineParams) =>
    params
      ? ([...applicationKeys.all, "home", params] as readonly unknown[])
      : ([...applicationKeys.all, "home"] as readonly unknown[]),
} as const;

/**
 * Custom hook to fetch system information using React Query suspense mode.
 * @returns The query result containing system information.
 */
export function useGetSystemInfo() {
  return useSuspenseQuery({
    queryKey: applicationKeys.system,
    queryFn: () => appInfos.fetchSystemInfos(),
  });
}

export type SearchEngineContext = Omit<SearchEngineParams, "search">;

/**
 * Custom hook to manage search input state and fetch dynamic search results.
 * @param options - Additional context parameters required for the search API.
 * @returns An object containing the current search query, update callback, and fetched results.
 */
export function useSearchEngine(options: SearchEngineContext) {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: results = [] } = useQuery({
    queryKey: applicationKeys.search({ ...options, search: searchQuery }),
    queryFn: () => searchApis.search({ ...options, search: searchQuery }),
  });

  const onChangeValue = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return {
    search: searchQuery,
    onChangeValue,
    results,
  };
}
