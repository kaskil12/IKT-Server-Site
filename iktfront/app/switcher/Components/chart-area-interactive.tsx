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

const chartData = [
  { date: "2024-04-01", nettverk: 222 },
  { date: "2024-04-02", nettverk: 97 },
  { date: "2024-04-03", nettverk: 167 },
  { date: "2024-04-04", nettverk: 242 },
  { date: "2024-04-05", nettverk: 373 },
  { date: "2024-04-06", nettverk: 301 },
  { date: "2024-04-07", nettverk: 245 },
  { date: "2024-04-08", nettverk: 409 },
  { date: "2024-04-09", nettverk: 59 },
  { date: "2024-04-10", nettverk: 261 },
  { date: "2024-04-11", nettverk: 327 },
  { date: "2024-04-12", nettverk: 292 },
  { date: "2024-04-13", nettverk: 342 },
  { date: "2024-04-14", nettverk: 137 },
  { date: "2024-04-15", nettverk: 120 },
  { date: "2024-04-16", nettverk: 138 },
  { date: "2024-04-17", nettverk: 446 },
  { date: "2024-04-18", nettverk: 364 },
  { date: "2024-04-19", nettverk: 243 },
  { date: "2024-04-20", nettverk: 89 },
  { date: "2024-04-21", nettverk: 137 },
  { date: "2024-04-22", nettverk: 224 },
  { date: "2024-04-23", nettverk: 138 },
  { date: "2024-04-24", nettverk: 387 },
  { date: "2024-04-25", nettverk: 215 },
  { date: "2024-04-26", nettverk: 75 },
  { date: "2024-04-27", nettverk: 383 },
  { date: "2024-04-28", nettverk: 122 },
  { date: "2024-04-29", nettverk: 315 },
  { date: "2024-04-30", nettverk: 454 },
  { date: "2024-05-01", nettverk: 165 },
  { date: "2024-05-02", nettverk: 293 },
  { date: "2024-05-03", nettverk: 247 },
  { date: "2024-05-04", nettverk: 385 },
  { date: "2024-05-05", nettverk: 481 },
  { date: "2024-05-06", nettverk: 498 },
  { date: "2024-05-07", nettverk: 388 },
  { date: "2024-05-08", nettverk: 149 },
  { date: "2024-05-09", nettverk: 227 },
  { date: "2024-05-10", nettverk: 293 },
  { date: "2024-05-11", nettverk: 335 },
  { date: "2024-05-12", nettverk: 197 },
  { date: "2024-05-13", nettverk: 197 },
  { date: "2024-05-14", nettverk: 448 },
  { date: "2024-05-15", nettverk: 473 },
  { date: "2024-05-16", nettverk: 338 },
  { date: "2024-05-17", nettverk: 499 },
  { date: "2024-05-18", nettverk: 315 },
  { date: "2024-05-19", nettverk: 235 },
  { date: "2024-05-20", nettverk: 177 },
  { date: "2024-05-21", nettverk: 82 },
  { date: "2024-05-22", nettverk: 81 },
  { date: "2024-05-23", nettverk: 252 },
  { date: "2024-05-24", nettverk: 294 },
  { date: "2024-05-25", nettverk: 201 },
  { date: "2024-05-26", nettverk: 213 },
  { date: "2024-05-27", nettverk: 420 },
  { date: "2024-05-28", nettverk: 233 },
  { date: "2024-05-29", nettverk: 78 },
  { date: "2024-05-30", nettverk: 340 },
  { date: "2024-05-31", nettverk: 178 },
  { date: "2024-06-01", nettverk: 178 },
  { date: "2024-06-02", nettverk: 470 },
  { date: "2024-06-03", nettverk: 103 },
  { date: "2024-06-04", nettverk: 439 },
  { date: "2024-06-05", nettverk: 88 },
  { date: "2024-06-06", nettverk: 294 },
  { date: "2024-06-07", nettverk: 323 },
  { date: "2024-06-08", nettverk: 385 },
  { date: "2024-06-09", nettverk: 438 },
  { date: "2024-06-10", nettverk: 155 },
  { date: "2024-06-11", nettverk: 92 },
  { date: "2024-06-12", nettverk: 492 },
  { date: "2024-06-13", nettverk: 81 },
  { date: "2024-06-14", nettverk: 426 },
  { date: "2024-06-15", nettverk: 307 },
  { date: "2024-06-16", nettverk: 371 },
  { date: "2024-06-17", nettverk: 475 },
  { date: "2024-06-18", nettverk: 107 },
  { date: "2024-06-19", nettverk: 341 },
  { date: "2024-06-20", nettverk: 408 },
  { date: "2024-06-21", nettverk: 169 },
  { date: "2024-06-22", nettverk: 317 },
  { date: "2024-06-23", nettverk: 480 },
  { date: "2024-06-24", nettverk: 132 },
  { date: "2024-06-25", nettverk: 141 },
  { date: "2024-06-26", nettverk: 434 },
  { date: "2024-06-27", nettverk: 448 },
  { date: "2024-06-28", nettverk: 149 },
  { date: "2024-06-29", nettverk: 103 },
  { date: "2024-06-30", nettverk: 446 },
]

const chartConfig = {
  nettverk: {
    label: "Nettverk",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export interface Switcher {
  id: number;
  modell: string;
  ip: string;
  lokasjon: string;
  rack: string;
  trafikkMengde: number;
  online: boolean;
  oids: any[];
  monitor: boolean;
}

interface ChartAreaInteractiveProps {
  switches: Switcher[];
  trafficHistory: Record<string, any[]>;
}

export function ChartAreaInteractive({ switches = [], trafficHistory = {} }: ChartAreaInteractiveProps) {
  const [timeRange, setTimeRange] = React.useState("90d");

  // Build chart data from trafficHistory for monitored switches
  const chartData = React.useMemo(() => {
    // Flatten all trafficHistory for monitored switches
    let allTraffic: { date: string; nettverk: number }[] = [];
    switches.forEach(sw => {
      const history = trafficHistory[sw.id] || [];
      history.forEach(entry => {
        const date = new Date(entry.timestamp);
        const dateStr = date.toISOString().slice(0, 10);
        allTraffic.push({ date: dateStr, nettverk: entry.total });
      });
    });
    // Group by date and sum nettverk
    const grouped: Record<string, number> = {};
    allTraffic.forEach(item => {
      grouped[item.date] = (grouped[item.date] || 0) + item.nettverk;
    });
    return Object.entries(grouped).map(([date, nettverk]) => ({ date, nettverk }));
  }, [switches, trafficHistory]);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date();
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Områdegraf - Interaktiv</CardTitle>
          <CardDescription>
            Viser total nettverk for de siste 3 månedene
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Velg en verdi"
          >
            <SelectValue placeholder="Siste 3 måneder" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Siste 3 måneder
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Siste 30 dager
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Siste 7 dager
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
              <linearGradient id="fillNettverk" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-nettverk)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-nettverk)"
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
                const date = new Date(value);
                return date.toLocaleDateString("nb-NO", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("nb-NO", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="nettverk"
              type="natural"
              fill="url(#fillNettverk)"
              stroke="var(--color-nettverk)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
