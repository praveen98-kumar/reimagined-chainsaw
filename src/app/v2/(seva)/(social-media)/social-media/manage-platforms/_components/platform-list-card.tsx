"use client";

import Image from "next/image";
import { Pencil } from "lucide-react";
import type { Platform } from "../_types/manage-platforms.types";

interface PlatformListCardProps {
  platform: Platform;
  onEdit: (platform: Platform) => void;
}

export function PlatformListCard({ platform, onEdit }: PlatformListCardProps) {
  return (
    <div className="rounded-2xl bg-white p-3 shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {platform.icon ? (
            <Image
              src={platform.icon}
              alt={platform.title}
              width={28}
              height={28}
              className="size-7 shrink-0 object-contain"
            />
          ) : null}
          <span className="text-sm font-bold text-[#2A2F45]">
            {platform.title}
          </span>
        </div>

        <button
          type="button"
          aria-label={`Edit ${platform.title}`}
          onClick={() => onEdit(platform)}
          className="text-[#2554FF] transition-colors hover:text-[#0C3BE3]"
        >
          <Pencil className="size-4" />
        </button>
      </div>

      {platform.features.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {platform.features.map((feature) => (
            <span
              key={feature.id}
              className="flex items-center gap-1 rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-medium text-[#2A2F45]"
            >
              {feature.icon ? (
                <Image
                  src={feature.icon}
                  alt={feature.title}
                  width={12}
                  height={12}
                  className="size-3 shrink-0 object-contain"
                />
              ) : null}
              {feature.title}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
