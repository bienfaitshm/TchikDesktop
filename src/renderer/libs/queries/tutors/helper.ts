import { useCallback } from "react";
import { useGenericSearchOptions } from "../base";
import { useGetTutorsAsOptions as useFetchTutors } from "./tutors";
import type { TutorFilter } from "@/packages/@core/data-access/schema-validations";
import { USER_ROLE_ENUM } from "@/packages/@core/data-access/db/options";

/**
 * Parameters required to scope the tutor search context.
 */
export interface TutorSearchContextParams {
  /** Unique identifier of the target school. */
  schoolId: string;
}

/**
 * Builds a tutor filter query with multi-term name matching scoped to a school.
 * @param search - Raw search string entered by the user.
 * @param schoolId - Unique identifier of the target school.
 * @param limit - Maximum number of records to return. Defaults to 25.
 * @returns Fully constructed TutorFilter object.
 */
export function buildTutorSearchQuery(
  search: string,
  schoolId: string,
  limit: number = 25,
): TutorFilter {
  const sanitizedSearch = search.trim();
  const searchTerms = sanitizedSearch ? sanitizedSearch.split(/\s+/) : [];

  const baseQuery: TutorFilter = {
    limit,
    where: {
      tutors: {
        schoolId,
      },
      users: {
        role: USER_ROLE_ENUM.TUTOR,
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

  const wordFilters: TutorFilter["or"] = searchTerms.flatMap((term) => [
    { users: { lastName: { $like: `%${term}%` } } },
    { users: { middleName: { $like: `%${term}%` } } },
    { users: { firstName: { $like: `%${term}%` } } },
    { tutors: { address: { $like: `%${term}%` } } },
    { tutors: { phoneNumber: { $like: `%${term}%` } } },
    { tutors: { profession: { $like: `%${term}%` } } },
  ]);

  return {
    ...baseQuery,
    or: wordFilters,
  };
}

/**
 * Custom React hook for debounced tutor option searching within a school context.
 * @param params - Object containing the target school identifier.
 * @returns Search query state, matching options, loading state, and search setter.
 */
export function useSearchTutors({ schoolId }: TutorSearchContextParams) {
  const buildSearchQuery = useCallback(
    (search: string): TutorFilter => buildTutorSearchQuery(search, schoolId),
    [schoolId],
  );

  return useGenericSearchOptions(useFetchTutors, buildSearchQuery, {
    debounceMs: 300,
  });
}
