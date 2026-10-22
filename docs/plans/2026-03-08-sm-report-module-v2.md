# SM Report Module v2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire the v2 SM Report module — populate dropdowns from API, trigger data fetch on Search, render three report types (SM Seva, Trend Seva, Book Order) with correct data, and add WhatsApp share with message templates.

**Architecture:** Extend the Zustand filter store with a `searchTrigger` counter; Search button increments it. A new `ReportResults` client component watches the trigger + filter state and renders the appropriate result sub-component. Each report type (SM Sevadar, All Platforms, Platform Wise, Book Order) is a separate component with its own data fetch using plain axios + React state (consistent with v2 patterns).

**Tech Stack:** Next.js 14 App Router, React, Zustand, axios (apiClient from `@/http/index`), Redux (for auth/region via `useAppSelector`), Tailwind CSS, shadcn/ui, Framer Motion (already in use), `@/shared/functions/filter` for date params, `@/shared/functions/location` for region params.

---

## Reference Files
- Filter store: `src/store/useFilterStore.ts`
- API client: `src/http/index.ts`
- Date utils: `src/shared/functions/filter.ts` → `getDateFilters()`
- Region utils: `src/shared/functions/location.ts` → `getRegionValue()`
- v1 reference: `src/pages/seva/social/whatsapp-report.tsx`
- v1 message templates: `src/utils/social_whatsapp_msg.utils.ts`
- Current filters component: `src/app/v2/(seva)/(social-media)/social-media/(index)/report/_components/report-filters.tsx`
- Current page: `src/app/v2/(seva)/(social-media)/social-media/(index)/report/page.tsx`

## Base Path
All v2 report files live at:
`src/app/v2/(seva)/(social-media)/social-media/(index)/report/`

---

### Task 1: Extend the Zustand filter store

**Files:**
- Modify: `src/store/useFilterStore.ts`

Add `searchTrigger: number` (incremented on Search to re-fetch) and `selectedPlatformId: number | null` to the store.

**Implementation:**

Read the current file first (31 lines), then replace with:

```typescript
import { create } from "zustand";

type PrimitiveValue = string | number | boolean | null | undefined;

interface State {
  filters: Record<string, PrimitiveValue>;
  searchTrigger: number;
  selectedPlatformId: number | null;
  actions: {
    setFilters: (payload: Record<string, PrimitiveValue>) => void;
    resetFilters: () => void;
    triggerSearch: () => void;
    setSelectedPlatformId: (id: number | null) => void;
  };
}

const selectFilters = (s: State) => s.filters;
const selectSearchTrigger = (s: State) => s.searchTrigger;
const selectSelectedPlatformId = (s: State) => s.selectedPlatformId;
const selectFilterActions = (s: State) => s.actions;

const useFilterStore = create<State>((set) => ({
  filters: {},
  searchTrigger: 0,
  selectedPlatformId: null,
  actions: {
    setFilters: (payload) =>
      set((state) => ({ filters: { ...state.filters, ...payload } })),
    resetFilters: () => set({ filters: {}, searchTrigger: 0, selectedPlatformId: null }),
    triggerSearch: () => set((state) => ({ searchTrigger: state.searchTrigger + 1 })),
    setSelectedPlatformId: (id) => set({ selectedPlatformId: id }),
  },
}));

export const useFilters = () => useFilterStore(selectFilters);
export const useSearchTrigger = () => useFilterStore(selectSearchTrigger);
export const useSelectedPlatformId = () => useFilterStore(selectSelectedPlatformId);
export const useFilterActions = () => useFilterStore(selectFilterActions);
```

**Verify:** TypeScript compiles without errors — existing components use `useFilters` and `useFilterActions`, both still exported.

---

### Task 2: Update SearchButton to call triggerSearch

**Files:**
- Read: `src/components/v2/SearchButton.tsx` (find the file first)
- Modify: `src/components/v2/SearchButton.tsx`

The SearchButton currently has a `disabled` prop. Wire it to call `triggerSearch()` from the store on click.

**Implementation:**

First read the file. Then add `onClick` that calls `triggerSearch`:

```tsx
"use client";
import { useFilterActions } from "@/store/useFilterStore";
// ... existing imports

export function SearchButton({ disabled }: { disabled?: boolean }) {
  const { triggerSearch } = useFilterActions();
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={triggerSearch}
      // ... existing className
    >
      {/* existing content */}
    </button>
  );
}
```

