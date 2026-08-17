import { USER_ROLE_ENUM } from "@/packages/@core/data-access/db/options";
import { useCallback } from "react";
import { useGenericSearchOptions } from "../base";
import { useGetUsersAsOptions as useFetchUsers } from "./user";
import type { UserFilter } from "@/packages/@core/data-access/schema-validations";

/**
 * Builds a search query filter targeting students with optional multi-term name matching.
 * @param search - Raw search string typed by the user.
 * @param limit - Maximum number of student records to retrieve. Defaults to 25.
 * @returns Fully constructed UserFilter object scoped to student users.
 */
export function buildStudentSearchQuery(
  search: string,
  limit: number = 25,
): UserFilter {
  const sanitizedSearch = search.trim();
  const searchTerms = sanitizedSearch ? sanitizedSearch.split(/\s+/) : [];

  const baseQuery: UserFilter = {
    limit,
    where: {
      users: {
        role: USER_ROLE_ENUM.STUDENT,
      },
    },
    orderBy: [
      { table: "users", column: "lastName", order: "asc" },
      { table: "users", column: "middleName", order: "asc" },
      { table: "users", column: "firstName", order: "asc" },
    ],
  };

  if (searchTerms.length === 0) {
    return baseQuery;
  }

  const wordFilters: UserFilter["or"] = searchTerms.flatMap((term) => [
    { users: { lastName: { $like: `%${term}%` } } },
    { users: { middleName: { $like: `%${term}%` } } },
    { users: { firstName: { $like: `%${term}%` } } },
  ]);

  return {
    ...baseQuery,
    or: wordFilters,
  };
}

/**
 * Custom React hook providing debounced search options for student selection components.
 * @returns Object containing search state, option results, loading indicator, and query updater.
 */
export function useSearchStudents() {
  const buildSearchQuery = useCallback(
    (search: string): UserFilter => buildStudentSearchQuery(search),
    [],
  );

  return useGenericSearchOptions(useFetchUsers, buildSearchQuery, {
    debounceMs: 300,
  });
}
