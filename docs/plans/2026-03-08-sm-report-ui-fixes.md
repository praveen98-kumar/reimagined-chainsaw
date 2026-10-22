# SM Report Module — UI/UX Fix Plan

> **For Claude:** Read this file fully before touching any code.
> Work on branch `feat/upgrade` in `/Users/sagardas/Developer/seva-app`.
> Commit after each numbered task. No co-author lines in commits.

---

## Context

This is a Next.js 14 App Router app (v2). The SM Report module lives at:

```
src/app/v2/(seva)/(social-media)/social-media/(index)/report/
├── page.tsx
└── _components/
    ├── report-filters.tsx     ← filter UI
    ├── report-results.tsx     ← data fetching + orchestration
    ├── result-header.tsx      ← result path + edit button
    ├── copy-bar.tsx           ← whatsapp share/copy
    ├── sevadar-list.tsx       ← sevadar rows with badges
    ├── all-platforms-list.tsx ← platform breakdown list
    ├── book-order-list.tsx    ← book order national/intl table
    └── tab-shape-bg.tsx       ← animated SVG background (do not touch)
```

**Stack:** Next.js 14, Tailwind CSS, shadcn/ui (`@/components/v2/ui/`), Lucide icons, Zustand store.

**Icon library:** Lucide React — already imported in project. For brand icons (Facebook, Instagram, etc.) use `lucide-react` where possible or inline SVG. Do NOT use emojis as icons under any circumstances.

**shadcn components available** (in `@/components/v2/ui/`): `card`, `button`, `separator`, `badge`, `radio-group`, `checkbox`, `label`. Check what exists before importing new ones.

---

## Issues to Fix (in priority order)

### Task 1 — Remove dead ⋮ menu icon from SevadarList

**File:** `sevadar-list.tsx`

The `MoreVertical` icon from lucide-react is rendered on every sevadar row but has no click handler and no menu. It implies an action that doesn't exist. Remove it completely.

Also remove the unused `w-4` spacer span in `book-order-list.tsx` that was compensating for the same icon.

---

### Task 2 — Replace emoji platform icons with SVG in AllPlatformsList

**File:** `all-platforms-list.tsx`

The `ICON_EMOJI` map uses emojis (📘 for Facebook, 🐦 for Twitter etc.). Replace with proper SVG brand icons.

Use Simple Icons SVG paths. Here are the key ones needed:

```tsx
// Replace the ICON_EMOJI map with this SVG icon component approach:

const PLATFORM_ICONS: Record<string, { path: string; color: string }> = {
  facebook:   { color: "#1877F2", path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
  instagram:  { color: "#E4405F", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
  youtube:    { color: "#FF0000", path: "M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" },
  twitter:    { color: "#000000", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  x:          { color: "#000000", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  linkedin:   { color: "#0A66C2", path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
  sharechat:  { color: "#00BCD4", path: "M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3zm0 14.5c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" },
};

function PlatformIcon({ icon, size = 18 }: { icon: string; size?: number }) {
  const platform = PLATFORM_ICONS[icon?.toLowerCase()];
  if (!platform) {
    // generic mobile icon fallback using lucide
    return <SmartphoneIcon size={size} className="text-muted-foreground" />;
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={platform.color}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="flex-shrink-0"
    >
      <path d={platform.path} />
    </svg>
  );
}
```

Import `Smartphone as SmartphoneIcon` from `lucide-react` for the fallback.

Replace the emoji `<span>` in the row with `<PlatformIcon icon={row.icon} />`.

---

### Task 3 — Replace emoji flags in BookOrderList column headers

**File:** `book-order-list.tsx`

The column headers use `🇮🇳` and `🌐`. Replace with text labels:
- `🇮🇳` → `"Natl"` (text-xs text-muted-foreground)
- `🌐` → `"Intl"` (text-xs text-muted-foreground)

---

### Task 4 — Fix CopyBar label (Share vs Copy based on capability)

**File:** `copy-bar.tsx`

The button always says "Copy N" but on mobile `navigator.share` is called instead. Fix:

```tsx
// Detect share capability once at component level
const canShare = typeof navigator !== "undefined" && !!navigator.share;

// Button label:
{canShare ? "Share" : "Copy"} {messages.length > 1 ? i + 1 : ""}
```

Also: when there's only 1 message, drop the number suffix entirely ("Share" not "Share 1").

---

### Task 5 — Fix selected state on time period pills

**File:** `report-filters.tsx`

The time period radio pills currently only show the radio dot changing. The entire pill should visually indicate selection. Change the pill container `div` to reflect the selected state:

