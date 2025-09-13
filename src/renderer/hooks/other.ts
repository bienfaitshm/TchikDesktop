import { TClassroom, TWithOption } from "@/commons/types/models";
import { convertGroupedObjectToArray, groupBy } from "@/commons/utils";
import { useMemo } from "react";

interface ClassroomGroup {
  section: string;
  data: TWithOption<TClassroom>[];
}

export function useGetClassroomGroupedBySection(
  classrooms: TWithOption<TClassroom>[]
) {
  return useMemo<ClassroomGroup[]>(() => {
    const groupedData = groupBy(classrooms, "section");
    return convertGroupedObjectToArray(groupedData);
  }, [classrooms]);
}
