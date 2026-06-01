"use client";

import { Pie, PieChart, Label } from "recharts";
import React, { useMemo } from "react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/renderer/components/ui/chart";
import { cn } from "@/renderer/utils";

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
}

export function ChartPie({
  data,
  config,
  centerDataInfos,
  className,
  height = 250,
  innerRadius = 60,
}: ChartPieProps) {
  const colorVars = React.useMemo(() => {
    return Object.entries(config).reduce<Record<string, string>>(
      (acc, [key, item]) => {
        if (item?.color) acc[`--color-${key}`] = item.color;
        return acc;
      },
      {},
    );
  }, [config]);

  const chartData = useMemo(() => {
    return data.map((item) => {
      const slug = item.label.toLowerCase().replace(/\s+/g, "-");
      return { ...item, fill: item.fill || `var(--color-${slug})` };
    });
  }, [data]);

  return (
    <div
      style={{ height: `${height}px`, ...colorVars }}
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
            stroke="hsl(var(--background))"
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
          </Pie>
        </PieChart>
      </ChartContainer>
    </div>
  );
}

ChartPie.displayName = "ChartPie";
