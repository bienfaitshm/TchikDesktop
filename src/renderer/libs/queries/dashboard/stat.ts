import { useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";
import type { UseSuspenseQueryOptions } from "@tanstack/react-query";
import { stats as apis, enrollment } from "@/renderer/libs/apis";
import type { StatsFilter } from "@/packages/@core/data-access/schema-validations";
import type {
  ChartDataPoint,
  ClassStatsDTO,
  EnrollmentStatsByYear,
  StatsSummary,
} from "@/packages/@core/data-access/db/queries";

const STALE_TIME_SHORT = 1000 * 60 * 5; // 5 minutes
const STALE_TIME_LONG = 1000 * 60 * 10; // 10 minutes

/**
 * Query key factory for stats domain to ensure cache consistency across the application.
 */
export const statsKeys = {
  all: ["schools", "stats"] as const,
  summary: (schoolId: string, yearId: string) =>
    [...statsKeys.all, "summary", { schoolId, yearId }] as const,
  status: (schoolId: string, yearId: string) =>
    [...statsKeys.all, "status", { schoolId, yearId }] as const,
  gender: (schoolId: string, yearId: string) =>
    [...statsKeys.all, "gender", { schoolId, yearId }] as const,
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
  enrollmentHistory: (schoolId: string, yearId: string) =>
    [...statsKeys.all, "histories", { schoolId, yearId }] as const,
} as const;

/**
 * Aggregates all dashboard statistical queries using React Query Suspense mode.
 * @param params - Filter parameters containing schoolId and yearId.
 * @returns Object containing all dashboard metrics and a global refetching status.
 */
export function useDashboardStatistics(params: StatsFilter) {
  const { schoolId, yearId } = params;

  const results = useSuspenseQueries({
    queries: [
      {
        queryKey: statsKeys.summary(schoolId, yearId),
        queryFn: () => apis.fetchSummary({ schoolId, yearId }),
        staleTime: STALE_TIME_SHORT,
      },
      {
        queryKey: statsKeys.status(schoolId, yearId),
        queryFn: () => apis.fetchByStatus({ schoolId, yearId }),
        staleTime: STALE_TIME_SHORT,
      },
      {
        queryKey: statsKeys.gender(schoolId, yearId),
        queryFn: () => apis.fetchByGender({ schoolId, yearId }),
        staleTime: STALE_TIME_LONG,
      },
      {
        queryKey: statsKeys.class(schoolId, yearId),
        queryFn: () => apis.fetchByClass({ schoolId, yearId }),
        staleTime: STALE_TIME_SHORT,
      },
      {
        queryKey: statsKeys.option(schoolId, yearId),
        queryFn: () => apis.fetchByOption({ schoolId, yearId }),
        staleTime: STALE_TIME_SHORT,
      },
      {
        queryKey: statsKeys.retention(schoolId, yearId),
        queryFn: () => apis.fetchRetention({ schoolId, yearId }),
        staleTime: STALE_TIME_SHORT,
      },
      {
        queryKey: statsKeys.totalStudents(schoolId, yearId),
        queryFn: () => apis.fetchTotalStudents({ schoolId, yearId }),
        staleTime: STALE_TIME_SHORT,
      },
      {
        queryKey: statsKeys.enrollmentsByYear(schoolId),
        queryFn: () => apis.fetchEnrollmentsByYear(schoolId),
        staleTime: STALE_TIME_LONG,
      },
      {
        queryKey: statsKeys.enrollmentHistory(schoolId, yearId),
        queryFn: () =>
          enrollment.fetchEnrollments({
            where: {
              classroomEnrollments: {
                yearId: { $eq: yearId },
                schoolId: { $eq: schoolId },
              },
            },
            orderBy: [
              {
                column: "createdAt",
                order: "desc",
                table: "classroomEnrollments",
              },
            ],
            limit: 5,
          }),
        staleTime: STALE_TIME_LONG,
      },
    ],
  });

  const [
    summaryQuery,
    statusQuery,
    genderQuery,
    classQuery,
    optionQuery,
    retentionQuery,
    totalStudentsQuery,
    enrollmentsByYearQuery,
    enrollmentHistoryQuery,
  ] = results;

  return {
    summary: summaryQuery.data,
    statusDistribution: statusQuery.data,
    genderDistribution: genderQuery.data,
    studentsByClass: classQuery.data,
    studentsByOption: optionQuery.data,
    retentionData: retentionQuery.data,
    totalStudents: totalStudentsQuery.data,
    enrollmentsByYear: enrollmentsByYearQuery.data,
    enrollmentHistories: enrollmentHistoryQuery.data,
    isRefetching: results.some((query) => query.isFetching),
  };
}

/**
 * Fetches dashboard KPI summary (Total, Active, Dropout, Expelled).
 * @param params - Filter parameters containing schoolId and yearId.
 * @param options - Additional React Query options.
 * @returns Suspense query result containing StatsSummary.
 */
export function useGetStatsSummary(
  params: StatsFilter,
  options?: Partial<UseSuspenseQueryOptions<StatsSummary>>,
) {
  return useSuspenseQuery({
    ...options,
    queryKey: statsKeys.summary(params.schoolId, params.yearId),
    queryFn: () => apis.fetchSummary(params),
  });
}

/**
 * Fetches student distribution by academic status.
 * @param params - Filter parameters containing schoolId and yearId.
 * @param options - Additional React Query options.
 * @returns Suspense query result containing ChartDataPoint array.
 */
export function useGetStatsByStatus(
  params: StatsFilter,
  options?: Partial<UseSuspenseQueryOptions<ChartDataPoint[]>>,
) {
  return useSuspenseQuery({
    ...options,
    queryKey: statsKeys.status(params.schoolId, params.yearId),
    queryFn: () => apis.fetchByStatus(params),
  });
}

/**
 * Fetches student distribution by gender.
 * @param params - Filter parameters containing schoolId and yearId.
 * @param options - Additional React Query options.
 * @returns Suspense query result containing ChartDataPoint array.
 */
export function useGetStatsByGender(
  params: StatsFilter,
  options?: Partial<UseSuspenseQueryOptions<ChartDataPoint[]>>,
) {
  return useSuspenseQuery({
    ...options,
    queryKey: statsKeys.gender(params.schoolId, params.yearId),
    queryFn: () => apis.fetchByGender(params),
  });
}

/**
 * Fetches student count per classroom.
 * @param params - Filter parameters containing schoolId and yearId.
 * @param options - Additional React Query options.
 * @returns Suspense query result containing ClassStatsDTO array.
 */
export function useGetStatsByClass(
  params: StatsFilter,
  options?: Partial<UseSuspenseQueryOptions<ClassStatsDTO[]>>,
) {
  return useSuspenseQuery({
    ...options,
    queryKey: statsKeys.class(params.schoolId, params.yearId),
    queryFn: () => apis.fetchByClass(params),
  });
}

/**
 * Fetches student count per option/track.
 * @param params - Filter parameters containing schoolId and yearId.
 * @param options - Additional React Query options.
 * @returns Suspense query result containing ChartDataPoint array.
 */
export function useGetStatsByOption(
  params: StatsFilter,
  options?: Partial<UseSuspenseQueryOptions<ChartDataPoint[]>>,
) {
  return useSuspenseQuery({
    ...options,
    queryKey: statsKeys.option(params.schoolId, params.yearId),
    queryFn: () => apis.fetchByOption(params),
  });
}

/**
 * Fetches student retention metrics (New vs Returning).
 * @param params - Filter parameters containing schoolId and yearId.
 * @param options - Additional React Query options.
 * @returns Suspense query result containing ChartDataPoint array.
 */
export function useGetRetention(
  params: StatsFilter,
  options?: Partial<UseSuspenseQueryOptions<ChartDataPoint[]>>,
) {
  return useSuspenseQuery({
    ...options,
    queryKey: statsKeys.retention(params.schoolId, params.yearId),
    queryFn: () => apis.fetchRetention(params),
  });
}

/**
 * Fetches the total number of enrolled students.
 * @param params - Filter parameters containing schoolId and yearId.
 * @param options - Additional React Query options.
 * @returns Suspense query result containing total count.
 */
export function useGetTotalStudents(
  params: StatsFilter,
  options?: Partial<UseSuspenseQueryOptions<number>>,
) {
  return useSuspenseQuery({
    ...options,
    queryKey: statsKeys.totalStudents(params.schoolId, params.yearId),
    queryFn: () => apis.fetchTotalStudents(params),
  });
}

/**
 * Fetches yearly enrollment statistics with gender distribution.
 * @param schoolId - Unique school identifier.
 * @param options - Additional React Query options.
 * @returns Suspense query result containing EnrollmentStatsByYear array.
 */
export function useGetEnrollmentsByYear(
  schoolId: string,
  options?: Partial<UseSuspenseQueryOptions<EnrollmentStatsByYear[]>>,
) {
  return useSuspenseQuery({
    ...options,
    queryKey: statsKeys.enrollmentsByYear(schoolId),
    queryFn: () => apis.fetchEnrollmentsByYear(schoolId),
  });
}
