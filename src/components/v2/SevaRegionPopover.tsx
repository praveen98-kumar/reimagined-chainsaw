"use client";

import { Check, ChevronDown, MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import type { SevaType } from "@/config/roles";
import { useSevaRegions } from "@/hooks/useSevaRegions";
import {
  getRegionDisplayName,
  type LocationOption,
} from "@/shared/functions/seva-region";
import { capitalizeWords } from "@/shared/functions/utils";
import { cn } from "@/utils/cn";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface SevaRegionPopoverProps {
  sevas?: readonly SevaType[];
}

export function SevaRegionPopover({ sevas }: SevaRegionPopoverProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const {
    group: activeGroup,
    locations,
    selectedLocation,
    setLocation,
  } = useSevaRegions(sevas);

  const activeGroupLabel = activeGroup
    ? capitalizeWords(activeGroup.replace(/_/g, " "))
    : "";
  const locationLabel = selectedLocation
    ? getRegionDisplayName(selectedLocation.region, selectedLocation.roleRegion)
    : "";
  const triggerLabel = [locationLabel || "Select location", activeGroupLabel]
    .filter(Boolean)
    .join("-");

  const duplicateNames = useMemo(() => {
    const counts = new Map<string, number>();

    for (const option of locations) {
      const name = getRegionDisplayName(option.region, option.roleRegion);
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }

    return new Set(
      [...counts.entries()]
        .filter(([, count]) => count > 1)
        .map(([name]) => name),
    );
  }, [locations]);

  if (locations.length === 0) {
    return null;
  }

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="mx-auto flex max-w-[72vw] items-center justify-center gap-1 text-lg leading-tight text-slate-700"
            aria-label={triggerLabel}
          >
            <MapPin className="size-4 shrink-0 text-slate-500" />
            <span className="truncate capitalize">{triggerLabel}</span>
            <ChevronDown className="size-4 shrink-0 text-slate-500" />
          </button>
        }
      />
      <PopoverContent align="center" sideOffset={20} className="w-80 p-0">
        {/*<div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Location</p>
          <p className="text-xs text-muted-foreground">
            {activeGroupLabel
              ? `${activeGroupLabel} locations for the sevas on this page.`
              : "Locations for the sevas on this page."}
          </p>
        </div>*/}

        <div className="max-h-[60vh] overflow-y-auto overscroll-contain p-2">
          <ul className="space-y-0.5">
            {locations.map((option: LocationOption) => {
              const name = getRegionDisplayName(
                option.region,
                option.roleRegion,
              );
              const isSelected = selectedLocation?.key === option.key;

              return (
                <li key={option.key}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPopoverOpen(false);
                      if (isSelected) return;
                      // setActiveLocation persists the pick to localStorage
                      // synchronously, so a full reload restarts every page
                      // on the new region (fresh queries, filters and state).
                      setLocation(option);
                      window.location.reload();
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors",
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted/60",
                    )}
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate capitalize">{name}</span>
                      {duplicateNames.has(name) && (
                        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          {capitalizeWords(
                            option.roleRegion.replace(/_/g, " "),
                          )}
                        </span>
                      )}
                    </span>
                    {isSelected && <Check className="size-4 shrink-0" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
}
