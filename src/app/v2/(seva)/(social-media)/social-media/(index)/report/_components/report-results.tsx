"use client";

import { useState, useEffect, useCallback } from "react";
import {
  useFilters,
  useSearchTrigger,
  useSelectedPlatformId,
  useFilterActions,
} from "@/store/useFilterStore";
import { useAppSelector } from "@/redux/store";
import { getRegionValue } from "@/shared/functions/location";
import { getDateFilters } from "@/shared/functions/filter";
import apiClient from "@/http/index";
import { CopyBar } from "./copy-bar";
import { SevadarList, type SevadarRow } from "./sevadar-list";
import { AllPlatformsList, type PlatformRow } from "./all-platforms-list";
import { BookOrderList, type BookOrderRow } from "./book-order-list";
import {
  buildSevadarPendingMsg,
  buildAllPlatformsMsg,
  buildPlatformWiseMsg,
  splitLongMessage,
} from "../_utils/message-templates";
import { Card } from "@/components/v2/ui/card";
import { MoreHorizontal } from "lucide-react";
import { Separator } from "@/components/v2/ui/separator";

const DUMMY_SEVADAR = [
  {
    father: "Rajesh Kumar",
    son: "Amit Kumar",
  },
  {
    father: "Ramesh Sharma",
    son: "Rohit Sharma",
  },
  {
    father: "Suresh Verma",
    son: "Rahul Verma",
  },
  {
    father: "Mahesh Patel",
    son: "Karan Patel",
  },
  {
    father: "Vijay Singh",
    son: "Arjun Singh",
  },
  {
    father: "Manoj Gupta",
    son: "Ankit Gupta",
  },
  {
    father: "Ashok Yadav",
    son: "Deepak Yadav",
  },
  {
    father: "Pradeep Mishra",
    son: "Aditya Mishra",
  },
  {
    father: "Sunil Thakur",
    son: "Vikram Thakur",
  },
  {
    father: "Dinesh Tiwari",
    son: "Harsh Tiwari",
  },
  {
    father: "Rakesh Sahu",
    son: "Mohit Sahu",
  },
  {
    father: "Anil Agrawal",
    son: "Nikhil Agrawal",
  },
  {
    father: "Om Prakash",
    son: "Shivam Prakash",
  },
  {
    father: "Mohan Lal",
    son: "Gaurav Lal",
  },
  {
    father: "Krishna Das",
    son: "Abhishek Das",
  },
  {
    father: "Harish Chandra",
    son: "Sandeep Chandra",
  },
  {
    father: "Ram Kumar",
    son: "Pankaj Kumar",
  },
  {
    father: "Gopal Singh",
    son: "Yash Singh",
  },
  {
    father: "Narendra Patel",
    son: "Rohan Patel",
  },
  {
    father: "Shyam Sundar",
    son: "Manish Sundar",
  },
];

function DebugBar({ data }: { data: unknown }) {
  const [open, setOpen] = useState(false);
  if (process.env.NODE_ENV === "production") return null;
  return (
    <div className="fixed bottom-4 left-4 z-[9999] max-w-[90vw]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="bg-black/80 text-green-400 text-[11px] font-mono px-3 py-1 rounded-full shadow-lg"
      >
        {open ? "x debug" : "debug"}
      </button>
      {open && (
        <div className="mt-2 bg-black/90 text-green-300 text-[10px] font-mono rounded-xl p-3 max-h-[50vh] overflow-auto shadow-2xl whitespace-pre-wrap break-all">
          {JSON.stringify(data, null, 2)}
        </div>
      )}
    </div>
  );
}

function resolveName(r: any): string {
  return (
    r.sevadar_name ||
    r.tehsil_name ||
    r.district_name ||
    r.division_name ||
    r.state_name ||
    r.country_name ||
    r.mobile_no ||
    (r.sevadar_id ? `ID: ${r.sevadar_id}` : null) ||
    "Unknown"
  );
}

function resolveEntityId(r: any, idx: number): number {
  return (
    r.sevadar_id ??
    r.tehsil_id ??
    r.district_id ??
    r.division_id ??
    r.state_id ??
    r.country_id ??
    idx
  );
}

/**
 * For social_media_seva_wise_report_all_regions
 * Response shape: { headers, report: { questions, regions, seva_count } }
 */
