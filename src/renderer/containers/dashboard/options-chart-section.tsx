"use client";

import { BarChart } from "@/renderer/components/charts/bars";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/renderer/components/ui/card";
import { BarChart3 } from "lucide-react";
import { OPTION_CONFIG } from "@/renderer/constants/charts";
import type { ChartDataPoint } from "@/packages/@core/data-access/db/queries";

interface OptionsChartSectionProps {
  data: ChartDataPoint[];
}

export const OptionsChartSection = ({ data }: OptionsChartSectionProps) => (
  <Card className="border-border/60 bg-card/40 backdrop-blur-xs shadow-xs overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between border-b border-border/30 bg-muted/10 py-4 px-6">
      <div className="space-y-0.5">
        <CardTitle className="text-sm font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="size-4 text-primary" /> Filières & Options
          d'Étude
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Classement des effectifs d'élèves par choix d'orientation
        </CardDescription>
      </div>
    </CardHeader>
    <CardContent className="p-6">
      <BarChart
        data={data}
        xAxisKey="label"
        bars={["value"]}
        config={OPTION_CONFIG}
        labelFormatter={(v: string) =>
          v.length > 18 ? `${v.substring(0, 16)}...` : v
        }
        height={240}
      />
    </CardContent>
  </Card>
);