If SearchButton already accepts `onClick`, just pass `triggerSearch` from `report-filters.tsx` instead. Adapt based on what you see.

---

### Task 3: Populate Platform dropdown from API in report-filters

**Files:**
- Modify: `src/app/v2/(seva)/(social-media)/social-media/(index)/report/_components/report-filters.tsx`

Add `useEffect` to fetch platform options from `social_media_question` (GET) and pass to the Platform `ReactSelect`. Also wire `selectedPlatformId` store setter on platform change.

**Implementation — add inside `ReportFilters` component:**

```typescript
import apiClient from "@/http/index";
import { useFilterActions } from "@/store/useFilterStore";

// Inside component:
const { setFilters, resetFilters, setSelectedPlatformId } = useFilterActions();
const [platformOptions, setPlatformOptions] = useState<{label: string; value: number}[]>([]);
const [selectedPlatform, setSelectedPlatform] = useState<{label: string; value: number} | null>(null);

useEffect(() => {
  apiClient.get("social_media_question").then(({ data }) => {
    const opts = (data?.data ?? []).map((q: any) => ({
      label: q.question,
      value: q.id,
      icon: q.icon,
    }));
    setPlatformOptions(opts);
  }).catch(console.error);
}, []);

// On platform select change:
const handlePlatformChange = (opt: any) => {
  setSelectedPlatform(opt);
  setSelectedPlatformId(opt?.value ?? null);
};
```

Wire `options={platformOptions}` and `value={selectedPlatform}` and `onChange={handlePlatformChange}` to the Platform `ReactSelect` (line ~289 in current file).

---

### Task 4: Populate Tehsil dropdown from API in report-filters

**Files:**
- Modify: `src/app/v2/(seva)/(social-media)/social-media/(index)/report/_components/report-filters.tsx`

Add `useAppSelector` to get user's district/tehsil, then fetch tehsil list on mount.

**Implementation — add inside `ReportFilters`:**

```typescript
import { useAppSelector } from "@/redux/store";

// Inside component:
const { active_permission, active_region_index } = useAppSelector((s) => s.auth);
const [tehsilOptions, setTehsilOptions] = useState<{label: string; value: number}[]>([]);
const [selectedTehsil, setSelectedTehsil] = useState<{label: string; value: number} | null>(null);

useEffect(() => {
  const district = active_permission?.region?.[active_region_index]?.district_id;
  if (!district) return;
  apiClient.get(`tehsil_list?district_id=${district}`).then(({ data }) => {
    const opts = (data?.data ?? []).map((t: any) => ({
      label: t.name,
      value: t.id,
    }));
    setTehsilOptions(opts);
  }).catch(console.error);
}, [active_permission, active_region_index]);

// Wire to Tehsil ReactSelect:
const handleTehsilChange = (opt: any) => {
  setSelectedTehsil(opt);
  setFilters({ tehsil_id: opt?.value ?? null });
};
```

Wire `options={tehsilOptions}` and `value={selectedTehsil}` and `onChange={handleTehsilChange}` to the Tehsil `ReactSelect` (line ~182 in current file).

For Team Leader scope, add a stub `ReactSelect` with `options={[]}` and a TODO comment — the endpoint isn't identified yet.

---

### Task 5: Update page.tsx — remove accordion stubs, add ReportResults

**Files:**
- Modify: `src/app/v2/(seva)/(social-media)/social-media/(index)/report/page.tsx`
- Create: `src/app/v2/(seva)/(social-media)/social-media/(index)/report/_components/report-results.tsx` (stub for now)

**New page.tsx:**

```tsx
import { PageHeader } from "@/components/v2/PageHeader";
import { IMAGES } from "@/constants/images";
import { ReportFilters } from "./_components/report-filters";
import { ReportResults } from "./_components/report-results";

export default function Page() {
  return (
    <>
      <PageHeader
        title="Social Media Seva"
        subTitle="Pune - Sevadar"
        icon={IMAGES.allSocial}
      />
      <div className="p-4 space-y-4">
        <ReportFilters />
        <ReportResults />
      </div>
    </>
  );
}
```

**Stub report-results.tsx (will be filled in Tasks 6-10):**

```tsx
"use client";

export function ReportResults() {
  return null; // placeholder
}
```

---

### Task 6: Create result-header component

**Files:**
- Create: `src/app/v2/(seva)/(social-media)/social-media/(index)/report/_components/result-header.tsx`

