"use client";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  XAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/renderer/components/ui/chart";
import React from "react";
interface BarChartProps<T extends object> {
  config: ChartConfig;
  data: T[];
  xAxisKey: keyof T;
  bars: (keyof T)[];
  stacked?: boolean;
  labelFormatter?: (value: any) => string;
  className?: string;
  height?: number; // hauteur fixe
  margin?: { top: number; right: number; left: number; bottom: number };
  showLegend?: boolean;
  tooltipIndicator?: "dashed" | "line" | "dot";
}

export function BarChart<T extends object>({
  config,
  data,
  xAxisKey,
  bars,
  stacked = false,
  labelFormatter,
  className,
  height = 200,
  margin = { top: 20, right: 20, left: 0, bottom: 0 },
  showLegend = true,
  tooltipIndicator = "dashed",
}: BarChartProps<T>) {
  // Génère les styles CSS pour les variables de couleur
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

  return (
    <ChartContainer
      config={config}
      className={`h-[${height}px] w-full ${className || ""}`}
    >
      <div style={colorVars}>
        <RechartsBarChart accessibilityLayer data={data} margin={margin}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.4} />
          <XAxis
            dataKey={String(xAxisKey)}
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={labelFormatter || ((value) => value)}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator={tooltipIndicator} />}
          />
          {showLegend && <ChartLegend content={<ChartLegendContent />} />}
          {bars.map((barKey, index) => (
            <Bar
              key={String(barKey)}
              dataKey={String(barKey)}
              stackId={stacked ? "a" : undefined}
              fill={`var(--color-${String(barKey)})`}
              radius={
                !stacked || index === bars.length - 1
                  ? [4, 4, 0, 0]
                  : [0, 0, 0, 0]
              }
            />
          ))}
        </RechartsBarChart>
      </div>
    </ChartContainer>
  );
}

BarChart.displayName = "BarChart";