```tsx
// current (no change on selection):
className="flex items-center gap-2 bg-white shadow-sm border border-indigo-50 rounded-full px-4 py-2.5 ..."

// fix — add conditional classes based on whether this val === timePeriod:
className={cn(
  "flex items-center gap-2 rounded-full px-4 py-2.5 cursor-pointer transition-all",
  timePeriod === val
    ? "bg-indigo-600 shadow-md border border-indigo-600"
    : "bg-white shadow-sm border border-indigo-50 hover:bg-indigo-50/30"
)}
// And the label text:
className={cn(
  "text-[13px] font-medium cursor-pointer capitalize",
  timePeriod === val ? "text-white" : "text-indigo-900"
)}
// Hide the RadioGroupItem visually when selected (it's redundant with the filled pill):
className={cn(
  "border-indigo-500 flex-shrink-0",
  timePeriod === val ? "border-white" : ""
)}
```

Apply the same treatment to the sub-tabs (sm-sevadar, all-platforms, platform-wise) — they already do this with explicit active/inactive className on the `button`. Just verify it's working correctly.

---

### Task 6 — Add result summary line to SevadarList

**File:** `sevadar-list.tsx`

Add a summary bar at the TOP of the list (before the first group), showing total count, submitted, and pending.

```tsx
// Add props to the component:
// No new props needed — compute from rows

const total = rows.length;
const submitted = rows.filter(r => r.submitted > 0).length;
const pending = total - submitted;

// Render above the Card (or as a CardHeader):
<div className="flex items-center justify-between px-4 py-2.5 bg-indigo-50/60 border-b border-indigo-100 rounded-t-2xl">
  <span className="text-xs font-medium text-indigo-700">{total} Sevadars</span>
  <div className="flex items-center gap-3">
    <span className="text-xs font-semibold text-green-600">{submitted} submitted</span>
    <span className="text-xs font-semibold text-rose-500">{pending} pending</span>
  </div>
</div>
```

Place this as the first item inside the Card, before the region groups.

---

### Task 7 — Add "Loading report…" text to spinner

**File:** `report-results.tsx`

Find the loading spinner div and add a text label below it:

```tsx
// current:
<div className="flex items-center justify-center py-12">
  <div className="size-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
</div>

// fix:
<div className="flex flex-col items-center justify-center py-12 gap-2">
  <div className="size-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
  <span className="text-xs text-indigo-400">Loading report…</span>
</div>
```

---

### Task 8 — Add S/T badge legend to SevadarList

**File:** `sevadar-list.tsx`

Add a small legend line at the bottom of the Card (after all rows), only when there are both S and T badges present:

```tsx
// After the groups map, before closing </Card>:
{rows.some(r => r.badgeType === "T") && (
  <div className="flex gap-4 px-4 py-2 border-t border-indigo-50">
    <span className="text-[10px] text-muted-foreground">
      <span className="inline-block bg-rose-100 text-rose-700 font-bold px-1 rounded mr-1">S</span>
      Sevadar
    </span>
    <span className="text-[10px] text-muted-foreground">
      <span className="inline-block bg-amber-100 text-amber-700 font-bold px-1 rounded mr-1">T</span>
      Team Leader
    </span>
  </div>
)}
```

---

### Task 9 — Wire From/To Date or remove the radio options

**File:** `report-filters.tsx`

The "From Date" and "To Date" radio options do nothing when selected — no date input appears. This is broken UX. Fix:

When `timePeriod === "from-date"` or `timePeriod === "to-date"`, show a date input below the radio grid:

```tsx
// After the radio group closing tag, add:
{(timePeriod === "from-date" || timePeriod === "to-date") && (
  <div className="grid grid-cols-2 gap-2 relative z-10 pt-1">
    <input
      type="date"
      className="col-span-1 text-xs rounded-full border border-indigo-200 px-3 py-2 text-indigo-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
      placeholder="From"
      onChange={(e) => setFilters({ start: e.target.value })}
    />
    <input
      type="date"
      className="col-span-1 text-xs rounded-full border border-indigo-200 px-3 py-2 text-indigo-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
      placeholder="To"
      onChange={(e) => setFilters({ end: e.target.value })}
    />
  </div>
)}
```

Check how `getDateFilters` works in `src/shared/functions/filter.ts` — it likely reads `start`/`end` from the filter params. Verify the field names match what the API expects (`start` and `end`).

---

## Commit Strategy

One commit per task:
```
fix(report): remove dead MoreVertical icon from sevadar rows
fix(report): replace emoji platform icons with SVG in AllPlatformsList
fix(report): replace emoji flag column headers in BookOrderList
fix(report): fix CopyBar label (Share vs Copy, drop number when single)
fix(report): fill time period pill on selection
fix(report): add result summary bar to SevadarList
fix(report): add loading text to spinner
fix(report): add S/T badge legend to SevadarList
fix(report): wire date inputs for from-date/to-date time period
```

No `--no-verify` unless pre-commit fails on pre-existing TS errors in unrelated files (item.tsx, chart.tsx, _app.tsx) — those are known and pre-existing, not our bugs.

---

## How to Verify

After each task, check:
- No TypeScript errors in the modified file (`npx tsc --noEmit 2>&1 | grep <filename>`)
- The fix matches the intent described above
- No regressions in surrounding components
