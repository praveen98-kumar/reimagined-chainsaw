"use client";

import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import Image from "next/image";
import { Pie, PieChart, type PieLabelRenderProps } from "recharts";
import { Button } from "@/components/v2/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/v2/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/v2/ui/chart";
import { useCountFetch } from "@/hooks/useCountFetch";
import { useAppSelector } from "@/redux/store";
import { cn } from "@/utils/cn";
import { PlatformList } from "../../_components/platform-list";
import { useMemo } from "react";

const blueBg = "bg-linear-to-r from-[#000c45] to-[#0C3BE3]";

const ChartComponent = ({
  pending,
  submitted,
  upcomming,
}: {
  pending: number;
  submitted: number;
  upcomming?: number;
}) => {
  const chartData = [
    {
      name: "pending",
      value: pending,
      fill: "#010D48",
    },
    {
      name: "submitted",
      value: submitted,
      fill: "#2554FF",
    },
  ];

  const chartConfig = {
    value: {
      label: "value",
    },
    pending: {
      label: "Pending",
      color: "#000000",
    },
    submitted: {
      label: "Submitted",
      color: "#000000",
    },
    // upcomming: {
    //   label: "Upcomming",
    //   color: "#000000",
    // },
  } satisfies ChartConfig;

  const total = chartData.reduce((a, c) => a + c.value, 0);
  const RADIAN = Math.PI / 180;

  const renderLabel = (props: PieLabelRenderProps) => {
    const { cx, cy, midAngle = 0, innerRadius, outerRadius, payload } = props;

    if (!total || payload.value === 0) return null;

    const percent = Math.round((payload.value / total) * 100);
    // const isLarge = payload.value / total > 0.5;

    // Keep consistent distance from pie
    const offset = 6;
    const radius = outerRadius + offset;

    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Align text based on side
    const isRightSide = x > cx;

    return (
      <text
        x={x}
        y={y}
        fill="#333"
        textAnchor={isRightSide ? "start" : "end"}
        dominantBaseline="middle"
        fontSize={11}
        fontWeight={500}
      >
        {percent}%
      </text>
    );
  };

  return (
    <div className="flex-1">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-4/3 h-full"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={
              upcomming
                ? [
                    {
                      name: "pending",
                      value: pending,
                      fill: "#FF383C",
                    },
                    {
                      name: "submitted",
                      value: submitted,
                      fill: "#22C55E",
                    },
                    {
                      name: "upcomming",
                      value: upcomming,
                      fill: "#FFCC00",
                    },
                  ]
                : chartData
            }
            dataKey="value"
            nameKey="name"
            innerRadius={25}
            outerRadius={40}
            startAngle={390}
            endAngle={-30}
            labelLine={false}
            label={renderLabel}
            isAnimationActive
          />
        </PieChart>
      </ChartContainer>
    </div>
  );
};

export const SocialMediaDataComponent = ({
  submitted,
  pending,
}: {
  pending: number;
  submitted: number;
}) => {
  return (
    <div className="flex-1 flex gap-1 items-start py-4 justify-end text-xs">
      <div>
        <p className="flex-1 text-right text-[#22C55E]">{submitted}</p>
        <p className="flex-1 text-right text-[#FF383C]">{pending}</p>
      </div>
      <div>
        <p className="text-slate-800 text-left flex-1">Submitted</p>
        <p className="text-slate-800 text-left flex-1">Pending</p>
      </div>
    </div>
  );
};

export const SocialMediaSevaStatusCard = ({
  userRoleId,
  userRole: activeRole,
}: {
  userRoleId?: number;
  userRole?: string;
}) => {
  const queryClient = useQueryClient();
  const type = "socialMediaCounts";
  const sevadar_type = "social_media_sevadar";
  const values = useAppSelector((state) => state.counts[type]);
  const totalDays = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  }, []);

  const { isLoading, getCountsForSevadars } = useCountFetch({
    type,
    activeRole,
    sevadar_type,
    path: "social_media_seva_count",
    userRoleId,
  });

  const submitted = Number(values?.social_media_seva || 0);
  const pending =
    Number(values?.total_sevadar) - Number(values?.social_media_seva) || 0;

  const handleRefresh = async () => {
    await getCountsForSevadars();
    queryClient.invalidateQueries({
      queryKey: ["platform_report"],
    });
  };
  return (
    <Card className="rounded-lg py-0 gap-0">
      <CardHeader
        className={cn(
          "py-1.25 text-white text-xs font-bold text-center leading-tight relative",
          blueBg,
        )}
      >
        <CardTitle className="font-bold">Social Media Seva Status</CardTitle>
        <Image
          className="absolute top-3 left-2"
          src={"/icons/v2/social-media-update.svg"}
          alt="Social media update"
          width={30}
          height={30}
        />
        {activeRole !== sevadar_type && (
          <Button
            className={cn(
              "absolute top-0 right-1 bg-transparent hover:bg-transparent hover:text-white",
              {
                "animate-spin": isLoading,
              },
            )}
            disabled={isLoading}
            onClick={handleRefresh}
            type="button"
            variant="ghost"
            size="icon"
          >
            <RefreshCw />
          </Button>
        )}
      </CardHeader>
      <CardContent className="py-0 px-2.5 gap-0">
        <div className="flex-1 justify-center flex flex-row h-28 px-1">
          <div className="text-left flex-1 pt-4">
            {activeRole === sevadar_type ? (
              <>
                <p className="text-2xl font-medium">
                  {totalDays}
                  <span className="text-[14px] font-thin">Days</span>
                </p>
                <p className="text-[14px] leading-1.5 font-thin">
                  {new Date().toLocaleString("default", { month: "long" })}
                </p>
              </>
            ) : (
              <>
                <p className="text-[28px] leading-8">
                  {Number(values?.total_sevadar || 0)}
                </p>
                <p className="shrink-0 text-[11px]">Total Sevadar</p>
              </>
            )}
          </div>
          <ChartComponent
            pending={
              values?.total_sevadar
                ? pending
                : new Date().getDate() - Number(values.social_media_seva || 0)
            }
            submitted={
              values?.total_sevadar
                ? submitted
                : Number(values.social_media_seva || 0)
            }
            upcomming={
              values?.total_sevadar
                ? undefined
                : totalDays - new Date().getDate()
            }
          />

          {activeRole === sevadar_type ? (
            <div className="flex-1 flex gap-1 items-start py-4 justify-end text-xs">
              <div>
                <p className="flex-1 text-right text-[#22C55E]">
                  {Number(values.social_media_seva || 0)}
                </p>
                <p className="flex-1 text-right text-[#FF383C]">
                  {new Date().getDate() - Number(values.social_media_seva || 0)}
                </p>
                <p className="flex-1 text-right text-[#FFCC00]">
                  {totalDays - new Date().getDate()}
                </p>
              </div>
              <div>
                <p className="text-slate-800 text-left flex-1">Submitted</p>
                <p className="text-slate-800 text-left flex-1">Missed</p>
                <p className="text-slate-800 text-left flex-1">Upcomming</p>
              </div>
            </div>
          ) : (
            <SocialMediaDataComponent pending={pending} submitted={submitted} />
          )}
        </div>
        {activeRole === "ashram_admin" && (
          <div className=" px-1">
            <h3 className="font-semibold text-md">Today's Top Platforms</h3>
            <PlatformList />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