This renders the context breadcrumb + filter summary + Edit button that appears at the top of results.

Design spec: White card, rounded, shadow-sm. Left: bold path text (e.g. "SM Seva > SM Sevadar") + muted subtitle (e.g. "Today | All Tehsil"). Right: indigo "Edit" button with pencil icon.

```tsx
"use client";

import { PencilIcon } from "lucide-react";

interface ResultHeaderProps {
  path: string;       // "SM Seva > SM Sevadar"
  subtitle: string;   // "Today | All Tehsil"
  onEdit: () => void;
}

export function ResultHeader({ path, subtitle, onEdit }: ResultHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-indigo-900">{path}</p>
        <p className="text-xs text-indigo-400 mt-0.5">{subtitle}</p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
      >
        <PencilIcon className="size-3" />
        Edit
      </button>
    </div>
  );
}
```

---

### Task 7: Create WhatsApp copy bar component

**Files:**
- Create: `src/app/v2/(seva)/(social-media)/social-media/(index)/report/_components/copy-bar.tsx`

Three buttons: Copy 1, Copy 2, Copy 3 with green WhatsApp icon. Each triggers copy + share.

```tsx
"use client";

import { MessageCircle } from "lucide-react";
import { cn } from "@/utils/cn";

interface CopyBarProps {
  messages: string[];  // Up to 3 message strings
}

const copyToClipboard = (text: string) => navigator.clipboard?.writeText(text);
const shareViaWhatsApp = (text: string) => {
  if (navigator.share) {
    navigator.share({ text });
  } else {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }
};

export function CopyBar({ messages }: CopyBarProps) {
  if (!messages.length) return null;
  return (
    <div className="flex gap-2 bg-white rounded-2xl px-3 py-2 shadow-sm">
      <MessageCircle className="size-5 text-green-500 flex-shrink-0 mt-0.5" />
      {messages.map((msg, i) => (
        <button
          key={i}
          type="button"
          onClick={() => shareViaWhatsApp(msg)}
          onLongPress={() => copyToClipboard(msg)}
          className="flex-1 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-xl py-2 px-1 hover:bg-indigo-100 transition-colors"
        >
          Copy {i + 1}
        </button>
      ))}
    </div>
  );
}
```

Note: `onLongPress` doesn't exist in React. Use `onContextMenu` for desktop or just `onClick` for copy. Simplify to `onClick={shareViaWhatsApp}` and add a separate small "copy" icon if needed. Adapt based on UX preference.

---

### Task 8: Create sevadar-list component (SM Sevadar + Platform Wise result)

**Files:**
- Create: `src/app/v2/(seva)/(social-media)/social-media/(index)/report/_components/sevadar-list.tsx`

This renders the grouped sevadar list used by SM Seva > SM Sevadar and Platform Wise views.

Design spec from screenshots:
- Rows grouped by tehsil/region name (grey centered label between groups)
- Each row: [Badge S1/T1] Name s/o guardian | count (05/10) | ⋮ menu
- Badge colors: S = pink/red bg, T = amber/yellow bg
- Name color: red = pending (submitted < total), green = submitted (submitted > 0)
- Count format: `submitted/total` (padded to 2 digits)

```tsx
"use client";

import { cn } from "@/utils/cn";
import { MoreVertical } from "lucide-react";

export interface SevadarRow {
  id: number;
  name: string;
  guardian_name?: string;
  relation?: string;
  badge?: string;        // "S1", "T1", "T2" etc. null for plain rows
  badgeType?: "S" | "T"; // S=sevadar (pink), T=team leader (amber)
  submitted: number;
  total: number;
  region?: string;       // for grouping
}

interface SevadarListProps {
  rows: SevadarRow[];
}

function formatCount(n: number) {
  return String(n).padStart(2, "0");
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

export function SevadarList({ rows }: SevadarListProps) {
  const groups = groupByRegion(rows);
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      {Object.entries(groups).map(([region, items]) => (
        <div key={region}>
          <div className="text-center text-xs text-gray-400 font-medium py-1.5 bg-gray-50/60">
            {region}
          </div>
          {items.map((row, i) => {
            const isPending = row.submitted === 0;
            const isSubmitted = row.submitted > 0;
            return (
              <div
                key={row.id}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5",
                  i < items.length - 1 && "border-b border-gray-100"
                )}
              >
                {row.badge && (
                  <span
                    className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[28px] text-center",
                      row.badgeType === "T"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-rose-100 text-rose-700"
                    )}
                  >
                    {row.badge}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isSubmitted ? "text-green-600" : "text-rose-500"
                    )}
                  >
                    {row.name}
                  </span>
                  {row.guardian_name && (
                    <span className="text-xs text-gray-400 ml-1">
                      {row.relation ?? "s/o"} {row.guardian_name}
                    </span>
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-700 tabular-nums">
                  {formatCount(row.submitted)}/{formatCount(row.total)}
                </span>
                <MoreVertical className="size-4 text-gray-300 flex-shrink-0" />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
```

