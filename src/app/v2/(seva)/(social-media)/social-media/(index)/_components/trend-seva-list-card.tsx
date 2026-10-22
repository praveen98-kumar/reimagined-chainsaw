"use client";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/v2/ui/card";
import { IMAGES } from "@/constants/images";
import { cn } from "@/utils/cn";

const indigoBg = "bg-linear-to-r from-[#1B0052] to-[#581FC8]";

export function TrendSevaListCard(_props: {
  userRole: string;
  userRoleId: number;
}) {
  return (
    <Card className="rounded-lg bg-white/60 pt-0 gap-2 pb-2">
      <CardHeader
        className={cn(
          "relative py-1.25 text-white text-xs leading-tight flex-row items-center justify-between",
          indigoBg,
        )}
      >
        <CardTitle className="font-semibold mb-0">Trend Seva Form</CardTitle>
        <Image
          className="absolute top-0 right-0"
          src="/icons/v2/nodes.svg"
          alt="Book"
          width={50}
          height={50}
        />
      </CardHeader>
      <CardContent className="px-3 gap-0">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-md p-1.5 aspect-square flex flex-col items-center justify-center">
            <Image
              alt={`trend-seva-media`}
              src={IMAGES.trendSeva}
              width={50}
              height={50}
            />
            <p className="text-slate-800 text-[14px]">Trend Seva</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
