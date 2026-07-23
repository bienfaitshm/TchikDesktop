import { useCallback } from "react";
import { useGenericSearchOptions } from "../base";
import { useSearchEnrollments as useFetchEnrollments } from "./enrollments";
import type { EnrollmentFilter } from "@/packages/@core/data-access/schema-validations";

export interface EnrollmentSearchContextParams {
  yearId: string;
  schoolId: string;
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
    (search: string): EnrollmentFilter => ({
      limit: 25,
      where: {
        classroomEnrollments: {
          yearId: {
            $eq: yearId,
          },
          schoolId: {
            $eq: schoolId,
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
    [schoolId, yearId],
  );

  return useGenericSearchOptions(useFetchEnrollments, buildSearchQuery, {
    debounceMs: 300,
  });
}
