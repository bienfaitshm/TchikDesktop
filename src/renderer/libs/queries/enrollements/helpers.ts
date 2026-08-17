import { useCallback } from "react";
import { useGenericSearchOptions } from "../base";
import { useSearchEnrollments as useFetchEnrollments } from "./enrollments";
import type { EnrollmentFilter } from "@/packages/@core/data-access/schema-validations";

export interface EnrollmentSearchContextParams {
  yearId: string;
  schoolId: string;
}

export interface UserFilter {
  lastName?: { $like: string };
  middleName?: { $like: string };
  firstName?: { $like: string };
}

export interface SearchQueryOptions {
  debounceMs?: number;
  limit?: number;
}

/**
 * Builds an enrollment filter query with multi-word name searching capabilities.
 * @param search - Raw search query string entered by the user.
 * @param schoolId - Unique identifier of the target school.
 * @param yearId - Unique identifier of the target academic year.
 * @param limit - Maximum number of enrollment records to retrieve.
 * @returns Fully constructed EnrollmentFilter query object.
 */
export function buildEnrollmentSearchQuery(
  search: string,
  schoolId: string,
  yearId: string,
  limit: number = 25,
): EnrollmentFilter {
  const sanitizedSearch = search.trim();
  const searchTerms = sanitizedSearch ? sanitizedSearch.split(/\s+/) : [];

  const baseQuery: EnrollmentFilter = {
    limit,
    where: {
      classroomEnrollments: {
        yearId,
        schoolId,
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

  // Each individual term in a multi-word search must match at least one name column
  const wordFilters: EnrollmentFilter["or"] = searchTerms.flatMap((term) => [
    { users: { lastName: { $like: `%${term}%` } } },
    { users: { middleName: { $like: `%${term}%` } } },
    { users: { firstName: { $like: `%${term}%` } } },
    // { classroomEnrollments: { studentCode: { $like: `%${term}%` } } },
  ]);
  // const result = searchTerms.flatMap((term) => [
  //     { users: { lastName: { $like: `%${term}%` } } },
  //     { users: { middleName: { $like: `%${term}%` } } },
  //     { users: { firstName: { $like: `%${term}%` } } },
  // ]);

  return {
    ...baseQuery,
    or: wordFilters,
  };
}

/**
 * Searches student enrollments with debounced name filtering scoped to school and year context.
 * @param params - Contextual filter parameters containing schoolId and yearId.
 * @returns Search query state, matching enrollment options, loading state, and search query setter.
 */
export function useSearchEnrollments({
  schoolId,
  yearId,
}: EnrollmentSearchContextParams) {
  const buildSearchQuery = useCallback(
    (search: string): EnrollmentFilter =>
      buildEnrollmentSearchQuery(search, schoolId, yearId),
    [schoolId, yearId],
  );

  return useGenericSearchOptions(useFetchEnrollments, buildSearchQuery, {
    debounceMs: 300,
  });
}
