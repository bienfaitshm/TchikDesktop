import { useSuspenseQueries } from "@tanstack/react-query";
import * as api from "@/renderer/libs/apis/statistiques";
import type { WithSchoolAndYearId } from "@/commons/types/services";

/**
 * Hook pour récupérer toutes les statistiques du tableau de bord.
 * Les requêtes sont exécutées en parallèle et gèrent la suspension.
 *
 * @param {WithSchoolAndYearId} params - Les paramètres de l'école et de l'année scolaire.
 * @returns {object} Un objet contenant les données de chaque requête, déstructuré pour un accès facile.
 */
export const useDashboardStatistics = (params: WithSchoolAndYearId) => {
  const [
    { data: totalStudents },
    { data: studentsBySection },
    { data: secondaryStudentsByOption },
    { data: genderCountByClassAndSection },
  ] = useSuspenseQueries({
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

  return {
    totalStudents,
    studentsBySection,
    secondaryStudentsByOption,
    genderCountByClassAndSection,
  };
};
