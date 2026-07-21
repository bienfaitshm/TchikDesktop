import { useCallback } from "react";
import { useGenericSearchOptions } from "../base";
import type { UserFilter } from "@/packages/@core/data-access/schema-validations";
import { useGetUsersAsOptions } from "./user";
import { USER_ROLE_ENUM } from "@/packages/@core/data-access/db/options";

export interface UserSearchContextParams {}

export function useSearchUsers() {
  const buildSearchQuery = useCallback(
    (search: string): UserFilter => ({
      limit: 25,
      where: {
        users: {
          role: {
            $eq: USER_ROLE_ENUM.STUDENT,
          },
        },
      },
      or: [
        {
          users: {
            lastName: {
              $like: `%${search}%`,
            },
          },
        },
        {
          users: {
            middleName: {
              $like: `%${search}%`,
            },
          },
        },
        {
          users: {
            firstName: {
              $like: `%${search}%`,
            },
          },
        },
      ],
      orderBy: [
        { table: "users", column: "lastName", order: "asc" as const },
        { table: "users", column: "middleName", order: "asc" as const },
        { table: "users", column: "firstName", order: "asc" as const },
      ],
    }),
    [],
  );

  return useGenericSearchOptions(useGetUsersAsOptions, buildSearchQuery);
}
