import { useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";
import type { UseSuspenseQueryOptions } from "@tanstack/react-query";
import { stats as apis, enrollment } from "@/renderer/libs/apis";
import type { TStatsFilter } from "@/packages/@core/data-access/schema-validations";
import type {
  ChartDataPoint,
  ClassStatsDTO,
  EnrollmentStatsByYear,
  StatsSummary,
} from "@/packages/@core/data-access/db/queries";

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
  totalStudents: (schoolId: string, yearId: string) =>
    [...statsKeys.all, "totalStudents", { schoolId, yearId }] as const,
  enrollmentsByYear: (schoolId: string) =>
    [...statsKeys.all, "enrollmentsByYear", { schoolId }] as const,
  enrollmentHistory: (schoolId: string, yearId: string) => [
    ...statsKeys.all,
    "histories",
    { schoolId, yearId },
  ],
} as const;

/**
 * Hook synchronisé pour récupérer l'ensemble des analytics du dashboard.
 * Utilise le mode Suspense pour garantir la parallélisation et la préparation des données.
 */
export function useDashboardStatistics(params: TStatsFilter) {
  const { schoolId, yearId } = params;

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
      {
        queryKey: statsKeys.totalStudents(schoolId, yearId),
        queryFn: () => apis.fetchTotalStudents({ schoolId, yearId }),
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: statsKeys.enrollmentsByYear(schoolId),
        queryFn: () => apis.fetchEnrollmentsByYear(schoolId),
        staleTime: 1000 * 60 * 10,
      },

      {
        queryKey: statsKeys.enrollmentHistory(schoolId, yearId),
        queryFn: () =>
          enrollment.fetchEnrollments({
            where: { yearId, schoolId },
            orderBy: [{ column: "createdAt", order: "desc" }],
            limit: 5,
          }),
        staleTime: 1000 * 60 * 10,
      },
    ],
  });

  return {
    summary: results[0].data,
    statusDistribution: results[1].data,
    genderDistribution: results[2].data,
    studentsByClass: results[3].data,
    studentsByOption: results[4].data,
    retentionData: results[5].data,
    totalStudents: results[6].data,
    enrollmentsByYear: results[7].data,
    enrollmentHistories: results[8].data,
    isRefetching: results.some((r) => r.isFetching),
  };
}

/**
 * Récupère les KPIs rapides (Total, Actifs, Exclus)
 */
export function useGetStatsSummary(
  params: TStatsFilter,
  options?: Partial<UseSuspenseQueryOptions<StatsSummary>>,
) {
  return useSuspenseQuery({
    queryKey: statsKeys.summary(params.schoolId, params.yearId),
    queryFn: () => apis.fetchSummary(params),
    ...options,
  });
}

/**
 * Récupère la répartition par statut (Actif, Abandon, Exclu)
 */
export function useGetStatsByStatus(
  params: TStatsFilter,
  options?: Partial<UseSuspenseQueryOptions<ChartDataPoint[]>>,
) {
  return useSuspenseQuery({
    queryKey: statsKeys.status(params.schoolId, params.yearId),
    queryFn: () => apis.fetchByStatus(params),
    ...options,
  });
}

/**
 * Récupère la répartition par genre
 */
export function useGetStatsByGender(
  schoolId: string,
  options?: Partial<UseSuspenseQueryOptions<ChartDataPoint[]>>,
) {
  return useSuspenseQuery({
    queryKey: statsKeys.gender(schoolId),
    queryFn: () => apis.fetchByGender(schoolId),
    ...options,
  });
}

/**
 * Récupère le nombre d'élèves par classe
 */
export function useGetStatsByClass(
  params: TStatsFilter,
  options?: Partial<UseSuspenseQueryOptions<ClassStatsDTO[]>>,
) {
  return useSuspenseQuery({
    queryKey: statsKeys.class(params.schoolId, params.yearId),
    queryFn: () => apis.fetchByClass(params),
    ...options,
  });
}

/**
 * Récupère le nombre d'élèves par option
 */
export function useGetStatsByOption(
  params: TStatsFilter,
  options?: Partial<UseSuspenseQueryOptions<ChartDataPoint[]>>,
) {
  return useSuspenseQuery({
    queryKey: statsKeys.option(params.schoolId, params.yearId),
    queryFn: () => apis.fetchByOption(params),
    ...options,
  });
}

/**
 * Récupère les données de rétention (Anciens vs Nouveaux)
 */
export function useGetRetention(
  params: TStatsFilter,
  options?: Partial<UseSuspenseQueryOptions<ChartDataPoint[]>>,
) {
  return useSuspenseQuery({
    queryKey: statsKeys.retention(params.schoolId, params.yearId),
    queryFn: () => apis.fetchRetention(params),
    ...options,
  });
}

/**
 * Récupère le nombre total d'élèves
 */
export function useGetTotalStudents(
  params: TStatsFilter,
  options?: Partial<UseSuspenseQueryOptions<number>>,
) {
  return useSuspenseQuery({
    queryKey: statsKeys.totalStudents(params.schoolId, params.yearId),
    queryFn: () => apis.fetchTotalStudents(params),
    ...options,
  });
}

/**
 * Récupère les inscriptions par année avec détails H/F
 */
export function useGetEnrollmentsByYear(
  schoolId: string,
  options?: Partial<UseSuspenseQueryOptions<EnrollmentStatsByYear[]>>,
) {
  return useSuspenseQuery({
    queryKey: statsKeys.enrollmentsByYear(schoolId),
    queryFn: () => apis.fetchEnrollmentsByYear(schoolId),
    ...options,
  });
}
