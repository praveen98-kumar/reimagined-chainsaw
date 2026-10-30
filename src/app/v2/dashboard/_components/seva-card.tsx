"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/v2/ui/card";
import { cn } from "@/utils/cn";

interface SevaCardProps {
  title: string;
  icon: ReactNode;
  url?: string;
  subtitle?: string;
  gradient?: string;
  onClick?: () => void;
}

const DEFAULT_GRADIENT = "bg-linear-to-r from-[#1B0052] to-[#581FC8]";

export function SevaCard({
  title,
  icon,
  url,
  subtitle,
  gradient,
  onClick,
}: SevaCardProps) {
  const card = (
    <Card className="h-full gap-2 rounded-lg bg-white/60 p-0 pb-3">
      <CardHeader
        className={cn(
          "relative py-1.25 text-xs leading-tight text-white flex-row items-center justify-between",
          gradient ?? DEFAULT_GRADIENT,
        )}
      >
        <CardTitle className="mb-0 font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 px-3">
        <div className="flex h-full min-h-24 flex-col items-center justify-center gap-2 rounded-md  p-3 text-center">
          <span className="flex size-11 items-center justify-center">
            {icon}
          </span>
          {subtitle ? (
            <p className="text-xs leading-snug text-slate-600">{subtitle}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );

  if (url) {
    return (
      <Link className="block h-full" href={url} onClick={onClick}>
        {card}
      </Link>
    );
  }

  return (
    <button
      className="block h-full w-full text-left"
      onClick={onClick}
      type="button"
    >
      {card}
    </button>
  );
}
