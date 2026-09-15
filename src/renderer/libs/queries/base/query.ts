import { useState } from "react";
import {
  useMutation as useMutationTQ,
  useSuspenseQuery as useSuspenseQueryTQ,
  type UseSuspenseQueryOptions,
  type UseMutationOptions,
  type UseMutationResult,
  type QueryClient,
  type DefaultError,
  type MutationKey,
  type QueryKey,
  type UseSuspenseQueryResult,
} from "@tanstack/react-query";
import { useDebounce } from "./utils";

export type SearchOptionReturn<TData> = {
  searchQuery: string;
  options: TData[];
  isSearching: boolean;
  setSearchQuery(search: string): void;
};

export interface SearchHookOptions<TFilters = Record<string, unknown>> {
  /** Optional additional filters to narrow search results */
  filters?: TFilters;
  /** Debounce delay in milliseconds (default: 300ms) */
  debounceMs?: number;
}

/**
 * Combines search text and extra filters into final query parameters.
 * @param search - The debounced search string input.
 * @param querySearch - Strategy function mapping search text to filters.
 * @param extraFilters - Optional secondary filter parameters.
 * @returns Combined filter parameters for the query.
 */
export function buildSearchParams<TFilters>(
  search: string,
  querySearch: (search: string, extraFilters?: TFilters) => TFilters,
  extraFilters?: TFilters,
): TFilters {
  return querySearch(search, extraFilters);
}

/**
 * Enriches a mutation result object with its mutation key.
 * @param result - Mutation result from TanStack Query.
 * @param key - Optional mutation key to append.
 * @returns Enhanced mutation result with mutationKey property.
 */
export function enrichWithMutationKey<TData, TError, TVariables, TContext>(
  result: UseMutationResult<TData, TError, TVariables, TContext>,
  key?: MutationKey,
): UseMutationResult<TData, TError, TVariables, TContext> & {
  readonly mutationKey: MutationKey | undefined;
} {
  return Object.assign(result, { mutationKey: key });
}

/**
 * Enriches a suspense query result object with its query key.
 * @param result - Suspense query result from TanStack Query.
 * @param key - Query key to append.
 * @returns Enhanced query result with queryKey property.
 */
export function enrichWithQueryKey<TQueryFnData, TError, TData>(
  result: UseSuspenseQueryResult<TData, TError>,
  key: QueryKey,
): UseSuspenseQueryResult<TData, TError> & {
  readonly queryKey: QueryKey;
} {
  return Object.assign(result, { queryKey: key });
}

/**
 * Executes a TanStack mutation and attaches the mutation key to the output.
 * @param options - TanStack useMutation hook options.
 * @param queryClient - Optional custom QueryClient instance.
 * @returns Enhanced mutation result with mutationKey.
 */
export function useMutation<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>,
  queryClient?: QueryClient,
): UseMutationResult<TData, TError, TVariables, TContext> & {
  readonly mutationKey: MutationKey | undefined;
} {
  const mutationResult = useMutationTQ(options, queryClient);
  return enrichWithMutationKey(mutationResult, options.mutationKey);
}

/**
 * Executes a TanStack suspense query and attaches the query key to the output.
 * @param options - TanStack useSuspenseQuery hook options.
 * @param queryClient - Optional custom QueryClient instance.
 * @returns Enhanced suspense query result with queryKey.
 */
export function useSuspenseQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
>(
  options: UseSuspenseQueryOptions<TQueryFnData, TError, TData>,
  queryClient?: QueryClient,
): UseSuspenseQueryResult<TData, TError> & {
  readonly queryKey: QueryKey;
} {
  const queryResult = useSuspenseQueryTQ(options, queryClient);
  return enrichWithQueryKey(queryResult, options.queryKey);
}

/**
 * Handles debounced search input state and executes a custom query hook.
 * @param useQueryHook - Target hook performing the query execution.
 * @param querySearch - Function mapping text to query parameters.
 * @param options - Search configuration options.
 * @returns Active search state, options payload, loading flag, and state setter.
 */
export function useGenericSearchOptions<TData, TFilters>(
  useQueryHook: (filters: TFilters) => {
    data?: TData[];
    isLoading: boolean;
    isFetching: boolean;
  },
  querySearch: (search: string, extraFilters?: TFilters) => TFilters,
  options: SearchHookOptions<TFilters> = {},
): SearchOptionReturn<TData> {
  const { filters, debounceMs = 300 } = options;

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, debounceMs);

  const queryParams = buildSearchParams(debouncedSearch, querySearch, filters);

  const { data = [], isLoading, isFetching } = useQueryHook(queryParams);

  return {
    searchQuery,
    options: data,
    isSearching: isLoading || isFetching,
    setSearchQuery,
  };
}
