import { useCallback } from "react";
import { useGenericSearchOptions } from "../base";
import type { OptionFilter } from "@/packages/@core/data-access/schema-validations";
import { useGetOptionsAsOptions } from "./option";

export interface OptionSearchContextParams {
  schoolId: string;
}

export function useSearchOptions(params: OptionSearchContextParams) {
  const buildSearchQuery = useCallback(
    (search: string): OptionFilter => ({
      limit: 25,
      where: {
        options: {
          schoolId: params.schoolId,
        },
      },
      or: [
        {
          options: {
            optionName: {
              $like: `%${search}%`,
            },
          },
        },
        {
          options: {
            optionShortName: {
              $like: `%${search}%`,
            },
          },
        },
      ],
      orderBy: [
        { table: "options", column: "optionName", order: "asc" as const },
        { table: "options", column: "optionShortName", order: "asc" as const },
      ],
    }),
    [params.schoolId],
  );

  return useGenericSearchOptions(useGetOptionsAsOptions, buildSearchQuery);
}
