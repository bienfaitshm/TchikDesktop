import { UseSuspenseQueryOptions } from "@tanstack/react-query";
import { useSuspenseQuery } from "../base";
import { SchoolYearIdBase } from "@/packages/@core/data-access/schema-validations";
import { dashboard } from "@/renderer/libs/apis";
import type { FinDashBoard } from "@/packages/@core/data-access/db";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  finacial: (schoolId: string, yearId: string) =>
    [...dashboardKeys.all, "financial", { schoolId, yearId }] as const,
} as const;

export function useGetFinancialDashboardData(
  params: SchoolYearIdBase,
  options?: Partial<UseSuspenseQueryOptions<FinDashBoard>>,
) {
  return useSuspenseQuery({
    queryKey: dashboardKeys.finacial(params.schoolId, params.yearId),
    queryFn: () => dashboard.getFinancialDashboardData(params),
    ...options,
  });
}
