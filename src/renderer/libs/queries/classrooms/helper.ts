import React from "react";
import type { SearchClassroomQueryParams } from "@/packages/@core/apis/clients";
import { useDebounce } from "../base";
import { useGetClassroomAsOptions } from "./classroom";

export interface UseSearchClassroomsOptions {
  /** Filtres additionnels optionnels pour restreindre la recherche */
  filters?: SearchClassroomQueryParams["filters"];
  /** Délai de debounce en millisecondes (par défaut: 300ms) */
  debounceMs?: number;
}

export function useSearchClassrooms(options: UseSearchClassroomsOptions = {}) {
  const { filters, debounceMs = 300 } = options;

  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedSearch = useDebounce(searchQuery, debounceMs);

  const queryParams = React.useMemo<SearchClassroomQueryParams>(
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
  } = useGetClassroomAsOptions(queryParams);

  return {
    searchQuery,
    options: data,
    isSearching: isLoading || isFetching,
    setSearchQuery,
  };
}
