import React from "react";
import { useGetSearchUsers } from "@/renderer/libs/queries/account";
import { useDataToOptions, type DataToOptionOptions } from "./data-as-options";
import { useDebounce } from "./utils";

type SearchUsersParams = { name?: string; yearId?: string; schoolId: string };

export function useQuerySearchUsers(
  value: SearchUsersParams,
  config: DataToOptionOptions = { labelFormat: "long" },
) {
  const { data: users = [], isLoading } = useGetSearchUsers(value);
  console.log("users", { users });
  const options = useDataToOptions({
    data: users,
    valueKey: "userId",
    labelKeyLong: "fullName" as any,
    labelKeyShort: "lastName",
    options: config,
    transformOption: (baseOption, item) => ({
      ...baseOption,
      description: `sexe: ${item.gender}`,
    }),
  });

  return {
    options,
    isLoading,
  };
}

export function useSearchUsers(params: SearchUsersParams) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { options, isLoading } = useQuerySearchUsers({
    name: debouncedSearch,
    ...params,
  });
  return {
    searchQuery,
    options,
    isLoading,
    onSearchValue: setSearchQuery,
  };
}
