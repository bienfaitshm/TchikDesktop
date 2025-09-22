import type { ChartConfig } from "@/renderer/components/ui/chart";

export const TOTAL_STUDENT: ChartConfig = {
  maleCount: {
    label: "Fille",
    color: "hsl(var(--chart-1))",
  },
  femaleCount: {
    label: "Garcons",
    color: "hsl(var(--chart-2))",
  },
  totalCount: {
    label: "Total",
    color: "hsl(var(--chart-3))",
  },
};

export const SecondaryStudentsByOptionChartConfig: ChartConfig = {
  maleCount: {
    label: "Fille",
    color: "hsl(var(--chart-1))",
  },
  femaleCount: {
    label: "Garcons",
    color: "hsl(var(--chart-2))",
  },
};
