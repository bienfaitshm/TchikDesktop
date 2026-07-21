import { useCallback } from "react";
import { useGenericSearchOptions } from "../base";
import type { LocalroomFilter } from "@/packages/@core/data-access/schema-validations";
import { useGetLocalRoomsAsOption } from "./seating";

export interface LocalRoomSearchContextParams {
  schoolId: string;
}

export function useSearchLocalRooms(params: LocalRoomSearchContextParams) {
  const { schoolId } = params;

  const buildSearchQuery = useCallback(
    (search: string): LocalroomFilter => ({
      limit: 25,
      where: {
        localrooms: {
          schoolId: {
            $eq: schoolId,
          },
        },
      },
      or: [
        {
          localrooms: {
            name: {
              $like: `%${search}%`,
            },
          },
        },
      ],
      orderBy: [{ table: "localrooms", column: "name", order: "asc" as const }],
    }),
    [schoolId],
  );

  return useGenericSearchOptions(useGetLocalRoomsAsOption, buildSearchQuery);
}
