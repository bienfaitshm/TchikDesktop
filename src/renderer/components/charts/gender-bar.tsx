"use client"

import { Bar, BarChart as BarChartCn, CartesianGrid, XAxis } from "recharts"
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/renderer/components/ui/chart"

export const description = "A stacked bar chart with a legend"

const chartData = [
    { month: "January", F: 186, M: 80 },
    { month: "February", F: 305, M: 200 },
    { month: "March", F: 237, M: 120 },
    { month: "April", F: 73, M: 190 },
    { month: "May", F: 209, M: 130 },
    { month: "June", F: 214, M: 140 },
]

const chartConfig = {
    F: {
        label: "Fille",
        color: "hsl(var(--chart-1))",
    },
    M: {
        label: "Garcons",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

type GenderBarProps<TData> = {
    chartConfig: ChartConfig;
    data: TData[];
    dataKey: keyof TData;
    bars: (keyof TData)[]
}

export function BarChart<TData>(props: GenderBarProps<TData>) {
    return (
        <ChartContainer config={props.chartConfig}>
            <BarChartCn accessibilityLayer data={props.data}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey={props.dataKey}
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <ChartLegend content={<ChartLegendContent />} />
                {props.bars.map(bar => (
                    <Bar
                        key={bar}
                        dataKey={bar}
                        stackId="a"
                        fill={`var(--color-${bar})`}
                        radius={[4, 4, 4, 4]}
                    />
                ))}
            </BarChartCn>
        </ChartContainer>
    )
}
