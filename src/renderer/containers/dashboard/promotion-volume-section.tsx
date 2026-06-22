"use client";

import { useMemo, useState } from "react";
import { Layers } from "lucide-react";
import { BarChart } from "@/renderer/components/charts/bars";
import { DynamicLineChart } from "@/renderer/components/charts/lines";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/renderer/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/renderer/components/ui/tabs";
import {
  CLASS_CONFIG,
  enrollmentChartConfig,
} from "@/renderer/constants/charts";
import type {
  ClassStatsDTO,
  EnrollmentStatsByYear,
} from "@/packages/@core/data-access/db/queries";

type ViewMode = "byClass" | "byYear";

interface PromotionVolumeSectionProps {
  studentsByClass?: ClassStatsDTO[];
  enrollmentsByYear?: EnrollmentStatsByYear[];
}

export const PromotionVolumeSection = ({
  studentsByClass = [],
  enrollmentsByYear = [],
}: PromotionVolumeSectionProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("byClass");

  const formattedEnrollments = useMemo(() => {
    return enrollmentsByYear.map((item) => ({
      yearName: item.yearName,
      total: item.total,
      female: item.female,
      male: item.male,
    }));
  }, [enrollmentsByYear]);

  return (
    <Tabs
      value={viewMode}
      onValueChange={(v) => setViewMode(v as ViewMode)}
      className="lg:col-span-8 w-full"
    >
      <Card className="border-border/60 bg-card/40 backdrop-blur-xs shadow-xs flex flex-col justify-between overflow-hidden">
        {/* En-tête avec disposition adaptative */}
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/30 bg-muted/10 py-4 px-6">
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-bold tracking-tight flex items-center gap-2">
              <Layers className="size-4 text-primary" />
              Volume de Scolarisation par Promotion
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {viewMode === "byClass"
                ? "Effectifs cumulés répartis par niveau d'étude"
                : "Évolution comparative des flux d'inscriptions annuels"}
            </CardDescription>
          </div>

          {/* Toggle de vue au format Shadcn standard */}
          <TabsList className="h-8 p-0.5 rounded-lg bg-muted/60 border border-border/50 self-start sm:self-auto">
            <TabsTrigger
              value="byClass"
              className="text-xs px-3 py-1 rounded-md transition-all font-medium"
            >
              Par classe
            </TabsTrigger>
            <TabsTrigger
              value="byYear"
              className="text-xs px-3 py-1 rounded-md transition-all font-medium"
            >
              Par année
            </TabsTrigger>
          </TabsList>
        </CardHeader>

        {/* Zone de contenu dynamique avec onglets réels */}
        <CardContent className="p-6">
          <TabsContent
            value="byClass"
            className="mt-0 focus-visible:outline-hidden animate-in fade-in duration-200"
          >
            <BarChart
              data={studentsByClass}
              xAxisKey="shortName"
              bars={["value"]}
              config={CLASS_CONFIG}
              height={260}
            />
          </TabsContent>

          <TabsContent
            value="byYear"
            className="mt-0 focus-visible:outline-hidden animate-in fade-in duration-200"
          >
            <DynamicLineChart
              data={formattedEnrollments}
              config={enrollmentChartConfig}
              xAxisKey="yearName"
              xTickFormatter={(value: string) => {
                const endYear = extractEndYear(value);
                return endYear ? String(endYear) : value;
              }}
              height={260}
            />
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
};

// Fonction utilitaire d'extraction d'année
function extractEndYear(schoolYear: string): number | null {
  const match = schoolYear.match(/Année scolaire (\d{4})-(\d{4})/);
  return match ? parseInt(match[2], 10) : null;
}
