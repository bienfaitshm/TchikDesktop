"use client"
import { Pie, PieChart, Label } from "recharts"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/renderer/components/ui/chart"
import { useMemo } from "react"

export const description = "A pie chart with a label"

// const chartData = [
//     { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
//     { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
//     { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
//     { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
//     { browser: "other", visitors: 90, fill: "var(--color-other)" },
// ]

// const chartConfig = {
//     visitors: {
//         label: "Visitors",
//     },
//     chrome: {
//         label: "Chrome",
//         color: "hsl(var(--chart-1))",
//     },
//     safari: {
//         label: "Safari",
//         color: "hsl(var(--chart-2))",
//     },
//     firefox: {
//         label: "Firefox",
//         color: "hsl(var(--chart-3))",
//     },
//     edge: {
//         label: "Edge",
//         color: "hsl(var(--chart-4))",
//     },
//     other: {
//         label: "Other",
//         color: "hsl(var(--chart-5))",
//     },
// } satisfies ChartConfig


type TData = {
    label: string;
    total: number,
}
type ChartPieProps = {
    data: TData[]
    dataKey: keyof TData;
    chartConfig: ChartConfig;
    centerDataInfos?: { total: number | string; totalLabel: string }
}
export function ChartPie({ data, dataKey, centerDataInfos, chartConfig }: ChartPieProps) {
    const chartData: (TData & { fill: string })[] = useMemo(() => data.map(r => ({
        ...r, fill: `var(--color-${r.label})`
    })), [])
    return (
        <ChartContainer
            config={chartConfig}
            className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[250px] pb-0"
        >
            <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                    label
                    data={chartData}
                    dataKey={String(dataKey)}
                    nameKey={String(dataKey)}
                    innerRadius={centerDataInfos ? 50 : 0}
                    strokeWidth={5}
                >
                    {centerDataInfos && <Label
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
                                            {centerDataInfos.total}
                                        </tspan>
                                        <tspan
                                            x={viewBox.cx}
                                            y={(viewBox.cy || 0) + 24}
                                            className="fill-muted-foreground"
                                        >
                                            {centerDataInfos.totalLabel}
                                        </tspan>
                                    </text>
                                )
                            }
                        }}
                    />}
                </Pie>
            </PieChart>
        </ChartContainer>
    )
}

