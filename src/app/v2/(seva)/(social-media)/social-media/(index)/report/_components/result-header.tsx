"use client";

import { PencilIcon } from "lucide-react";
import { Button } from "@/components/v2/ui/button";
import { cn } from "@/utils/cn";

interface ResultHeaderProps {
  path: string;
  subtitle: string;
  onEdit: () => void;
  className?: string;
}

export function ResultHeader({
  path,
  subtitle,
  onEdit,
  className,
}: ResultHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white p-1 px-2 shadow-[0_2px_8px_rgba(24,35,90,0.08)]">
      <div className="min-w-0">
        <p className="truncate text-[13px] font-bold tracking-tight text-[#2A2F45]">
          {path}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-[#2554FF]">{subtitle}</p>
      </div>
      <Button
        variant="outline"
        onClick={onEdit}
        className={cn(
          "shrink-0 gap-1.5 border-0 bg-linear-to-r text-white shadow-[0_2px_8px_rgba(24,35,90,0.08)]",
          className,
        )}
      >
        <PencilIcon className="size-4" />
        Edit
      </Button>
    </div>
  );
}
