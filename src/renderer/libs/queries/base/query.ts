import { useMemo, useRef, useState } from "react";
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

/**
 * Enriches the mutation result with its corresponding mutationKey for performance tracking.
 * @param options - TanStack useMutation hook options.
 * @param queryClient - Optional custom QueryClient instance.
 * @returns Enhanced mutation result containing the mutationKey property.
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
  const mutationKey = options.mutationKey;

  return useMemo(
    () => ({
      ...mutationResult,
      mutationKey,
    }),
    [mutationResult, mutationKey],
  );
}

/**
 * Returns the suspense query result alongside a stable queryKey reference.
 * @param options - TanStack useSuspenseQuery hook options.
 * @param queryClient - Optional custom QueryClient instance.
 * @returns Enhanced suspense query result containing the queryKey property.
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
  const queryKey = options.queryKey;

  return useMemo(
    () => ({
      ...queryResult,
      queryKey,
    }),
    [queryResult, queryKey],
  );
}

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
 * Generic search hook encapsulating debounced input handling and dynamic query fetching.
 * @param useQueryHook - Custom query hook executing the search operation.
 * @param querySearch - Function mapping search text to query filter parameters.
 * @param options - Search configuration options including filters and debounce timing.
 * @returns Search query state, formatted options, loading indicators, and setter function.
 */

export function useGenericSearchOptions<TData, TFilters>(
  useQueryHook: (filters?: TFilters) => {
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

  // 1. Référence stable pour querySearch (évite que les fonctions anonymes n'invalident le mémo)
  const querySearchRef = useRef(querySearch);
  querySearchRef.current = querySearch;

  // 2. Sérialisation optimisée des filtres
  const serializedFilters = useMemo(() => JSON.stringify(filters), [filters]);

  // 3. Calcul des paramètres combinant la recherche et les filtres
  const queryParams = useMemo(
    () => querySearchRef.current(debouncedSearch, filters),
    [debouncedSearch, serializedFilters],
  );

  const { data = [], isLoading, isFetching } = useQueryHook(queryParams);

  return {
    searchQuery,
    options: data,
    isSearching: isLoading || isFetching,
    setSearchQuery,
  };
}
