"use client";

import { Card, CardContent } from "@/components/v2/ui/card";
import Image from "next/image";

export interface BookOrderRow {
  name: string;
  guardian_name?: string;
  region?: string;
  national: number;
  international: number;
}

interface BookOrderListProps {
  rows: BookOrderRow[];
  totalNational: number;
  totalInternational: number;
}

export function BookOrderList({
  rows,
  totalNational,
  totalInternational,
}: BookOrderListProps) {
  const groups: Record<string, BookOrderRow[]> = {};
  for (const row of rows) {
    const key = row.region ?? "Others";
    if (!groups[key]) groups[key] = [];
    groups[key].push(row);
  }

  const orderCountrows = [
    { title: "National Order", count: totalNational, icon: "/icons/v2/india-flag.svg" },
    { title: "International Order", count: totalInternational, icon: "/icons/v2/world.svg" }
  ]

  return (
    <Card className="rounded-2xl ring-0 shadow-sm py-0 overflow-hidden">
      <CardContent className="p-2">
        <table className="w-full border-collapse">
          <tbody>
            {orderCountrows.map((row) => (
              <tr
                key={row.title}
                className="border-b border-border/80 last:border-0"
              >
                <td className="w-10 py-0 align-middle">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-muted/50">
                    <Image
                          src={row.icon}
                          alt={`${row.title || "social"}-platform-icon`}
                          width={24}
                          height={24}
                          className="shrink-0 object-contain"
                        />
                  </div>
                </td>
                <td className="pr-3 align-middle text-left text-sm font-medium text-foreground">
                  {row.title}
                </td>
                <td className="pr-4 align-middle text-right text-sm font-medium tabular-nums text-foreground">
                  {String(row.count).padStart(2, "0")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
