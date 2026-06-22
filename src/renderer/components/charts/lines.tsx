"use client";

import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/renderer/components/ui/chart";

interface DynamicLineChartProps<T extends Record<string, any>> {
  /** Tableau de données */
  data: T[];
  /** Configuration du graphique (couleurs, labels) */
  config: ChartConfig;
  /** Clé utilisée pour l'axe X */
  xAxisKey: keyof T & string;
  /** Largeur des lignes (défaut 2) */
  strokeWidth?: number;
  /** Afficher les lignes horizontales de la grille (défaut true) */
  showHorizontalGrid?: boolean;
  /** Afficher les lignes verticales de la grille (défaut false) */
  showVerticalGrid?: boolean;
  /** Formatteur optionnel pour les étiquettes de l'axe X */
  xTickFormatter?: (value: any) => string;
  /** Marge du graphique */
  margin?: { top: number; left: number; right: number; bottom: number };
  /** Hauteur du conteneur en pixels (défaut 300) */
  height?: number;
  /** Classes CSS additionnelles pour le conteneur */
  className?: string;
}

export function DynamicLineChart<T extends Record<string, any>>({
  data,
  config,
  xAxisKey,
  strokeWidth = 2,
  showHorizontalGrid = true,
  showVerticalGrid = false,
  xTickFormatter,
  margin = { top: 20, left: 30, right: 20, bottom: 0 },
  height = 300,
  className,
}: DynamicLineChartProps<T>) {
  const lineKeys = Object.keys(config);

  return (
    <ChartContainer
      config={config}
      className={`w-full ${className ?? ""}`}
      style={{ height: `${height}px` }}
    >
      <LineChart accessibilityLayer data={data} margin={margin}>
        {(showHorizontalGrid || showVerticalGrid) && (
          <CartesianGrid
            vertical={showVerticalGrid}
            horizontal={showHorizontalGrid}
          />
        )}

        <XAxis
          dataKey={xAxisKey as any}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={xTickFormatter}
          interval={0}
        />

        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />

        {lineKeys.map((key) => (
          <Line
            key={key}
            dataKey={key}
            type="natural"
            stroke={`var(--color-${key})`}
            strokeWidth={strokeWidth}
            dot={{
              fill: `var(--color-${key})`,
            }}
            activeDot={{
              r: 6,
            }}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}
