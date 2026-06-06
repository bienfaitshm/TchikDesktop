"use client";

import { Pie, PieChart, Label } from "recharts";
import React, { useMemo } from "react";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/renderer/components/ui/chart";
import { cn } from "@/renderer/utils";
import { useChartPieData } from "./utils";

interface ChartPieData {
  label: string;
  value: number;
  fill?: string;
  [key: string]: any;
}

interface ChartPieProps {
  data: ChartPieData[];
  config: ChartConfig;
  centerDataInfos?: {
    total: number;
    totalLabel: string;
  };
  className?: string;
  height?: number;
  innerRadius?: number;
  showLegend?: boolean;
}

export function ChartPie({
  data,
  config,
  centerDataInfos,
  className,
  height = 250,
  innerRadius = 60,
  showLegend = true,
}: ChartPieProps) {
  const chartData = useChartPieData(data, config);

  return (
    <div
      style={{ height }}
      className={cn("mx-auto flex justify-center", className)}
    >
      <ChartContainer config={config} className="h-full aspect-square">
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="label"
            innerRadius={centerDataInfos ? innerRadius : 0}
            strokeWidth={5} // Ajoute un petit espace entre les segments (pro)
            stroke="var(--background)"
          >
            {centerDataInfos && (
              <Label
                content={(props) => {
                  const viewBox = props.viewBox as
                    | { cx?: number; cy?: number }
                    | undefined;
                  if (!viewBox?.cx || !viewBox?.cy) return null;
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-3xl font-bold"
                      >
                        {centerDataInfos.total.toLocaleString()}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className="fill-muted-foreground text-xs uppercase tracking-wider"
                      >
                        {centerDataInfos.totalLabel}
                      </tspan>
                    </text>
                  );
                }}
              />
            )}
          </Pie>
          {showLegend && <ChartLegend content={<ChartLegendContent />} />}
        </PieChart>
      </ChartContainer>
    </div>
  );
}

ChartPie.displayName = "ChartPie";
