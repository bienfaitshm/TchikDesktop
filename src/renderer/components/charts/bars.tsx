"use client"
import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis } from "recharts"
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/renderer/components/ui/chart"

/**
 * Interface pour les propriétés du BarChart.
 * @template T - La structure de l'objet de données.
 */
interface BarChartProps<T extends object> {
    /** Configuration Shadcn pour les labels et couleurs */
    config: ChartConfig;
    /** Données brutes (ex: provenant du hook useDashboardStatistics) */
    data: T[];
    /** La clé utilisée pour l'axe horizontal (ex: "label" ou "className") */
    xAxisKey: keyof T;
    /** Liste des clés à transformer en barres (ex: ["masculin", "féminin"] ou ["value"]) */
    bars: (keyof T)[];
    /** Si vrai, empile les barres les unes sur les autres */
    stacked?: boolean;
    /** Fonction optionnelle pour formater les ticks de l'axe X (ex: (val) => val.slice(0,3)) */
    labelFormatter?: (value: any) => string;
    /** Classes CSS additionnelles */
    className?: string;
}

/**
 * Composant de graphique à barres polyvalent et typé.
 * Supporte le mode empilé (stacked) et groupé.
 */
export function BarChart<T extends object>({
    config,
    data,
    xAxisKey,
    bars,
    stacked = false,
    labelFormatter,
    className,
}: BarChartProps<T>) {
    return (
        <ChartContainer
            config={config}
            className={className || "min-h-[200px] w-full"}
        >
            <RechartsBarChart
                accessibilityLayer
                data={data}
                margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
            >
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
                    content={<ChartTooltipContent indicator="dashed" />}
                />

                <ChartLegend content={<ChartLegendContent />} />

                {bars.map((barKey, index) => (
                    <Bar
                        key={String(barKey)}
                        dataKey={String(barKey)}
                        // Utilise le même stackId si stacked est vrai
                        stackId={stacked ? "a" : undefined}
                        fill={`var(--color-${String(barKey)})`}
                        // Arrondi uniquement les coins supérieurs de la dernière barre ou de chaque barre si non-stacked
                        radius={
                            !stacked || index === bars.length - 1
                                ? [4, 4, 0, 0]
                                : [0, 0, 0, 0]
                        }
                    />
                ))}
            </RechartsBarChart>
        </ChartContainer>
    )
}

BarChart.displayName = "BarChart";