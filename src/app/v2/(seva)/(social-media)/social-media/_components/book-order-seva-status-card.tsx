"use client";

import { RefreshCw } from "lucide-react";
import Image from "next/image";
import { CustomPieChart } from "@/components/v2/CustomPieChart";
import { Button } from "@/components/v2/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/v2/ui/card";
import { useCountFetch } from "@/hooks/useCountFetch";
import { useAppSelector } from "@/redux/store";
import type { Region } from "@/shared/interfaces/user";
import { cn } from "@/utils/cn";
import useIsMounted from "@/hooks/useIsMounted";

const adminChartConfig = {
  width: "130",
  height: "130",
  cursor: false,
  innerRadius: "30px",
  outerRadius: "44px",
  startAngle: "390",
  endAngle: "-30",
  chartConfigLabel: "Completed",
  showPercentage: true,
};
const nationalChartConfig = {
  width: "76",
  height: "76",
  cursor: false,
  innerRadius: "22px",
  outerRadius: "34px",
  startAngle: "150",
  endAngle: "-210",
  chartConfigLabel: "Completed",
  showPercentage: false,
};

const internationalChartConfig = {
  width: "76",
  height: "76",
  cursor: false,
  innerRadius: "22px",
  outerRadius: "34px",
  startAngle: "390",
  endAngle: "-30",
  chartConfigLabel: "Pending",
  showPercentage: false,
};

export function BookOrderSevaStatusCard({
  userRoleId,
  userRole: activeRole,
  roleRegion,
  region,
}: {
  userRoleId?: number;
  userRole?: string;
  roleRegion?: string;
  region?: Region | null;
}) {
  const isMounted = useIsMounted();
  const path = "book_order_count";
  const type = "bookOrderCounts";
  const sevadar_type = "book_order_sevadar";

  const values = useAppSelector((state) => state.counts[type]);

  const { isLoading, getCountsForSevadars } = useCountFetch({
    type,
    path,
    activeRole,
    sevadar_type,
    userRoleId,
    roleRegion,
    region,
  });

  const handleRefresh = async () => {
    await getCountsForSevadars();
  };
  if (!isMounted) return null;
  return (
    <Card className="relative gap-0 overflow-hidden rounded-2xl border border-orange-200 bg-white p-0 pb-2 shadow-[0_8px_22px_rgba(154,52,18,0.14)]">
      {/* HEADER */}
      <CardHeader
        className={cn(
          "relative flex items-center justify-center py-2 text-white",
          "bg-[#c2410c]",
        )}
      >
        <Image
          className="absolute top-2 left-2"
          src="/icons/v2/Book.svg"
          alt="Book"
          width={40}
          height={40}
        />

        <CardTitle className="text-sm font-semibold text-center">
          Book Order Seva Status
        </CardTitle>

        {activeRole !== sevadar_type && (
          <Button
            className={cn(
              "absolute top-0 bg-transparent hover:bg-transparent hover:text-white right-1",
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

      {/* BODY */}
      {activeRole !== "book_order_sevadar" && (
        <CardContent className="py-0 px-2.5 h-24 gap-0">
          <div className="flex-1 justify-center flex flex-row px-1">
            <div className="text-left flex-1 pt-2">
              <p className="text-[28px] leading-8">
                {Number(values?.total_sevadar || 0)}
              </p>
              <p className="shrink-0 text-[11px]">Total Sevadar</p>
            </div>
            <div className="flex-1">
              <CustomPieChart
                config={[
                  {
                    chartData: [
                      {
                        name: "Submitted",
                        value: Number(values?.seva_complete) || 0,
                        fill: "#c2410c",
                      },
                      {
                        name: "Pending",
                        value:
                          Number(values?.total_sevadar) -
                            Number(values?.seva_complete) || 0,
                        fill: "#fb923c",
                      },
                    ],
                  },
                  adminChartConfig,
                ]}
              />
            </div>
            <div className="flex-1 flex gap-1 items-start py-4 justify-end text-xs">
              <div>
                <p className="flex-1 text-right text-[#15803d]">
                  {Number(values?.seva_complete) || 0}
                </p>
                <p className="flex-1 text-right text-[#b91c1c]">
                  {Number(values?.total_sevadar) -
                    Number(values?.seva_complete) || 0}
                </p>
              </div>
              <div>
                <p className="text-[#7c2d12] text-left flex-1">Submitted</p>
                <p className="text-[#7c2d12] text-left flex-1">Pending</p>
              </div>
            </div>
          </div>
        </CardContent>
      )}
      <CardFooter className="pt-2 border-t-0 grid grid-cols-2 gap-2">
        {/*Left*/}
        <div>
          <h3 className="font-semibold text-[#431407]">National Orders</h3>
          <div className="flex">
            <div>
              <p>Today</p>
              <p className="text-[#7c2d12] text-xl leading-5 font-medium">
                {values?.tnc || 0}
              </p>

              <p>This Month</p>
              <p className="text-[#7c2d12] text-xl leading-5 font-medium">
                {values?.mnc || 0}
              </p>
            </div>
            <CustomPieChart
              config={[
                {
                  chartData: [
                    {
                      name: "Completed",
                      value: Number(values?.tnc || 0),
                      fill: "#fb923c",
                    },
                    {
                      name: "Pending",
                      value: Number(values?.mnc || 0),
                      fill: "#c2410c",
                    },
                  ],
                },
                nationalChartConfig,
              ]}
            />
          </div>
        </div>
        {/*Right*/}
        <div>
          <h3 className="font-semibold text-[#431407] text-right">
            International Orders
          </h3>
          <div className="flex">
            <CustomPieChart
              config={[
                {
                  chartData: [
                    {
                      name: "Completed",
                      value: Number(values?.tic || 0),
                      fill: "#fb923c",
                    },
                    {
                      name: "Pending",
                      value: Number(values?.mic || 0),
                      fill: "#c2410c",
                    },
                  ],
                },
                internationalChartConfig,
              ]}
            />

            <div className="text-right">
              <p>Today</p>
              <p className="text-[#7c2d12] text-xl leading-5 font-medium">
                {values?.tic || 0}
              </p>

              <p>This Month</p>
              <p className="text-[#7c2d12] text-xl leading-5 font-medium">
                {values?.mic || 0}
              </p>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
