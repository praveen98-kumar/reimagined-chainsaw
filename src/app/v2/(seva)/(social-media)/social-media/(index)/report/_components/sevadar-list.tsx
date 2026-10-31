"use client";

import { cn } from "@/utils/cn";
import { Card, CardContent } from "@/components/v2/ui/card";
import { Separator } from "@/components/v2/ui/separator";
import { Badge } from "@/components/v2/ui/badge";

export interface SevadarRow {
  id: number;
  name: string;
  guardian_name?: string;
  relation?: string;
  badge?: string;
  badgeType?: "S" | "T";
  submitted: number;
  total: number;
  region?: string;
}

function groupByRegion(rows: SevadarRow[]) {
  const groups: Record<string, SevadarRow[]> = {};
  for (const row of rows) {
    const key = row.region ?? "Others";
    if (!groups[key]) groups[key] = [];
    groups[key].push(row);
  }
  return groups;
}

function ProgressPill({
  submitted,
  total,
}: {
  submitted: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((submitted / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            pct === 100
              ? "bg-green-500"
              : pct > 0
                ? "bg-amber-400"
                : "bg-rose-300",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold tabular-nums text-foreground w-9 text-right">
        {submitted}/{total}
      </span>
    </div>
  );
}

export function SevadarList({ rows }: { rows: SevadarRow[] }) {
  if (!rows.length) {
    return (
      <Card className="rounded-2xl ring-0 shadow-sm">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No data found
        </CardContent>
      </Card>
    );
  }

  const groups = groupByRegion(rows);
  const total = rows.length;
  const submitted = rows.filter((r) => r.submitted > 0).length;
  const pending = total - submitted;
  const pct = Math.round((submitted / total) * 100);

  return (
    <Card className="rounded-2xl ring-0 shadow-sm py-0 overflow-hidden">
      {/* Summary header */}
      <div className="px-4 pt-3 pb-2.5 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-foreground">
            {total} Sevadars
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {pct}% done
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[11px] text-green-600 font-medium">
            {submitted} submitted
          </span>
          <span className="text-[11px] text-rose-500 font-medium">
            {pending} pending
          </span>
        </div>
      </div>

      {Object.entries(groups).map(([region, items], groupIdx) => (
        <div key={region}>
          {groupIdx > 0 && <Separator />}
          <div className="flex items-center gap-2 px-4 py-1.5 bg-muted/30">
            <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              {region}
            </span>
          </div>
          <CardContent className="px-0 py-0">
            {items.map((row, i) => (
              <div key={row.id}>
                <div className="flex items-center gap-2.5 px-4 py-3">
                  {row.badge && (
                    <Badge
                      variant={row.badgeType === "T" ? "teamLeader" : "sevadar"}
                      className="min-w-[30px] text-center flex-shrink-0 font-bold text-[10px] justify-center"
                    >
                      {row.badge}
                    </Badge>
                  )}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-[13px] font-semibold leading-tight truncate",
                        row.submitted > 0 ? "text-green-700" : "text-rose-600",
                      )}
                    >
                      {row.name}
                    </p>
                    {row.guardian_name && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        {row.relation ?? "s/o"} {row.guardian_name}
                      </p>
                    )}
                  </div>
                  <ProgressPill submitted={row.submitted} total={row.total} />
                </div>
                {i < items.length - 1 && <Separator className="mx-4 w-auto" />}
              </div>
            ))}
          </CardContent>
        </div>
      ))}

      {rows.some((r) => r.badgeType === "T") && (
        <div className="flex gap-4 px-4 py-2.5 border-t border-border bg-muted/20">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1.5">
            <Badge variant="sevadar" className="font-bold text-[9px]">
              S
            </Badge>
            Sevadar
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1.5">
            <Badge variant="teamLeader" className="font-bold text-[9px]">
              T
            </Badge>
            Team Leader
          </span>
        </div>
      )}
    </Card>
  );
}
