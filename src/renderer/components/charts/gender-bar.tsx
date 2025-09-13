"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/renderer/components/ui/card"
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

export function GenderBar() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Bar Chart - Stacked + Legend</CardTitle>
                <CardDescription>January - June 2024</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar
                            dataKey="F"
                            stackId="a"
                            fill="var(--color-F)"
                            radius={[0, 0, 4, 4]}
                        />
                        <Bar
                            dataKey="M"
                            stackId="a"
                            fill="var(--color-M)"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                    Showing total visitors for the last 6 months
                </div>
            </CardFooter>
        </Card>
    )
}
