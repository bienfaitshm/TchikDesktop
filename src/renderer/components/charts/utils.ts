import type { ChartConfig } from "@/renderer/components/ui/chart";
import { useMemo } from "react";

interface ChartPieData {
  label: string;
  value: number;
  fill?: string;
  [key: string]: unknown;
}

interface UseChartPieDataResult extends ChartPieData {
  fill: string;
}

export function useChartPieData(
  data: ChartPieData[],
  config: ChartConfig,
): UseChartPieDataResult[] {
  return useMemo(() => {
    if (!data.length) return [];

    return data.map((item) => {
      const configEntry = config[item.label];

      if (!configEntry) {
        console.warn(`No config found for label: "${item.label}"`);
      }

      const fill = item.fill ?? configEntry?.color ?? "currentColor";

      return {
        ...item,
        fill,
      };
    });
  }, [data, config]);
}
