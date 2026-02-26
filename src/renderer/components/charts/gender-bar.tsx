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
