import { useSuspenseQueries } from "@tanstack/react-query";
import { stats as apis } from "@/renderer/libs/apis";
import type { TStatsFilter } from "@/packages/@core/data-access/schema-validations";

/**
 * 1. Pour toute l'ecole (garcon et fille; total d'eleve inscrit)
 * 2. pour toute l'ecole (liste des sections avec le nombre d'eleve inscrit)
 * 3. Pour chaque section (liste de classe avec le nombre de file et garcons inscrit)
 * 4. pour la section secondaire (liste d'option avec le nombre d'eleve inscrit)
 * 5. Pour une classe (le nombre de file et garcons inscrit)
 * 6. Pour une classe (le nombre de file et garcons pour chaque statut d'inscription ex. ENCOURS, ABANDON)
 * 7. Historique d'inscriptions pour une ecole, l'annee scolaire ou une classe
 * @returns
 */

/**
 * Hook synchronisé pour récupérer l'ensemble des analytics du dashboard.
 * Utilise le mode Suspense pour garantir que les données sont prêtes avant le rendu.
 * * @param {TStatsFilter} params - L'ID de l'école et de l'année scolaire active.
 */
export const useDashboardStatistics = (params: TStatsFilter) => {
  const { schoolId, yearId } = params;

  const [
    { data: summary },
    { data: statusDistribution },
    { data: genderDistribution },
    { data: studentsByClass },
    { data: studentsByOption },
    { data: retentionData },
  ] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["stats", "summary", schoolId, yearId],
        queryFn: () => apis.fetchSummary({ schoolId, yearId }),
      },
      {
        queryKey: ["stats", "status", schoolId, yearId],
        queryFn: () => apis.fetchByStatus({ schoolId, yearId }),
      },
      {
        queryKey: ["stats", "gender", schoolId],
        queryFn: () => apis.fetchByGender(schoolId),
      },
      {
        queryKey: ["stats", "class", schoolId, yearId],
        queryFn: () => apis.fetchByClass({ schoolId, yearId }),
      },
      {
        queryKey: ["stats", "option", schoolId, yearId],
        queryFn: () => apis.fetchByOption({ schoolId, yearId }),
      },
      {
        queryKey: ["stats", "retention", schoolId, yearId],
        queryFn: () => apis.fetchRetention({ schoolId, yearId }),
      },
    ],
  });

  return {
    summary, // { total, active, excluded }
    statusDistribution, // ChartDataPoint[]
    genderDistribution, // ChartDataPoint[]
    studentsByClass, // ClassStatsDTO[]
    studentsByOption, // ChartDataPoint[]
    retentionData, // ChartDataPoint[]
  };
};
