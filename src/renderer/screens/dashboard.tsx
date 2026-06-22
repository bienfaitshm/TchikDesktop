"use client";

import { useDashboardStatistics } from "@/renderer/libs/queries/dashboard";
import { useSchoolContext } from "../hooks/app-config-router";
import { HeroBanner } from "@/renderer/containers/dashboard/hero-banner";
import { KPICards } from "@/renderer/containers/dashboard/kpi-cards";
import { PromotionVolumeSection } from "@/renderer/containers/dashboard/promotion-volume-section";
import { SystemPanel } from "@/renderer/containers/dashboard/system-panel";
import { OptionsChartSection } from "@/renderer/containers/dashboard/options-chart-section";
import { ActivityTabs } from "@/renderer/containers/dashboard/activity-tabs";
import type { ChartDataPoint } from "@/packages/@core/data-access/db/queries";
import { useMemo } from "react";

/**
 * Transforme un tableau de points de données graphiques en un objet clé-valeur
 * indexé par le label. Utile pour un accès direct aux valeurs par catégorie.
 *
 * @example
 * const data = [{ label: "Actifs", value: 120 }, { label: "Exclus", value: 5 }];
 * const record = toLabelValueRecord(data);
 * // { Actifs: 120, Exclus: 5 }
 */
function toLabelValueRecord<T extends ChartDataPoint>(
  data: T[],
): Record<string, number> {
  return data.reduce(
    (acc, curr) => ({
      ...acc,
      [curr.label]: curr.value,
    }),
    {} as Record<string, number>,
  );
}

export const DashBoardPage = () => {
  const { schoolId, yearId } = useSchoolContext();
  const {
    summary,
    genderDistribution,
    statusDistribution,
    studentsByClass,
    studentsByOption,
    totalStudents,
    retentionData,
  } = useDashboardStatistics({ schoolId, yearId });

  const rentetion = useMemo(
    () => toLabelValueRecord(retentionData),
    [JSON.stringify(retentionData)],
  );
  console.log("summary", summary, retentionData);

  return (
    <div className="min-h-screen bg-background/50 text-foreground p-6 lg:p-10 max-w-400 mx-auto w-full space-y-8 animate-fade-in">
      <HeroBanner />

      <KPICards
        totalStudents={totalStudents ?? 0}
        activeCount={summary?.active ?? 0}
        excludedCount={summary?.excluded ?? 0}
        dropoutCount={summary?.dropout ?? 0}
        newCount={rentetion?.nouveaux ?? 0}
        oldCount={rentetion?.anciens ?? 0}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <PromotionVolumeSection data={studentsByClass ?? []} />
        <SystemPanel genderData={genderDistribution ?? []} />
      </div>

      <OptionsChartSection data={studentsByOption ?? []} />

      <ActivityTabs
        statusDistribution={statusDistribution ?? []}
        genderDistribution={genderDistribution ?? []}
      />
    </div>
  );
};
