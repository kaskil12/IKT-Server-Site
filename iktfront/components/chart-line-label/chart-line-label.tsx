"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A line chart with a label"

const defaultChartData = [
    { month: "January", antall: 186 },
    { month: "February", antall: 305 },
    { month: "March", antall: 237 },
    { month: "April", antall: 73 },
    { month: "May", antall: 209 },
    { month: "June", antall: 214 },
]

const chartConfig = {
    antall: {
        label: "Antall",
        color: "var(--chart-1)",
    },
    mobile: {
        label: "Mobile",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig

interface ChartLineLabelProps {
    cardTitle?: string;
    cardDescription?: string;
    trendingText?: string;
    footerText?: string;
    chartData?: typeof defaultChartData;
}

export function ChartLineLabel({
    cardTitle = "Line Chart - Label",
    cardDescription = "January - June 2024",
    trendingText = "Trending up by 5.2% this month",
    footerText = "Showing total visitors for the last 6 months",
    chartData = defaultChartData,
}: ChartLineLabelProps) {
    return (
        <Card className="shadow-lg bg-white/10 backdrop-blur-md border-none text-white">
            <CardHeader>
                <CardTitle className="text-white">{cardTitle}</CardTitle>
                <CardDescription className="text-white">{cardDescription}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="[&_.recharts-cartesian-axis-tick-value]:fill-white [&_.recharts-text]:fill-white">
                    <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            top: 20,
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 3)}
                            tick={{ fill: 'white', fontSize: 12 }}
                            style={{ fill: 'white' }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <Line
                            dataKey="antall"
                            type="natural"
                            stroke="var(--color-antall)"
                            strokeWidth={2}
                            dot={{
                                fill: "var(--color-antall)",
                            }}
                            activeDot={{
                                r: 6,
                            }}
                        >
                            <LabelList
                                position="top"
                                offset={12}
                                className="fill-white"
                                fontSize={12}
                            />
                        </Line>
                    </LineChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium text-white">
                    {trendingText} <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-white">
                    {footerText}
                </div>
            </CardFooter>
        </Card>
    )
}