---

### Task 9: Create all-platforms-list component (SM Seva > All SM Platforms)

**Files:**
- Create: `src/app/v2/(seva)/(social-media)/social-media/(index)/report/_components/all-platforms-list.tsx`

Design spec from screenshots:
- List rows: [platform icon] Platform Name .... count
- Summary row at bottom: Total Sevadar / Updates Given / Updates Pending

Platform icons: import from `@/constants/images` or use a simple emoji/text map. In the design they're social media icons. Use a `platformIconMap` keyed by icon string from the API response.

```tsx
"use client";

export interface PlatformRow {
  question: string;
  icon: string;         // "facebook", "instagram", etc. from API
  seva_count: number;
}

interface AllPlatformsListProps {
  rows: PlatformRow[];
  totalSevadar: number;
  totalSubmissions: number;
}

const ICON_EMOJI: Record<string, string> = {
  facebook: "📘",
  instagram: "📸",
  twitter: "🐦",
  x: "✖️",
  youtube: "▶️",
  linkedin: "💼",
  reddit: "🟠",
  pinterest: "📌",
  sharechat: "💬",
  dailyhunt: "📰",
  tumblr: "📓",
  thread: "🧵",
  threads: "🧵",
};

export function AllPlatformsList({ rows, totalSevadar, totalSubmissions }: AllPlatformsListProps) {
  const pending = totalSevadar - totalSubmissions;
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      {rows.map((row, i) => (
        <div
          key={row.question}
          className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 last:border-0"
        >
          <span className="text-lg">{ICON_EMOJI[row.icon?.toLowerCase()] ?? "📱"}</span>
          <span className="flex-1 text-sm text-gray-700">{row.question}</span>
          <span className="text-sm font-semibold text-gray-800 tabular-nums">
            {String(row.seva_count).padStart(2, "0")}
          </span>
        </div>
      ))}
      {/* Summary */}
      <div className="bg-indigo-50/60 px-4 py-3 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Sevadar</span>
          <span className="font-semibold text-gray-900">{totalSevadar}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Updates Given</span>
          <span className="font-semibold text-green-600">{totalSubmissions}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Updates Pending</span>
          <span className="font-semibold text-rose-500">{pending}</span>
        </div>
      </div>
    </div>
  );
}
```

---

### Task 10: Create book-order-list component

**Files:**
- Create: `src/app/v2/(seva)/(social-media)/social-media/(index)/report/_components/book-order-list.tsx`

Design spec: 2-column table (national | international). Header summary row (Total National Orders / Total International Orders). Rows grouped by tehsil.

