"use client";

import { Pie, PieProps, PieChart } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/v2/ui/chart";

export const description = "A donut chart";

const chartData = [
  { browser: "chrome", visitors: 29.82 },
  { browser: "safari", visitors: 55.6 },
  { browser: "firefox", visitors: 18.38 },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "#000000",
  },
  safari: {
    label: "Safari",
  },
  firefox: {
    label: "Firefox",
  },
} satisfies ChartConfig;

const renderCustomLabel = ({ value }: { value: number }) => {
  return `${value.toFixed(1)}%`;
};

interface ChartProps extends PieProps {
  config: ChartConfig;
  containerClassName?: string;
}
export function ChartExample() {
  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto max-w-37.5 max-h-37.5"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          outerRadius={40}
          data={chartData}
          label={renderCustomLabel}
          labelLine={false}
          dataKey="visitors"
          nameKey="browser"
          innerRadius={25}
        />
      </PieChart>
    </ChartContainer>
  );
}
