"use client";

import { Smartphone as SmartphoneIcon } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/v2/ui/card";
import { socialImages3d } from "@/constants/images";

export interface PlatformRow {
  question: string;
  icon: string;
  seva_count: number;
}

interface AllPlatformsListProps {
  rows: PlatformRow[];
}

const PLATFORM_ICON_ALIASES: Record<string, string> = {
  x: "twitter",
  linked: "linkedin",
  redit: "reddit",
  ycs: "youtube",
  yss: "youtube",
  app: "common",
};

function PlatformIcon({ icon, size = 18 }: { icon: string; size?: number }) {
  const platform = icon?.toLowerCase().trim() ?? "";
  const src: string | undefined =
    socialImages3d[PLATFORM_ICON_ALIASES[platform] ?? platform];

  if (!src) {
    return <SmartphoneIcon size={size} className="text-muted-foreground" />;
  }

  return (
    <Image
      src={src}
      alt={`${platform || "social"}-platform-icon`}
      width={size}
      height={size}
      className="shrink-0 object-contain"
    />
  );
}

export function AllPlatformsList({ rows }: AllPlatformsListProps) {
  if (!rows.length) {
    return (
      <Card className="rounded-2xl ring-0 shadow-sm">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No data found
        </CardContent>
      </Card>
    );
  }

  const totalPosts = rows.reduce((sum, row) => sum + row.seva_count, 0);

  return (
    <Card className="rounded-2xl ring-0 shadow-sm py-0 overflow-hidden gap-0">
      <CardContent className="px-0 py-0">
        <table className="w-full border-collapse">
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.question}
                className="border-b border-border/60 last:border-0"
              >
                <td className="w-12 py-0 pl-4 pr-2 align-middle">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-muted/50">
                    <PlatformIcon icon={row.icon} size={24} />
                  </div>
                </td>
                <td className="py-1 pr-3 align-middle text-left text-[13px] font-medium text-foreground">
                  {row.question}
                </td>
                <td className="py-1 pr-4 align-middle text-right text-sm font-medium tabular-nums text-foreground">
                  {row.seva_count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
      <CardFooter className="flex items-center justify-around gap-0 px-4 py-1.5">
        <div className="text-center">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Total Posts
          </p>
          <p className="text-lg font-medium text-foreground tabular-nums">
            {totalPosts}
          </p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="text-center">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Platforms
          </p>
          <p className="text-lg font-bold text-foreground tabular-nums">
            {rows.length}
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
