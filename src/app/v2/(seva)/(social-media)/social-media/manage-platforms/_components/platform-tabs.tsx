"use client";

import { TabsList, TabsTrigger } from "@/components/v2/ui/tabs";
import { cn } from "@/utils/cn";
import { PLATFORM_TABS } from "../_constants/manage-platforms.constants";

export function PlatformTabs() {
  return (
    <TabsList
      className={cn(
        "flex h-auto w-full items-center gap-1 rounded-lg bg-white/60 p-1",
        "shadow-[0_2px_8px_rgba(24,35,90,0.08)]",
      )}
    >
      {PLATFORM_TABS.map((tab) => (
        <TabsTrigger
          key={tab.value}
          value={tab.value}
          className={cn(
            "flex-1 rounded-lg p-2 bg-white text-[#000C45] transition-colors",
            "data-active:font-semibold bg-linear-to-r data-active:from-[#000C45] data-active:to-[#0C3BE3] data-active:text-white data-active:shadow-sm",
            "after:hidden",
          )}
        >
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
