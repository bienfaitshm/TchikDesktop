import React from "react";
import type { SearchLocalRoomQueryParams } from "@/packages/@core/apis/clients";
import { useDebounce } from "../base";
import { useGetLocalRoomsAsOption } from "./seating";

export interface UseSearchLocalRoom {
  /** Filtres additionnels optionnels pour restreindre la recherche */
  filters?: SearchLocalRoomQueryParams["filters"];
  /** Délai de debounce en millisecondes (par défaut: 300ms) */
  debounceMs?: number;
}

export function useSearchLocalRooms(options: UseSearchLocalRoom = {}) {
  const { filters, debounceMs = 300 } = options;

  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedSearch = useDebounce(searchQuery, debounceMs);

  const queryParams = React.useMemo<SearchLocalRoomQueryParams>(
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
  } = useGetLocalRoomsAsOption(queryParams);

  return {
    searchQuery,
    options: data,
    isSearching: isLoading || isFetching,
    setSearchQuery,
  };
}
