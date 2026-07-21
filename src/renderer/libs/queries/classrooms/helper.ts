import { useGetClassroomAsOptions } from "./classroom";
import { useCallback } from "react";
import { useGenericSearchOptions } from "../base";
import type { ClassroomFilter } from "@/packages/@core/data-access/schema-validations";

export interface ClassroomSearchContextParams {
  schoolId: string;
}

export function useSearchClassrooms(options: ClassroomSearchContextParams) {
  const { schoolId } = options;

  const buildSearchQuery = useCallback(
    (search: string): ClassroomFilter => ({
      limit: 25,
      where: {
        classrooms: {
          schoolId: {
            $eq: schoolId,
          },
        },
      },
      or: [
        {
          classrooms: {
            identifier: {
              $like: `%${search}%`,
            },
          },
        },
        {
          classrooms: {
            shortIdentifier: {
              $like: `%${search}%`,
            },
          },
        },
      ],
      orderBy: [
        { table: "classrooms", column: "identifier", order: "asc" as const },
        {
          table: "classrooms",
          column: "shortIdentifier",
          order: "asc" as const,
        },
      ],
    }),
    [schoolId],
  );

  return useGenericSearchOptions(useGetClassroomAsOptions, buildSearchQuery);
}
