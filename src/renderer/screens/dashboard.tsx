"use client";

import { useDashboardStatistics } from "@/renderer/libs/queries/dashboard";
import { useSchoolContext } from "../hooks/app-config-router";
import { HeroBanner } from "@/renderer/containers/dashboard/hero-banner";
import { KPICards } from "@/renderer/containers/dashboard/kpi-cards";
import { PromotionVolumeSection } from "@/renderer/containers/dashboard/promotion-volume-section";
import { SystemPanel } from "@/renderer/containers/dashboard/system-panel";
import { OptionsChartSection } from "@/renderer/containers/dashboard/options-chart-section";
import { ActivityTabs } from "@/renderer/containers/dashboard/activity-tabs";

export const DashBoardPage = () => {
  const { schoolId, yearId } = useSchoolContext();
  const {
    summary,
    genderDistribution,
    statusDistribution,
    studentsByClass,
    studentsByOption,
    totalStudents,
  } = useDashboardStatistics({ schoolId, yearId });

  return (
    <div className="min-h-screen bg-background/50 text-foreground p-6 lg:p-10 max-w-400 mx-auto w-full space-y-8 animate-fade-in">
      <HeroBanner />

      <KPICards
        totalStudents={totalStudents ?? 0}
        activeCount={summary?.active ?? 0}
        excludedCount={summary?.excluded ?? 0}
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