```tsx
"use client";

import { cn } from "@/utils/cn";

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
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      {/* Summary header */}
      <div className="flex gap-3 px-4 py-3 bg-indigo-50/60 border-b border-indigo-100">
        <div className="flex-1 text-center">
          <p className="text-xs text-gray-500">Total National</p>
          <p className="text-lg font-bold text-green-600">{totalNational}</p>
        </div>
        <div className="flex-1 text-center">
          <p className="text-xs text-gray-500">Total International</p>
          <p className="text-lg font-bold text-blue-600">{totalInternational}</p>
        </div>
      </div>
      {/* Column headers */}
      <div className="flex items-center px-3 py-1.5 border-b border-gray-100 bg-gray-50/50">
        <span className="flex-1 text-xs text-gray-400 font-medium">Name</span>
        <span className="text-xs text-gray-400 font-medium w-10 text-center">🇮🇳</span>
        <span className="text-xs text-gray-400 font-medium w-10 text-center">🌐</span>
        <span className="w-5" />
      </div>
      {Object.entries(groups).map(([region, items]) => (
        <div key={region}>
          <div className="text-center text-xs text-gray-400 font-medium py-1.5 bg-gray-50/60">
            {region}
          </div>
          {items.map((row, i) => (
            <div
              key={`${row.name}-${i}`}
              className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <span className="text-sm text-gray-700">{row.name}</span>
                {row.guardian_name && (
                  <span className="text-xs text-gray-400 ml-1">s/o {row.guardian_name}</span>
                )}
              </div>
              <span className="w-10 text-center text-sm font-semibold text-green-600 tabular-nums">
                {row.national}
              </span>
              <span className="w-10 text-center text-sm font-semibold text-blue-600 tabular-nums">
                {row.international}
              </span>
              <span className="w-5" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

---

### Task 11: Create WhatsApp message templates utility for v2

**Files:**
- Create: `src/app/v2/(seva)/(social-media)/social-media/(index)/report/_utils/message-templates.ts`

Port relevant templates from `src/utils/social_whatsapp_msg.utils.ts`. Adapt to the v2 data shapes from `social_media_seva_wise_report_all_regions` and `social_media_all_seva_report`.

Read v1 templates first, then create v2 versions:

```typescript
// Template 1: Sevadar pending list (SM Sevadar scope)
export function buildSevadarPendingMsg(params: {
  location: string;
  date: string;
  rows: Array<{ name: string; tehsil_name: string }>;
}): string {
  const header = `🙏 *${params.location} - SM Seva Pending*\n📅 ${params.date}\n\n`;
  const body = params.rows
    .map((r, i) => `${i + 1}. ${r.name} (${r.tehsil_name})`)
    .join("\n");
  return header + body;
}

// Template 2: All platforms summary
export function buildAllPlatformsMsg(params: {
  location: string;
  date: string;
  reports: Array<{ question: string; seva_count: number }>;
  totalSevadar: number;
  totalSubmissions: number;
}): string {
  const header = `🙏 *${params.location} - All SM Platform Report*\n📅 ${params.date}\n\n`;
  const body = params.reports
    .map((r) => `• ${r.question}: ${r.seva_count}`)
    .join("\n");
  const footer = `\n\nTotal: ${params.totalSubmissions}/${params.totalSevadar}`;
  return header + body + footer;
}

// Template 3: Platform-wise sevadar list
export function buildPlatformWiseMsg(params: {
  location: string;
  date: string;
  platform: string;
  rows: Array<{ name: string; submitted: number; total: number }>;
}): string {
  const header = `🙏 *${params.location} - ${params.platform} Report*\n📅 ${params.date}\n\n`;
  const body = params.rows
    .map((r, i) => `${i + 1}. ${r.name}: ${r.submitted}/${r.total}`)
    .join("\n");
  return header + body;
}

