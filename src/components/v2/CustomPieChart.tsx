"use client";

import { Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/v2/ui/chart";

type ChartSlice = {
  name: string;
  value: number;
  fill: string;
};

type ChartConfigBlock = {
  width: string;
  height: string;
  cursor: boolean;
  innerRadius: string;
  outerRadius: string;
  startAngle: string;
  endAngle: string;
  chartConfigLabel: string;
  showPercentage?: boolean;
  percentagePosition?: "inside" | "outside" | "auto";
};

type ChartArrayConfig = Array<{ chartData?: ChartSlice[] } | ChartConfigBlock>;

type Props = {
  config: ChartArrayConfig;
};

export function CustomPieChart({ config }: Props) {
  const dataBlock = config.find(
    (c): c is { chartData: ChartSlice[] } => "chartData" in c,
  );

  const settings = config.find((c): c is ChartConfigBlock => "width" in c);

  if (!dataBlock || !settings) return null;

  const chartData = dataBlock.chartData;

  const chartConfig = {
    value: {
      label: settings.chartConfigLabel,
    },
  } satisfies ChartConfig;

  const width = Number(settings.width);
  const height = Number(settings.height);
  const innerRadius = Number(settings.innerRadius.replace("px", ""));
  const outerRadius = Number(settings.outerRadius.replace("px", ""));
  const startAngle = Number(settings.startAngle);
  const endAngle = Number(settings.endAngle);

  /* ---------- Percentage Calculation ---------- */

  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const maxValue = Math.max(...chartData.map((d) => d.value));

  const enhancedData = chartData.map((item) => ({
    ...item,
    total,
    isLargest: item.value === maxValue,
  }));

  /* ---------- Label Renderer ---------- */

  const renderLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, payload } = props;

    const RADIAN = Math.PI / 180;

    const percent = Math.round(payload.value / payload.total) * 100;

    let radius;

    if (settings.percentagePosition === "inside") {
      radius = innerRadius * 0.6;
    } else if (settings.percentagePosition === "outside") {
      radius = outerRadius + 12;
    } else {
      radius = payload.isLargest ? innerRadius * 0.09 : outerRadius + 12;
    }

    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill={radius === outerRadius + 12 ? "#333" : "#333"}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fontWeight={500}
      >
        {percent}%
      </text>
    );
  };

  /* --------------------------------------------- */

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square"
      style={{ width, height }}
    >
      <PieChart width={width} height={height}>
        {settings.cursor && (
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
        )}

        <Pie
          data={enhancedData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          stroke="none"
          label={settings.showPercentage ? renderLabel : false}
          labelLine={false}
          isAnimationActive
        />
      </PieChart>
    </ChartContainer>
  );
}
