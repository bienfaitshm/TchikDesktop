import {
  useSuspenseQuery,
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";
import { appInfos, search as searchApis } from "@/renderer/libs/apis";
import type { SearchEngineParams } from "@/packages/@core/data-access/schema-validations";
import type {
  SearchSuggestion,
  Preview,
} from "@/packages/@core/data-access/db";

/**
 * Centralized query keys factory for React Query cache management.
 */
export const applicationKeys = {
  all: ["schools", "search-engine"] as const,
  system: ["system-info"] as const,
  search: (params?: SearchEngineParams) =>
    params
      ? ([...applicationKeys.all, "home", params] as const)
      : ([...applicationKeys.all, "home"] as const),
  searchDetail: (params?: SearchEngineParams) =>
    params
      ? ([...applicationKeys.all, "detail", params] as const)
      : ([...applicationKeys.all, "detail"] as const),
} as const;

/**
 * Custom hook to fetch system information using React Query suspense mode.
 * @returns The suspense query result containing system information payload.
 */
export function useGetSystemInfo() {
  return useSuspenseQuery({
    queryKey: applicationKeys.system,
    queryFn: () => appInfos.fetchSystemInfos(),
  });
}

/**
 * Custom hook to manage search input state and fetch dynamic search results.
 * @param params - Search input query parameters and contextual boundaries.
 * @returns React Query result carrying matching search suggestions.
 */
export function useSearchEngineQuery(
  params: SearchEngineParams,
): UseQueryResult<SearchSuggestion[]> {
  return useQuery({
    queryKey: applicationKeys.search(params),
    queryFn: () => searchApis.search(params),
    enabled: Boolean(params.search && params.search.trim().length > 1),
  });
}

/**
 * Custom hook to fetch detailed preview information for a specific user.
 * @param params - Contextual parameters containing target user ID in search field.
 * @returns React Query result carrying user Preview details or null.
 */
export function useGetPreviewOfUserQuery(
  params: SearchEngineParams,
): UseQueryResult<Preview | null> {
  return useQuery({
    queryKey: applicationKeys.searchDetail(params),
    queryFn: () => searchApis.getPreviewOfUser(params),
    enabled: Boolean(params.search && params.search.trim().length > 0),
  });
}