function transformSevadarWiseResult(apiData: any): SevadarRow[] {
  const report = apiData?.report ?? apiData;
  const regions: any[] = Array.isArray(report?.regions) ? report.regions : [];
  const sevaCounts: any[] = Array.isArray(report?.seva_count)
    ? report.seva_count
    : [];
  const questions: any[] = Array.isArray(report?.questions)
    ? report.questions
    : [];
  const totalQuestions = questions.length || 1;

  const regionLabel =
    apiData?.headers?.district ||
    apiData?.headers?.tehsil ||
    apiData?.headers?.division ||
    apiData?.headers?.state ||
    apiData?.headers?.country ||
    undefined;

  return regions.map((r, idx) => {
    const entityId = resolveEntityId(r, idx);
    const entityKey = r.sevadar_id
      ? "sevadar_id"
      : r.tehsil_id
        ? "tehsil_id"
        : r.district_id
          ? "district_id"
          : r.division_id
            ? "division_id"
            : r.state_id
              ? "state_id"
              : "country_id";

    const myCount = sevaCounts.filter((sc) => sc[entityKey] === entityId);
    const submitted = myCount.filter((sc) => (sc.seva_count ?? 0) > 0).length;

    const badgeNum = idx + 1;
    const isTeamLeader = r.role_id !== undefined && r.role_id !== null;
    const badge = isTeamLeader ? `T${badgeNum}` : `S${badgeNum}`;
    const badgeType: "S" | "T" = isTeamLeader ? "T" : "S";

    return {
      id: entityId,
      name: resolveName(r),
      guardian_name: r.guardian_name,
      relation: r.relation,
      badge,
      badgeType,
      submitted,
      total: totalQuestions,
      region: regionLabel,
    };
  });
}

/**
 * For social_media_report_seva_wise (platform-wise)
 * Response shape: { question, report: [{ sevadar_id, sevadar_name, seva_count, seva_sum, ... }] }
 */
function transformPlatformWiseResult(apiData: any): SevadarRow[] {
  const report: any[] = Array.isArray(apiData?.report) ? apiData.report : [];

  return report.map((r, idx) => ({
    id: resolveEntityId(r, idx),
    name: resolveName(r),
    guardian_name: r.guardian_name,
    relation: r.relation,
    badge: `S${idx + 1}`,
    badgeType: "S" as const,
    submitted: (r.seva_count ?? 0) > 0 ? 1 : 0,
    total: 1,
    region: undefined,
  }));
}

function transformAllPlatformsResult(apiData: any) {
  return {
    rows: (apiData?.reports ?? []).map(
      (r: any): PlatformRow => ({
        question: r.question ?? "",
        icon: r.icon ?? "facebook",
        seva_count: r.seva_count ?? 0,
      }),
    ),
    total_sevadar: apiData?.total_sevadar ?? 0,
    total_submissions: apiData?.total_submissions ?? 0,
  };
}

