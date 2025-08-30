import { useSuspenseQueries } from "@tanstack/react-query";
import * as apis from "@/renderer/libs/apis/statistiques";
import type { WithSchoolAndYearId } from "@/commons/types/services";

export const useDashboardStatistics = (params: WithSchoolAndYearId) => {
  return useSuspenseQueries({
    queries: [
      {
        queryKey: ["TOTAL_STUDENT", params],
        queryFn: () => apis.getTotalStudentsInSchool(params),
      },
      {
        queryKey: ["TOTAL_STUDENT_SECTION", params],
        queryFn: () => apis.getStudentsBySection(params),
      },
      {
        queryKey: ["FOR_SECONDARY", params],
        queryFn: () => apis.getStudentsByOptionForSecondary(params),
      },
    ],
  });
};
