"use client";

import { Card, CardContent, CardHeader } from "@/components/v2/ui/card";
import { Separator } from "@/components/v2/ui/separator";

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

export function BookOrderList({ rows, totalNational, totalInternational }: BookOrderListProps) {
  const groups: Record<string, BookOrderRow[]> = {};
  for (const row of rows) {
    const key = row.region ?? "Others";
    if (!groups[key]) groups[key] = [];
    groups[key].push(row);
  }

  if (!rows.length) {
    return (
      <Card className="rounded-2xl ring-0 shadow-sm">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">No data found</CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl ring-0 shadow-sm py-0 overflow-hidden">
      {/* Stats header */}
      <CardHeader className="px-0 py-0 border-b border-border">
        <div className="flex">
          <div className="flex-1 flex flex-col items-center justify-center py-4 gap-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">National</p>
            <p className="text-2xl font-bold text-green-600 tabular-nums">{totalNational}</p>
          </div>
          <div className="w-px bg-border self-stretch" />
          <div className="flex-1 flex flex-col items-center justify-center py-4 gap-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">International</p>
            <p className="text-2xl font-bold text-blue-600 tabular-nums">{totalInternational}</p>
          </div>
        </div>
      </CardHeader>

      {/* Column headers */}
      <div className="flex items-center px-4 py-2 bg-muted/30">
        <span className="flex-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Name</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-green-600 w-10 text-center">Natl</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 w-10 text-center">Intl</span>
      </div>

      <CardContent className="px-0 py-0">
        {Object.entries(groups).map(([region, items], groupIdx) => (
          <div key={region}>
            {groupIdx > 0 && <Separator />}
            <div className="flex items-center gap-2 px-4 py-1.5 bg-muted/20">
              <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">{region}</span>
            </div>
            {items.map((row, i) => (
              <div key={`${row.name}-${i}`}>
                <div className="flex items-center px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-foreground truncate">{row.name}</p>
                    {row.guardian_name && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">s/o {row.guardian_name}</p>
                    )}
                  </div>
                  <span className="w-10 text-center text-sm font-bold text-green-600 tabular-nums">{row.national}</span>
                  <span className="w-10 text-center text-sm font-bold text-blue-600 tabular-nums">{row.international}</span>
                </div>
                {i < items.length - 1 && <Separator className="mx-4 w-auto" />}
              </div>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
