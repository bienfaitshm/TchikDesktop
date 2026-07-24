import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/renderer/components/ui/toggle-group";
import { formatCurrency } from "@/packages/currency";

/**
 * Interface representing raw revenue chart data points.
 */
export type RevenueChartData = {
  date: Date;
  collected: number;
  currency?: string;
};

/**
 * Supported time period filter options.
 */
export type ChartPeriod = "7d" | "30d" | "year";

/**
 * Props for the RevenueChart component.
 */
export type RevenueChartProps = {
  /** Array of revenue data points to display. */
  revenueChart: RevenueChartData[];
  /** Optional initial selected period. Defaults to "30d". */
  defaultPeriod?: ChartPeriod;
  /** Optional callback triggered when the period filter changes. */
  onPeriodChange?: (period: ChartPeriod) => void;
};

/**
 * Localization strings dictionary for RevenueChart UI text.
 */
const I18N = {
  emptyState: "Aucune donnée de paiement disponible pour la période.",
  lineName: "Encaissé",
  periods: {
    "7d": "7J",
    "30d": "30J",
    year: "Année",
  },
} as const;

/**
 * Formats a Date object into a localized string tailored to the selected chart period.
 * @param date - Date object to format.
 * @param period - The active chart period determining the formatting granularity.
 * @returns Formatted date string (e.g., "Mon 14", "14 Jul", or "Jul 24").
 */
function formatDateTick(date: Date, period: ChartPeriod): string {
  const options: Intl.DateTimeFormatOptions = {};

  switch (period) {
    case "7d":
      options.weekday = "short";
      options.day = "numeric";
      break;
    case "30d":
      options.day = "numeric";
      options.month = "short";
      break;
    case "year":
      options.month = "short";
      options.year = "2-digit";
      break;
  }

  return new Intl.DateTimeFormat("fr-FR", options).format(date);
}

/**
 * Filters chart data based on the selected time period relative to the latest available date.
 * @param data - Raw array of chart data items.
 * @param period - Selected time filter.
 * @returns Filtered array of chart data items falling within the target period.
 */
function filterDataByPeriod(
  data: RevenueChartData[],
  period: ChartPeriod,
): RevenueChartData[] {
  if (data.length === 0) return [];

  const latestDate = new Date(
    Math.max(...data.map((item) => new Date(item.date).getTime())),
  );

  const cutoffDate = new Date(latestDate);

  if (period === "7d") {
    cutoffDate.setDate(cutoffDate.getDate() - 7);
  } else if (period === "30d") {
    cutoffDate.setDate(cutoffDate.getDate() - 30);
  } else if (period === "year") {
    cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
  }

  return data.filter((item) => new Date(item.date) >= cutoffDate);
}

/**
 * Renders an interactive line chart displaying revenue over time with period filtering
 * and dynamically scaling X-axis labels.
 * @param props - Component configuration including data points and period options.
 * @returns Rendered revenue line chart component.
 */
export const RevenueChart: React.FC<RevenueChartProps> = ({
  revenueChart,
  defaultPeriod = "30d",
  onPeriodChange,
}) => {
  const [period, setPeriod] = useState<ChartPeriod>(defaultPeriod);

  const handlePeriodChange = (value: string) => {
    if (!value) return;
    const newPeriod = value as ChartPeriod;
    setPeriod(newPeriod);
    onPeriodChange?.(newPeriod);
  };

  const processedData = useMemo(() => {
    const filtered = filterDataByPeriod(revenueChart, period);
    return filtered.map((item) => ({
      ...item,
      formattedDate: formatDateTick(new Date(item.date), period),
    }));
  }, [revenueChart, period]);

  return (
    <div className="bg-card rounded-xl p-4 h-80 border border-border shadow-sm flex flex-col justify-between">
      {processedData.length === 0 ? (
        <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
          {I18N.emptyState}
        </div>
      ) : (
        <div className="w-full flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={processedData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={true}
                horizontal={true}
                stroke="var(--color-border)"
                opacity={0.5}
              />
              <XAxis
                dataKey="formattedDate"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "var(--color-muted-foreground)",
                  fontSize: 12,
                }}
                tickMargin={10}
                minTickGap={20}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "var(--color-muted-foreground)",
                  fontSize: 12,
                }}
                tickFormatter={(value) => formatCurrency(value)}
                domain={["auto", "auto"]}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-popover)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-popover-foreground)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{
                  color: "var(--color-foreground)",
                  fontWeight: 500,
                }}
              />
              <Line
                type="monotone"
                dataKey="collected"
                stroke="var(--color-primary)"
                strokeWidth={3}
                dot={false}
                name={I18N.lineName}
                activeDot={{
                  r: 6,
                  strokeWidth: 2,
                  stroke: "var(--color-background)",
                  fill: "var(--color-primary)",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex justify-between items-center mt-4 flex-wrap gap-2">
        <ToggleGroup
          type="single"
          value={period}
          onValueChange={handlePeriodChange}
          variant="outline"
          className="p-1 rounded-lg bg-muted/50 border border-border"
        >
          <ToggleGroupItem
            value="7d"
            className="text-xs px-3 py-1 data-[state=on]:bg-background data-[state=on]:text-foreground rounded-md border-0"
          >
            {I18N.periods["7d"]}
          </ToggleGroupItem>
          <ToggleGroupItem
            value="30d"
            className="text-xs px-3 py-1 data-[state=on]:bg-background data-[state=on]:text-foreground rounded-md border-0"
          >
            {I18N.periods["30d"]}
          </ToggleGroupItem>
          <ToggleGroupItem
            value="year"
            className="text-xs px-3 py-1 data-[state=on]:bg-background data-[state=on]:text-foreground rounded-md border-0"
          >
            {I18N.periods["year"]}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
};
