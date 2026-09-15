import { useCallback } from "react";
import { useSearchEngineQuery } from "./apps";
import { useGenericSearchOptions } from "../base";
import type { SearchEngineParams } from "@/packages/@core/data-access/schema-validations";

/**
 * Options for configuring the search engine hook execution.
 */
export interface UseSearchEngineOptions extends Omit<
  SearchEngineParams,
  "search"
> {
  /** Debounce delay in milliseconds before triggering the query (default: 300ms) */
  debounceMs?: number;
  search?: string;
}

/**
 * Encapsulates search functionality for educational entities with debounced input and custom scope filters.
 * @param options - Configuration options including target school, academic year, result limit, and debounce timing.
 * @returns Search query state, options list, loading indicator, and query setter function.
 */
export function useSearchEngine(options: UseSearchEngineOptions) {
  const {
    schoolId,
    yearId,
    limit = 50,
    debounceMs,
    search: externalSearch,
  } = options;

  const buildSearchQuery = useCallback(
    (search: string): SearchEngineParams => ({
      limit,
      schoolId,
      search: search ?? externalSearch,
      yearId,
    }),
    [limit, schoolId, yearId],
  );

  return useGenericSearchOptions(useSearchEngineQuery, buildSearchQuery, {
    debounceMs,
  });
}
