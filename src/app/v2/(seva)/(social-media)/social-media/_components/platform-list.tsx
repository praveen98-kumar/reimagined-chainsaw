"use client";
import Image from "next/image";
import { socialImages3d } from "@/constants/images";
import { useSMPlatformReport } from "@/hooks/useSMPlatformReport";
import { cn } from "@/utils/cn";

import { SOCIAL_MEDIA_TITLE_MAPPER } from "@/utils/social_whatsapp_msg.utils";

const platformGradientMap: Record<string, string> = {
  facebook: "bg-linear-to-r from-[#004E95] to-[#55AFFF]",
  instagram: "bg-linear-to-r from-[#530055] to-[#ED6ED9]",
  youtube: "bg-linear-to-r from-[#5F0000] to-[#D24343]",
  twitter: "bg-linear-to-r from-[#0E0E0E] to-[#5C5C5C]",
};

export function PlatformList() {
  const { platforms, total_sevadar } = useSMPlatformReport();
  return (
    <div className="flex flex-col gap-0.5 text-[#7c2d12]">
      {platforms.map((item) => {
        const percentage =
          total_sevadar > 0 && item.count > 0
            ? ((item.count * 100) / total_sevadar).toFixed(0)
            : "0";
        return (
          <div
            key={item.platform}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-0.5">
              <Image
                alt={`${item.platform}-media`}
                src={socialImages3d[item.platform || "facebook"]}
                width={25}
                height={25}
              />
              <p className="capitalize">
                {SOCIAL_MEDIA_TITLE_MAPPER[item.platform]}
              </p>
            </div>
            <div className="flex w-[70%] gap-0.5 items-center">
              <div className="relative h-2.5 w-full flex-1 border-b border-[#e7d5c4]">
                <div
                  className={cn(
                    "h-full",
                    platformGradientMap?.[item.platform] || "",
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-6 text-right font-semibold">{item.count}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
