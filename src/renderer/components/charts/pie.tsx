"use client";

import { Pie, PieChart, Label } from "recharts";
import React, { useMemo } from "react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/renderer/components/ui/chart";

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
    total: number; // Forcé à number pour toLocaleString()
    totalLabel: string;
  };
  className?: string;
  height?: number;
  showTooltipLabel?: boolean;
  innerRadius?: number; // Permet de personnaliser l'épaisseur du donut
  outerRadius?: number;
}

export function ChartPie({
  data,
  config,
  centerDataInfos,
  className,
  height = 250,
  showTooltipLabel = false,
  innerRadius = 60,
  outerRadius,
}: ChartPieProps) {
  const colorVars = React.useMemo(() => {
    return Object.entries(config).reduce<Record<string, string>>(
      (acc, [key, item]) => {
        if (item && "color" in item && typeof item.color === "string") {
          acc[`--color-${key}`] = item.color;
        }
        return acc;
      },
      {},
    );
  }, [config]);

  const chartData = useMemo(() => {
    return data.map((item) => {
      // Cherche la clé dans la config correspondant au label slugifié
      const slug = item.label.toLowerCase().replace(/\s+/g, "-");
      const configEntry = config[slug];
      const fill =
        item.fill ||
        (configEntry && "color" in configEntry
          ? (configEntry as { color: string }).color
          : undefined) ||
        `var(--color-${slug})`; // fallback (peut être une variable invalide si non définie)
      return { ...item, fill };
    });
  }, [data, config]);

  return (
    <ChartContainer
      config={config}
      className={`mx-auto aspect-square h-[${height}px] pb-0 ${className || ""}`}
    >
      <div style={colorVars}>
        <PieChart
          data={chartData}
          dataKey="value"
          //   nameKey=""
          innerRadius={centerDataInfos ? innerRadius : 0}
          outerRadius={outerRadius}
          //   strokeWidth={2}
        >
          {centerDataInfos && (
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
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
                }
              }}
            />
          )}
        </PieChart>
      </div>
    </ChartContainer>
  );
}

ChartPie.displayName = "ChartPie";
