import React from "react";
import type { SearchUserQueryParams } from "@/packages/@core/apis/clients";
import { useDebounce } from "../base";
import { useGetUsersAsOptions } from "./user";

export interface UseSearchUsersOptions {
  /** Filtres additionnels optionnels pour restreindre la recherche */
  filters?: SearchUserQueryParams["filters"];
  /** Délai de debounce en millisecondes (par défaut: 300ms) */
  debounceMs?: number;
}

export function useSearchUsers(options: UseSearchUsersOptions = {}) {
  const { filters, debounceMs = 300 } = options;

  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedSearch = useDebounce(searchQuery, debounceMs);

  const queryParams = React.useMemo<SearchUserQueryParams>(
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
  } = useGetUsersAsOptions(queryParams);

  return {
    searchQuery,
    options: data,
    isSearching: isLoading || isFetching,
    setSearchQuery,
  };
}
