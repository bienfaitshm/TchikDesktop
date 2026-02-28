"use client"

import { Pie, PieChart, Label } from "recharts"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/renderer/components/ui/chart"
import { useMemo } from "react"

/**
 * Interface pour les données de statistiques formatées pour le graphique.
 */
interface ChartPieData {
    label: string;
    value: number;
    fill?: string;
    [key: string]: any; // Permet d'accepter d'autres propriétés (ex: id, slug)
}

interface ChartPieProps {
    /** Tableau de données provenant du StatsService */
    data: ChartPieData[];
    /** Configuration des couleurs et labels Shadcn */
    config: ChartConfig;
    /** Informations optionnelles à afficher au centre du donut */
    centerDataInfos?: {
        total: number | string;
        totalLabel: string
    };
    /** Classes CSS additionnelles */
    className?: string;
}

/**
 * Composant de graphique en camembert (Pie/Donut) réutilisable.
 * Conçu pour s'intégrer directement avec les retours du StatsService.
 */
export function ChartPie({
    data,
    config,
    centerDataInfos,
    className
}: ChartPieProps) {

    // On prépare les données en injectant les variables de couleur basées sur le label
    const chartData = useMemo(() => {
        return data.map((item) => ({
            ...item,
            // On utilise le label (en minuscule/slug) pour mapper vers var(--color-xxx)
            fill: item.fill || `var(--color-${item.label.toLowerCase().replace(/\s+/g, "-")})`
        }));
    }, [data]);

    return (
        <ChartContainer
            config={config}
            className={className || "mx-auto aspect-square max-h-[250px] pb-0"}
        >
            <PieChart>
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={centerDataInfos ? 60 : 0} // Mode Donut si infos centrales
                    strokeWidth={5}
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
                                    )
                                }
                            }}
                        />
                    )}
                </Pie>
            </PieChart>
        </ChartContainer>
    )
}

ChartPie.displayName = "ChartPie";