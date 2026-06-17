import { useSuspenseQueries } from "@tanstack/react-query";
import { stats as apis } from "@/renderer/libs/apis";
import type { TStatsFilter } from "@/packages/@core/data-access/schema-validations";

export const statsKeys = {
  all: ["stats"] as const,
  summary: (schoolId: string, yearId: string) =>
    [...statsKeys.all, "summary", { schoolId, yearId }] as const,
  status: (schoolId: string, yearId: string) =>
    [...statsKeys.all, "status", { schoolId, yearId }] as const,
  gender: (schoolId: string) =>
    [...statsKeys.all, "gender", { schoolId }] as const,
  class: (schoolId: string, yearId: string) =>
    [...statsKeys.all, "class", { schoolId, yearId }] as const,
  option: (schoolId: string, yearId: string) =>
    [...statsKeys.all, "option", { schoolId, yearId }] as const,
  retention: (schoolId: string, yearId: string) =>
    [...statsKeys.all, "retention", { schoolId, yearId }] as const,
} as const;

/**
 * Hook synchronisé pour récupérer l'ensemble des analytics du dashboard.
 * Utilise le mode Suspense pour garantir la parallélisation et la préparation des données.
 */
export function useDashboardStatistics(params: TStatsFilter) {
  const { schoolId, yearId } = params;
  // const isEnabled = Boolean(schoolId && yearId);

  const results = useSuspenseQueries({
    queries: [
      {
        queryKey: statsKeys.summary(schoolId, yearId),
        queryFn: () => apis.fetchSummary({ schoolId, yearId }),
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: statsKeys.status(schoolId, yearId),
        queryFn: () => apis.fetchByStatus({ schoolId, yearId }),
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: statsKeys.gender(schoolId),
        queryFn: () => apis.fetchByGender(schoolId),
        staleTime: 1000 * 60 * 10,
      },
      {
        queryKey: statsKeys.class(schoolId, yearId),
        queryFn: () => apis.fetchByClass({ schoolId, yearId }),
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: statsKeys.option(schoolId, yearId),
        queryFn: () => apis.fetchByOption({ schoolId, yearId }),
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: statsKeys.retention(schoolId, yearId),
        queryFn: () => apis.fetchRetention({ schoolId, yearId }),
        staleTime: 1000 * 60 * 5,
      },
    ],
  });

  /**
   * Performance Senior : On évite la déstructuration brute de tableau à la volée.
   * On extrait les données de manière stable. Si une seule requête change,
   * seules les propriétés associées changeront de référence mémoire.
   */
  return {
    summary: results[0].data,
    statusDistribution: results[1].data,
    genderDistribution: results[2].data,
    studentsByClass: results[3].data,
    studentsByOption: results[4].data,
    retentionData: results[5].data,
    isRefetching: results.some((r) => r.isFetching),
  };
}
