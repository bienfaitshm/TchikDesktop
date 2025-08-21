import { useMemo } from "react";
import { useGetClassrooms } from "@/renderer/libs/queries/classroom";
import { GetClassroomParams } from "@/commons/types/services";

type ClassroomOptions = {
  label?: "short" | "long" | "both";
};
export function useGetClassroomAsOptions(
  params: GetClassroomParams,
  options: ClassroomOptions = { label: "both" }
) {
  const { data: classrooms = [] } = useGetClassrooms(params);
  return useMemo(
    () =>
      classrooms.map((classroom) => {
        const label = `${classroom.identifier} (${classroom.shortIdentifier})`;
        return {
          value: classroom.classId,
          label:
            options.label === "long"
              ? classroom.identifier
              : options.label === "short"
                ? classroom.shortIdentifier
                : label,
        };
      }),
    [classrooms]
  );
}
