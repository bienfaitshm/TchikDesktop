import {
  TClassroom,
  TWithOption,
} from "@/packages/@core/data-access/db/models/types";
import { useMemo } from "react";

/**
 * Regroupe un tableau d'objets par une clé spécifique.
 */
function groupBy<T, K extends keyof T>(
  array: T[],
  key: K,
): Record<string, T[]> {
  return array.reduce(
    (accumulator, item) => {
      const groupKey = String(item[key]);

      if (!accumulator[groupKey]) {
        accumulator[groupKey] = [];
      }

      accumulator[groupKey].push(item);
      return accumulator;
    },
    {} as Record<string, T[]>,
  );
}

/**
 * Transforme un objet groupé (Record) en un tableau d'objets formaté.
 * On utilise les génériques pour mapper la "section" et les "data".
 */
function convertGroupedObjectToArray<T>(
  groupedObject: Record<string, T[]>,
): { section: string; data: T[] }[] {
  return Object.entries(groupedObject).map(([key, value]) => ({
    section: key,
    data: value,
  }));
}

interface ClassroomGroup {
  section: string;
  data: TWithOption<TClassroom>[];
}

export function useGetClassroomGroupedBySection(
  classrooms: TWithOption<TClassroom>[],
) {
  return useMemo<ClassroomGroup[]>(() => {
    if (!classrooms || classrooms.length === 0) return [];

    const groupedData = groupBy(classrooms, "section");
    return convertGroupedObjectToArray(groupedData);
  }, [classrooms]);
}
