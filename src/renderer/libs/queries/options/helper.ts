import React from "react";
import type { SearchOptionQueryParams } from "@/packages/@core/apis/clients";
import { useDebounce } from "../base";
import { useGetOptionsAsOptions } from "./option";

export interface UseSearchOptions {
  /** Filtres additionnels optionnels pour restreindre la recherche */
  filters?: SearchOptionQueryParams["filters"];
  /** Délai de debounce en millisecondes (par défaut: 300ms) */
  debounceMs?: number;
}

export function useSearchOptions(options: UseSearchOptions = {}) {
  const { filters, debounceMs = 300 } = options;

  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedSearch = useDebounce(searchQuery, debounceMs);

  const queryParams = React.useMemo<SearchOptionQueryParams>(
    () => ({
      search: debouncedSearch,
      filters,
    }),
    [debouncedSearch, JSON.stringify(filters)],
  );

  const {
    data = [],
    isLoading,
    isFetching,
  } = useGetOptionsAsOptions(queryParams);

  return {
    searchQuery,
    options: data,
    isSearching: isLoading || isFetching,
    setSearchQuery,
  };
}
