"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const description = "An interactive area chart"
const chartData = [] as { date: string; Innlandet: number; Lab: number }[]
const handlefetchData = async () => {
  try {
    const res = await fetch("http://<API_URL>/chart-data");
    if (!res.ok) {
      throw new Error("Failed to fetch chart data");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return [];
  }
};
//   { date: "2024-04-05", Innlandet: 373, Lab: 290 },
//   { date: "2024-04-06", Innlandet: 301, Lab: 340 },
//   { date: "2024-04-07", Innlandet: 245, Lab: 180 },
//   { date: "2024-04-08", Innlandet: 409, Lab: 320 },
//   { date: "2024-04-09", Innlandet: 59, Lab: 110 },
//   { date: "2024-04-10", Innlandet: 261, Lab: 190 },
//   { date: "2024-04-11", Innlandet: 327, Lab: 350 },
//   { date: "2024-04-12", Innlandet: 292, Lab: 210 },
//   { date: "2024-04-13", Innlandet: 342, Lab: 380 },
//   { date: "2024-04-14", Innlandet: 137, Lab: 220 },
//   { date: "2024-04-15", Innlandet: 120, Lab: 170 },
//   { date: "2024-04-16", Innlandet: 138, Lab: 190 },
//   { date: "2024-04-17", Innlandet: 446, Lab: 360 },
//   { date: "2024-04-18", Innlandet: 364, Lab: 410 },
//   { date: "2024-04-19", Innlandet: 243, Lab: 180 },
//   { date: "2024-04-20", Innlandet: 89, Lab: 150 },
//   { date: "2024-04-21", Innlandet: 137, Lab: 200 },
//   { date: "2024-04-22", Innlandet: 224, Lab: 170 },
//   { date: "2024-04-23", Innlandet: 138, Lab: 230 },
//   { date: "2024-04-24", Innlandet: 387, Lab: 290 },
//   { date: "2024-04-25", Innlandet: 215, Lab: 250 },
//   { date: "2024-04-26", Innlandet: 75, Lab: 130 },
//   { date: "2024-04-27", Innlandet: 383, Lab: 420 },
//   { date: "2024-04-28", Innlandet: 122, Lab: 180 },
//   { date: "2024-04-29", Innlandet: 315, Lab: 240 },
//   { date: "2024-04-30", Innlandet: 454, Lab: 380 },
//   { date: "2024-05-01", Innlandet: 165, Lab: 220 },
//   { date: "2024-05-02", Innlandet: 293, Lab: 310 },
//   { date: "2024-05-03", Innlandet: 247, Lab: 190 },
//   { date: "2024-05-04", Innlandet: 385, Lab: 420 },
//   { date: "2024-05-05", Innlandet: 481, Lab: 390 },
//   { date: "2024-05-06", Innlandet: 498, Lab: 520 },
//   { date: "2024-05-07", Innlandet: 388, Lab: 300 },
//   { date: "2024-05-08", Innlandet: 149, Lab: 210 },
//   { date: "2024-05-09", Innlandet: 227, Lab: 180 },
//   { date: "2024-05-10", Innlandet: 293, Lab: 330 },
//   { date: "2024-05-11", Innlandet: 335, Lab: 270 },
//   { date: "2024-05-12", Innlandet: 197, Lab: 240 },
//   { date: "2024-05-13", Innlandet: 197, Lab: 160 },
//   { date: "2024-05-14", Innlandet: 448, Lab: 490 },
//   { date: "2024-05-15", Innlandet: 473, Lab: 380 },
//   { date: "2024-05-16", Innlandet: 338, Lab: 400 },
//   { date: "2024-05-17", Innlandet: 499, Lab: 420 },
//   { date: "2024-05-18", Innlandet: 315, Lab: 350 },
//   { date: "2024-05-19", Innlandet: 235, Lab: 180 },
//   { date: "2024-05-20", Innlandet: 177, Lab: 230 },
//   { date: "2024-05-21", Innlandet: 82, Lab: 140 },
//   { date: "2024-05-22", Innlandet: 81, Lab: 120 },
//   { date: "2024-05-23", Innlandet: 252, Lab: 290 },
//   { date: "2024-05-24", Innlandet: 294, Lab: 220 },
//   { date: "2024-05-25", Innlandet: 201, Lab: 250 },
//   { date: "2024-05-26", Innlandet: 213, Lab: 170 },
//   { date: "2024-05-27", Innlandet: 420, Lab: 460 },
//   { date: "2024-05-28", Innlandet: 233, Lab: 190 },
//   { date: "2024-05-29", Innlandet: 78, Lab: 130 },
//   { date: "2024-05-30", Innlandet: 340, Lab: 280 },
//   { date: "2024-05-31", Innlandet: 178, Lab: 230 },
//   { date: "2024-06-01", Innlandet: 178, Lab: 200 },
//   { date: "2024-06-02", Innlandet: 470, Lab: 410 },
//   { date: "2024-06-03", Innlandet: 103, Lab: 160 },
//   { date: "2024-06-04", Innlandet: 439, Lab: 380 },
//   { date: "2024-06-05", Innlandet: 88, Lab: 140 },
//   { date: "2024-06-06", Innlandet: 294, Lab: 250 },
//   { date: "2024-06-07", Innlandet: 323, Lab: 370 },
//   { date: "2024-06-08", Innlandet: 385, Lab: 320 },
//   { date: "2024-06-09", Innlandet: 438, Lab: 480 },
//   { date: "2024-06-10", Innlandet: 155, Lab: 200 },
//   { date: "2024-06-11", Innlandet: 92, Lab: 150 },
//   { date: "2024-06-12", Innlandet: 492, Lab: 420 },
//   { date: "2024-06-13", Innlandet: 81, Lab: 130 },
//   { date: "2024-06-14", Innlandet: 426, Lab: 380 },
//   { date: "2024-06-15", Innlandet: 307, Lab: 350 },
//   { date: "2024-06-16", Innlandet: 371, Lab: 310 },
//   { date: "2024-06-17", Innlandet: 475, Lab: 520 },
//   { date: "2024-06-18", Innlandet: 107, Lab: 170 },
//   { date: "2024-06-19", Innlandet: 341, Lab: 290 },
//   { date: "2024-06-20", Innlandet: 408, Lab: 450 },
//   { date: "2024-06-21", Innlandet: 169, Lab: 210 },
//   { date: "2024-06-22", Innlandet: 317, Lab: 270 },
//   { date: "2024-06-23", Innlandet: 480, Lab: 530 },
//   { date: "2024-06-24", Innlandet: 132, Lab: 180 },
//   { date: "2024-06-25", Innlandet: 141, Lab: 190 },
//   { date: "2024-06-26", Innlandet: 434, Lab: 380 },
//   { date: "2024-06-27", Innlandet: 448, Lab: 490 },
//   { date: "2024-06-28", Innlandet: 149, Lab: 200 },
//   { date: "2024-06-29", Innlandet: 103, Lab: 160 },
//   { date: "2024-06-30", Innlandet: 446, Lab: 400 },
// ]

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  Innlandet: {
    label: "Innlandet",
    color: "#fff",
  },
  Lab: {
    label: "Lab",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const [timeRange, setTimeRange] = React.useState("90d")

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="pt-0 bg-black/70 text-white shadow-lg">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Nettverkstrafikk</CardTitle>
          <CardDescription>
            Nettverkstrafikk over tid
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Sist 3 måneder
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Sist 30 dager
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Sist 7 dager
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillInnlandet" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="#fff"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="#fff"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillLab" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-Lab)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-Lab)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="Lab"
              type="natural"
              fill="url(#fillLab)"
              stroke="var(--color-Lab)"
              stackId="a"
            />
            <Area
              dataKey="Innlandet"
              type="natural"
              fill="url(#fillInnlandet)"
              stroke="#fff"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
