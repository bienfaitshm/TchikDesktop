import { useSuspenseQueries } from "@tanstack/react-query";
import * as api from "@/renderer/libs/apis/statistiques";
import type { WithSchoolAndYearId } from "@/commons/types/services";

/**
 * Hook pour récupérer toutes les statistiques du tableau de bord.
 * Les requêtes sont exécutées en parallèle et gèrent la suspension.
 *
 * @param {WithSchoolAndYearId} params - Les paramètres de l'école et de l'année scolaire.
 * @returns Le résultat des requêtes sous forme de tableau, avec chaque élément correspondant à une requête.
 */
export const useDashboardStatistics = (params: WithSchoolAndYearId) => {
  return useSuspenseQueries({
    queries: [
      {
        queryKey: ["totalStudents", params],
        queryFn: () => api.getTotalStudentsInSchool(params),
      },
      {
        queryKey: ["studentsBySection", params],
        queryFn: () => api.getStudentsBySection(params),
      },
      {
        queryKey: ["secondaryStudentsByOption", params],
        queryFn: () => api.getStudentsByOptionForSecondary(params),
      },
      {
        queryKey: ["genderCountByClassAndSection", params],
        queryFn: () => api.getGenderCountByClassAndSection(params),
      },
    ],
  });
};