export function ReportResults() {
  const filters = useFilters();
  const searchTrigger = useSearchTrigger();
  const selectedPlatformId = useSelectedPlatformId();
  const { setFilterCollapsed } = useFilterActions();
  const { active_permission, active_region_index } = useAppSelector(
    (s) => s.auth,
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawDebug, setRawDebug] = useState<unknown>(null);
  const [sevadarRows, setSevadarRows] = useState<SevadarRow[]>([]);
  const [platformRows, setPlatformRows] = useState<PlatformRow[]>([]);
  const [bookOrderRows, setBookOrderRows] = useState<BookOrderRow[]>([]);
  const [bookOrderTotals, setBookOrderTotals] = useState({
    national: 0,
    international: 0,
  });
  const [messages, setMessages] = useState<string[]>([]);

  const topTab = (filters.top_tab as string) ?? "sm-seva";
  const subTab = (filters.sub_tab as string) ?? "sm-sevadar";
  const scope = (filters.scope as string) ?? "sevadar";
  const timePeriod = (filters.time_period as string) ?? "today";

  const regionParams = getRegionValue(
    active_permission,
    active_region_index,
    "_id",
  );
  const locationName =
    (active_permission?.region as any)?.[active_region_index]?.[
      `${active_permission?.role_region}_name`
    ] ?? "All";

  const tehsilParam =
    filters.tehsil_id !== undefined && filters.tehsil_id !== null
      ? { tehsil: filters.tehsil_id }
      : {};

  const fetchData = useCallback(async () => {
    if (!searchTrigger) return;
    setLoading(true);
    setError(null);

    try {
      let dateParams: { day_filter?: string; start?: string; end?: string };
      if (timePeriod === "custom") {
        dateParams = {
          start: (filters.start as string) || undefined,
          end: (filters.end as string) || undefined,
        };
      } else if (
        (timePeriod === "from-date" || timePeriod === "to-date") &&
        (filters.start || filters.end)
      ) {
        dateParams = {
          day_filter: timePeriod,
          start: filters.start as string | undefined,
          end: filters.end as string | undefined,
        };
      } else {
        dateParams = getDateFilters(timePeriod.replace(/-/g, "_"));
      }
      const dateLabel = dateParams.start
        ? new Date(dateParams.start).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : timePeriod;

      if (topTab === "sm-seva" || topTab === "trend-seva") {
        if (subTab === "all-platforms") {
          const { data } = await apiClient.post(
            "social_media_all_seva_report",
            {
              ...dateParams,
              ...regionParams,
              ...tehsilParam,
            },
          );
          setRawDebug(data);
          const result = transformAllPlatformsResult(data?.data);
          setPlatformRows(result.rows);
          const msg = buildAllPlatformsMsg({
            location: locationName,
            date: dateLabel,
            reports: result.rows,
            totalSevadar: result.total_sevadar,
            totalSubmissions: result.total_submissions,
          });
          setMessages(splitLongMessage(msg));
        } else if (subTab === "platform-wise") {
          if (!selectedPlatformId) {
            setError("Please select a platform first.");
            setLoading(false);
            return;
          }
          const { data } = await apiClient.post(
            "social_media_report_seva_wise",
            {
              ...dateParams,
              ...regionParams,
              ...tehsilParam,
              question_id: selectedPlatformId,
            },
          );
          setRawDebug(data);
          const raw = data?.data?.[0] ?? {};
          const rows = transformPlatformWiseResult(raw);
          setSevadarRows(rows);
          const platformName =
            raw?.question?.question ?? `Platform ${selectedPlatformId}`;
          const msg = buildPlatformWiseMsg({
            location: locationName,
            date: dateLabel,
            platform: platformName,
            rows,
          });
          setMessages(splitLongMessage(msg));
        } else {
          const sevadarLevel = scope === "tehsil" ? "regions" : "sevadar";
          const { data } = await apiClient.post(
            "social_media_seva_wise_report_all_regions",
            {
              ...dateParams,
              ...regionParams,
              ...tehsilParam,
              sevadar_level: sevadarLevel,
            },
          );
          setRawDebug(data);
          const rows = transformSevadarWiseResult(data?.data);
          setSevadarRows(rows);
          const msg = buildSevadarPendingMsg({
            location: locationName,
            date: dateLabel,
            rows: rows.map((r) => ({
              name: r.name,
              tehsil_name: r.region ?? "",
            })),
          });
          setMessages(splitLongMessage(msg));
        }
      } else if (topTab === "book-order") {
        const { data } = await apiClient.post("book_seva_reports", {
          report: {
            ...dateParams,
            ...regionParams,
            ...tehsilParam,
            book_order_scope: filters.book_order_scope,
          },
        });
        setRawDebug(data);
        const rawRows: any[] = data?.data ?? [];
        const rows: BookOrderRow[] = rawRows.map((r) => ({
          name: r.sevadar_name ?? r.name ?? "Unknown",
          guardian_name: r.guardian_name,
          region: r.tehsil_name ?? r.district_name,
          national: r.national_orders ?? r.national ?? 0,
          international: r.international_orders ?? r.international ?? 0,
        }));
        const totalNational = rows.reduce((sum, r) => sum + r.national, 0);
        const totalInternational = rows.reduce(
          (sum, r) => sum + r.international,
          0,
        );
        setBookOrderRows(rows);
        setBookOrderTotals({
          national: totalNational,
          international: totalInternational,
        });
        setMessages([]);
      }

      setFilterCollapsed(true);
    } catch (e: any) {
      console.error(e);
      setError(
        e?.response?.data?.message ??
          e?.message ??
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTrigger]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!searchTrigger) return null;

  const statusFilter = (filters.status as string) ?? "";
  const filteredSevadarRows = sevadarRows.filter((row) => {
    if (!statusFilter) return true;
    const parts = statusFilter.split(",").filter(Boolean);
    if (parts.length === 0) return true;
    const wantPending = parts.includes("pending");
    const wantSubmitted = parts.includes("submitted");
    if (wantPending && wantSubmitted) return true;
    if (wantPending) return row.submitted === 0;
    if (wantSubmitted) return row.submitted > 0;
    return true;
  });

  return (
    <div className="space-y-3">
      <DebugBar data={rawDebug} />

      {messages.length > 0 && <CopyBar messages={messages} />}

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <div className="size-6 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
          <span className="text-xs text-muted-foreground">Loading report…</span>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {(topTab === "sm-seva" || topTab === "trend-seva") &&
            subTab === "all-platforms" && (
              <AllPlatformsList rows={platformRows} />
            )}

          {(topTab === "sm-seva" || topTab === "trend-seva") &&
            subTab !== "all-platforms" && (
              // <SevadarList rows={filteredSevadarRows} />
              <Card className="rounded-2xl ring-0 shadow-sm p-2 gap-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="h-px flex-1 bg-[#C3C9D8]" />
                  <span className="text-[11px] font-medium whitespace-nowrap text-[#8A93A8]">
                    Pune City
                  </span>
                  <span className="h-px flex-1 bg-[#C3C9D8]" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-8 grid place-content-center rounded-lg bg-amber-200 text-amber-800 font-semibold">
                      TL1
                    </div>
                    <p className="text-lg">
                      Ramesh Das{" "}
                      <span className="text-xs">s/o Abhinav Das</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-md">5/10</p>
                    <MoreHorizontal className="size-4 text-gray-400" />
                  </div>
                </div>
                <Separator />
                {DUMMY_SEVADAR.map(({ father, son }) => (
                  <>
                    <div
                      className="flex items-center justify-between"
                      key={`${son}-${father}`}
                    >
                      <p className="text-lg">
                        {son} <span className="text-xs">s/o {father}</span>
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-md">
                          {Math.round(Math.random() * 30)}
                        </p>
                        <MoreHorizontal className="size-4 text-gray-400" />
                      </div>
                    </div>
                    <Separator />
                  </>
                ))}
              </Card>
            )}

          {topTab === "book-order" && (
            <BookOrderList
              rows={bookOrderRows}
              totalNational={bookOrderTotals.national}
              totalInternational={bookOrderTotals.international}
            />
          )}
        </>
      )}
    </div>
  );
}