export function splitLongMessage(msg: string, maxLen = 4500): string[] {
  if (msg.length <= maxLen) return [msg];
  const chunks: string[] = [];
  let current = "";
  for (const line of msg.split("\n")) {
    if ((current + "\n" + line).length > maxLen) {
      chunks.push(current);
      current = line;
    } else {
      current += (current ? "\n" : "") + line;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}
```

---

### Task 12: Create the main ReportResults component with all sub-components wired

**Files:**
- Modify: `src/app/v2/(seva)/(social-media)/social-media/(index)/report/_components/report-results.tsx`

This is the main orchestrator. It:
1. Reads `filters`, `searchTrigger`, `selectedPlatformId` from store
2. Reads auth from Redux store for region params
3. When `searchTrigger > 0`, fetches data based on `top_tab + sub_tab`
4. Renders: `ResultHeader` + `CopyBar` + appropriate list component
5. Shows the filter panel as an overlay when Edit is clicked

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useFilters, useSearchTrigger, useSelectedPlatformId } from "@/store/useFilterStore";
import { useAppSelector } from "@/redux/store";
import { getRegionValue } from "@/shared/functions/location";
import { getDateFilters } from "@/shared/functions/filter";
import apiClient from "@/http/index";
import { ResultHeader } from "./result-header";
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

// --- Data transform helpers ---

function transformSevadarWiseResult(apiData: any): SevadarRow[] {
  // social_media_seva_wise_report_all_regions response:
  // { questions, regions: [{sevadar_id, sevadar_name, relation, guardian_name}], seva_count: [{question_id, sevadar_id, seva_count}] }
  const regions: any[] = apiData?.report?.regions ?? [];
  const sevaCounts: any[] = apiData?.report?.seva_count ?? [];
  const questions: any[] = apiData?.report?.questions ?? [];
  const totalQuestions = questions.length || 1;

  return regions.map((r, idx) => {
    const sevadarCounts = sevaCounts.filter(
      (sc) => sc.sevadar_id === r.sevadar_id || sc.tehsil_id === r.tehsil_id || sc.district_id === r.district_id
    );
    const submitted = sevadarCounts.filter((sc) => sc.seva_count > 0).length;
    return {
      id: r.sevadar_id ?? r.tehsil_id ?? idx,
      name: r.sevadar_name ?? r.tehsil_name ?? r.district_name ?? "Unknown",
      guardian_name: r.guardian_name,
      relation: r.relation,
      badge: `S${idx + 1}`,
      badgeType: "S" as const,
      submitted,
      total: totalQuestions,
      region: apiData?.headers?.district || apiData?.headers?.tehsil || "Report",
    };
  });
}

function transformAllPlatformsResult(apiData: any): { rows: PlatformRow[]; total_sevadar: number; total_submissions: number } {
  return {
    rows: (apiData?.reports ?? []).map((r: any) => ({
      question: r.question,
      icon: r.icon ?? "facebook",
      seva_count: r.seva_count ?? 0,
    })),
    total_sevadar: apiData?.total_sevadar ?? 0,
    total_submissions: apiData?.total_submissions ?? 0,
  };
}

// --- Main Component ---

export function ReportResults() {
  const filters = useFilters();
  const searchTrigger = useSearchTrigger();
  const selectedPlatformId = useSelectedPlatformId();
  const { active_permission, active_region_index } = useAppSelector((s) => s.auth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sevadarRows, setSevadarRows] = useState<SevadarRow[]>([]);
  const [platformRows, setPlatformRows] = useState<PlatformRow[]>([]);
  const [platformTotals, setPlatformTotals] = useState({ total_sevadar: 0, total_submissions: 0 });
  const [bookOrderRows, setBookOrderRows] = useState<BookOrderRow[]>([]);
  const [bookOrderTotals, setBookOrderTotals] = useState({ national: 0, international: 0 });
  const [messages, setMessages] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const topTab = filters.top_tab as string;
  const subTab = filters.sub_tab as string;
  const scope = filters.scope as string;
  const timePeriod = filters.time_period as string;

  const regionParams = getRegionValue(active_permission, active_region_index);
  const locationName = active_permission?.region?.[active_region_index]?.[
    `${active_permission?.role_region}_name`
  ] ?? "Report";
  const tehsilParam = filters.tehsil_id ? { tehsil: filters.tehsil_id } : {};

  const fetchData = useCallback(async () => {
    if (!searchTrigger) return;
    setLoading(true);
    setError(null);
    try {
      const dateParams = getDateFilters(timePeriod);

      if (topTab === "sm-seva" || topTab === "trend-seva") {
        if (subTab === "all-platforms") {
          const { data } = await apiClient.post("social_media_all_seva_report", {
            ...dateParams,
            ...regionParams,
            ...tehsilParam,
          });
          const result = transformAllPlatformsResult(data?.data);
          setPlatformRows(result.rows);
          setPlatformTotals({ total_sevadar: result.total_sevadar, total_submissions: result.total_submissions });
          // Build messages
          const msg = buildAllPlatformsMsg({
            location: locationName,
            date: dateParams.start?.split("T")[0] ?? "",
            reports: result.rows,
            totalSevadar: result.total_sevadar,
            totalSubmissions: result.total_submissions,
          });
          setMessages(splitLongMessage(msg));

        } else if (subTab === "platform-wise" && selectedPlatformId) {
          const { data } = await apiClient.post("social_media_report_seva_wise", {
            ...dateParams,
            ...regionParams,
            ...tehsilParam,
            question_id: selectedPlatformId,
          });
          const rows = transformSevadarWiseResult({ report: data?.data?.[0], headers: {} });
          setSevadarRows(rows);
          const msg = buildPlatformWiseMsg({
            location: locationName,
            date: dateParams.start?.split("T")[0] ?? "",
            platform: String(filters.platform_name ?? "Platform"),
            rows,
          });
          setMessages(splitLongMessage(msg));

        } else {
          // sm-sevadar / sevadar default
          const sevadarLevel = scope === "tehsil" ? "regions" : "sevadar";
          const { data } = await apiClient.post("social_media_seva_wise_report_all_regions", {
            ...dateParams,
            ...regionParams,
            ...tehsilParam,
            sevadar_level: sevadarLevel,
          });
          const rows = transformSevadarWiseResult(data?.data);
          setSevadarRows(rows);
          const msg = buildSevadarPendingMsg({
            location: locationName,
            date: dateParams.start?.split("T")[0] ?? "",
            rows: rows.map((r) => ({ name: r.name, tehsil_name: r.region ?? "" })),
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
        // book_seva_reports proxies to external API — adapt transform based on actual response shape
        const rows: BookOrderRow[] = (data?.data ?? []).map((r: any) => ({
          name: r.sevadar_name ?? r.name ?? "Unknown",
          guardian_name: r.guardian_name,
          region: r.tehsil_name ?? r.district_name,
          national: r.national_orders ?? r.national ?? 0,
          international: r.international_orders ?? r.international ?? 0,
        }));
        const totalNational = rows.reduce((sum, r) => sum + r.national, 0);
        const totalInternational = rows.reduce((sum, r) => sum + r.international, 0);
        setBookOrderRows(rows);
        setBookOrderTotals({ national: totalNational, international: totalInternational });
        setMessages([]);
      }
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [searchTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!searchTrigger) return null;

  // Build header path string
  const tabLabels: Record<string, string> = {
    "sm-seva": "SM Seva",
    "trend-seva": "Trend Seva",
    "book-order": "Book Order",
    "sm-sevadar": "SM Sevadar",
    "all-platforms": "All SM Platforms",
    "platform-wise": "Platform wise",
    sevadar: "Sevadar",
  };
  const pathParts = [tabLabels[topTab]];
  if (subTab) pathParts.push(tabLabels[subTab] ?? subTab);
  if (scope && scope !== "sevadar") pathParts.push(scope === "tehsil" ? "Tehsil" : "Team Leader");
  const headerPath = pathParts.join(" > ");
  const subtitle = `${timePeriod ?? "Today"} | ${scope === "tehsil" && !filters.tehsil_id ? "All Tehsil" : locationName}`;

  return (
    <div className="space-y-3">
      <ResultHeader
        path={headerPath}
        
        onEdit={() => setShowFilters(true)}
      />
      {messages.length > 0 && <CopyBar messages={messages} />}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="size-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-rose-50 text-rose-600 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {(topTab === "sm-seva" || topTab === "trend-seva") && subTab === "all-platforms" && (
            <AllPlatformsList
              rows={platformRows}
              totalSevadar={platformTotals.total_sevadar}
              totalSubmissions={platformTotals.total_submissions}
            />
          )}
          {(topTab === "sm-seva" || topTab === "trend-seva") && subTab !== "all-platforms" && (
            <SevadarList rows={sevadarRows} />
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
```

**Note on Edit overlay:** The `showFilters` state is defined but the overlay UI isn't rendered yet — add it as a sheet/drawer in the next task if needed, or accept that Edit just re-scrolls to filters for now.

---

### Task 13: Verify compilation and fix TypeScript errors

**Steps:**
1. Run `npm run build` or `npx tsc --noEmit` from `seva-app/`
2. Fix any type errors found (likely around `any` casts or missing imports)
3. Check `react-hooks/exhaustive-deps` lint warnings and address if blocking

---

### Task 14: Commit

```bash
cd /Users/sagardas/Developer/seva-app
git add src/store/useFilterStore.ts \
  src/app/v2/(seva)/(social-media)/social-media/(index)/report/ \
  docs/plans/
git commit -m "feat: implement SM report module v2 — wire filters to API, add results view"
git push origin feat/upgrade
```

---

## Known Gaps / TODOs

1. **Team Leader dropdown** — No list endpoint identified in backend. Stub `ReactSelect options={[]}` with TODO comment in `report-filters.tsx`.
2. **Book Order response shape** — `book_seva_reports` proxies to external API (`nb.jagatgururampalji.org`). The actual response shape is unknown. The transform in `report-results.tsx` uses guesses (`national_orders`, `international_orders`). Adjust field names once you test against real data.
3. **Trend Seva filtering** — The same endpoints return all questions regardless of `seva_type`. If the backend starts filtering by `seva_type`, pass it as a param. For now, Trend Seva uses the same calls as SM Seva.
4. **Edit overlay** — Clicking Edit scrolls to filters. A proper bottom-sheet overlay can be added in a follow-up PR.
5. **Date range (from-date / to-date)** — Date picker inputs aren't implemented in the filter UI. These states exist in the store but no date picker component is wired up.
