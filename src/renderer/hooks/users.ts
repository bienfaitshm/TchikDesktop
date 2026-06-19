import React from "react";
import { useGetUsersAsOptions } from "@/renderer/libs/queries/users";
import type { SearchUserQueryParams } from "@/packages/@core/apis/clients";
import { useDebounce } from "./utils";

export function useQuerySearchUsers(params?: SearchUserQueryParams) {
  const { data: options = [], isLoading } = useGetUsersAsOptions(params);

  return {
    options,
    isLoading,
  };
}

export function useSearchUsers(
  params?: Pick<SearchUserQueryParams, "filters">,
) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { options, isLoading } = useQuerySearchUsers({
    search: debouncedSearch,
    filters: params?.filters,
  });
  return {
    searchQuery,
    options,
    isLoading,
    onSearchValue: setSearchQuery,
  };
}
