"use client";

import { SearchButton } from "@/components/v2/SearchButton";
import { DatePickerWithRange } from "@/components/v2/DatePickerWithRange";
import { RadioGroup, RadioGroupItem } from "@/components/v2/ui/radio-group";
import { Checkbox } from "@/components/v2/ui/checkbox";
import ReactSelect from "react-select";
import {
  useFilters,
  useFilterActions,
  useFilterCollapsed,
} from "@/store/useFilterStore";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import apiClient from "@/http/index";
import { useAppSelector } from "@/redux/store";
import { cn } from "@/utils/cn";
import {
  useCountries,
  useDistricts,
  useDivisions,
  useStates,
  useTehsils,
} from "@/hooks/useLocationAPI";
import { useUsersWithRole } from "@/hooks/useUsersWithRole";
import { TabShapeBg } from "./tab-shape-bg";
import { ResultHeader } from "./result-header";
import type { TabState } from "./tab-shape-bg";
import { regionHirarchyMap } from "@/constants/app";
import type { DateRange } from "react-day-picker";

const TEAM_LEADER_ROLE_ID = 60;

type LocationField =
  | "country"
  | "state"
  | "division"
  | "district"
  | "tehsil"
  | "team-leader";

const LOCATION_FIELD_LEVEL: Record<LocationField, number> = {
  country: 1,
  state: 2,
  division: 3,
  district: 4,
  tehsil: 5,
  "team-leader": 6,
};

const TOP_TABS: { label: string; value: TabState; className?: string }[] = [
  {
    label: "SM Seva",
    value: "sm-seva",
    className: "from-[#000C45] to-[#0C3BE3]",
  },
  {
    label: "Trend Seva",
    value: "trend-seva",
    className: "from-[#1B0052] to-[#581FC8]",
  },
  {
    label: "Book Order",
    value: "book-order",
    className: "from-[#2C0033] to-[#5B036C]",
  },
];

const SUB_TAB_COLORS: Record<TabState, string> = {
  "sm-seva": "bg-[#0C3BE3]",
  "trend-seva": "bg-[#581FC8]",
  "book-order": "bg-[#5B036C]",
};

const SUB_TABS = [
  { label: "Sevadar", value: "sm-sevadar" },
  { label: "SM Platforms", value: "all-platforms" },
  { label: "Platform wise", value: "platform-wise" },
  { label: "PDF Report", value: "pdf-report" },
];

const PLATFORM_SUB_TABS = ["all-platforms", "platform-wise"];

const SCOPE_OPTIONS = [
  { value: "sevadar", label: "Sevadar", index: 5 },
  { value: "team-leader", label: "Team Leader", index: 5 },
  { value: "tehsil", label: "Tehsil", index: 5 },
  { value: "district", label: "District", index: 4 },
  { value: "division", label: "Division", index: 3 },
  { value: "state", label: "State", index: 2 },
];

const SCOPE_LOCATION_FIELDS: Record<string, LocationField[]> = {
  state: ["state"],
  division: ["state", "division"],
  district: ["state", "division", "district"],
  tehsil: ["state", "division", "district", "tehsil"],
  "team-leader": ["state", "division", "district", "tehsil"],
  sevadar: ["state", "division", "district", "tehsil", "team-leader"],
};

const TIME_PERIODS: { value: string; label: string; className?: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this_week", label: "This week" },
  { value: "this_month", label: "This month" },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "submitted", label: "Submitted" },
];

const BOOK_ORDER_SCOPES = ["national", "international"];

const RADIO_CLASS =
  "size-4 border-[#A9B1C2] bg-white data-[checked]:border-[#0B37D6] [&_span]:bg-[#0B37D6]";

const CHECKBOX_CLASS =
  "size-4 rounded-[4px] data-[checked]:border-[#0B37D6] data-[checked]:bg-[#0B37D6] [&_svg]:text-white";

const PILL_CLASS =
  "flex items-center gap-2 rounded-full bg-white px-4 py-1 shadow-[0_2px_8px_rgba(24,35,90,0.08)] cursor-pointer";

const PILL_RADIO_CLASS =
  "flex items-center justify-center gap-1.5 rounded-full bg-white px-3 py-1 shadow-[0_2px_8px_rgba(24,35,90,0.08)] cursor-pointer";

const SELECT_TRIGGER_CLASS = "w-full";

const LOCATION_SELECT_STYLES = {
  control: (base: any) => ({
    ...base,
    height: "28px",
    minHeight: "28px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#FFFFFF",
    boxShadow: "0 2px 8px rgba(24,35,90,0.08)",
    fontSize: "13px",
    "&:hover, &:focus, &:focus-within": {
      border: "none",
      boxShadow: "0 2px 8px rgba(24,35,90,0.08)",
    },
  }),
  valueContainer: (base: any) => ({
    ...base,
    padding: "0 8px",
    gap: "4px",
  }),
  input: (base: any) => ({ ...base, fontSize: "13px", color: "#2A2F45" }),
  placeholder: (base: any) => ({ ...base, color: "#8A93A8", fontSize: "13px" }),
  singleValue: (base: any) => ({
    ...base,
    color: "#2A2F45",
    fontSize: "13px",
  }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base: any) => ({
    ...base,
    color: "#8A93A8",
    padding: "0 6px",
    ":hover": { color: "#8A93A8" },
  }),
  menu: (base: any) => ({
    ...base,
    zIndex: 50,
    marginTop: "4px",
    borderRadius: "8px",
    boxShadow: "0 4px 16px rgba(24,35,90,0.16)",
    overflow: "hidden",
  }),
  menuList: (base: any) => ({
    ...base,
    padding: "4px",
    maxHeight: "240px",
  }),
  option: (base: any, state: any) => ({
    ...base,
    borderRadius: "6px",
    fontSize: "13px",
    cursor: "pointer",
    padding: "6px 8px",
    backgroundColor: state.isSelected
      ? "#0B37D6"
      : state.isFocused
        ? "#F1F4FB"
        : "#FFFFFF",
    color: state.isSelected ? "#FFFFFF" : "#2A2F45",
  }),
  menuPortal: (base: any) => ({ ...base, zIndex: 60 }),
};

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-px flex-1 bg-[#C3C9D8]" />
      <span className="text-[11px] font-medium whitespace-nowrap text-[#8A93A8]">
        {label}
      </span>
      <span className="h-px flex-1 bg-[#C3C9D8]" />
    </div>
  );
}

function LocationSelect({
  placeholder,
  value,
  options,
  onChange,
}: {
  placeholder: string;
  value?: number;
  options: { label: string; value: string | number }[];
  onChange: (value: string | null) => void;
}) {
  const selectedOption =
    value === undefined || value === null
      ? null
      : (options.find((option) => String(option.value) === String(value)) ??
        null);

  return (
    <ReactSelect
      className={SELECT_TRIGGER_CLASS}
      options={options}
      value={selectedOption}
      placeholder={placeholder}
      isSearchable
      menuPortalTarget={
        typeof document !== "undefined" ? document.body : undefined
      }
      styles={LOCATION_SELECT_STYLES}
      onChange={(option) => onChange(option ? String(option.value) : null)}
    />
  );
}
type RoleRegion = keyof typeof regionHirarchyMap;

export function ReportFilters() {
  const filters = useFilters();
  const filterCollapsed = useFilterCollapsed();
  const {
    setFilters,
    resetFilters,
    triggerSearch,
    setSelectedPlatformId,
    setFilterCollapsed,
  } = useFilterActions();
  const { active_permission, active_region_index } = useAppSelector(
    (s) => s.auth,
  );
  const activeRegion = (active_permission?.region as any)?.[
    active_region_index
  ];
  const stateId = activeRegion?.state_id;

  const activeRoleRegion = active_permission?.role_region as RoleRegion;
  const currentUserHierarchy = regionHirarchyMap[activeRoleRegion];

  const [topTab, setTopTab] = useState<TabState>("sm-seva");
  const [subTab, setSubTab] = useState("sm-sevadar");
  const [scope, setScope] = useState("sevadar");
  const [timePeriod, setTimePeriod] = useState("today");
  const [dateRange, setDateRange] = useState<DateRange>();
  const [status, setStatus] = useState<string[]>(["pending", "submitted"]);
  const [bookOrderScope, setBookOrderScope] = useState<string[]>([]);

  const [countryId, setCountryId] = useState<number>();
  const [stateFilterId, setStateFilterId] = useState<number>();
  const [divisionId, setDivisionId] = useState<number>();
  const [districtId, setDistrictId] = useState<number>();
  const [tehsilId, setTehsilId] = useState<number>();
  const [teamLeaderId, setTeamLeaderId] = useState<number>();
  const [sevadarId, setSevadarId] = useState<number>();

  const [platformOptions, setPlatformOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [selectedPlatformId, setLocalPlatformId] = useState<string>("");

  const isPlatformTab = PLATFORM_SUB_TABS.includes(subTab);
  const isSevadarTab = subTab === "sm-sevadar";
  const showPlatformField = subTab === "platform-wise";
  const showSevadarField = isPlatformTab && scope === "sevadar";

  const userLevel = currentUserHierarchy ?? 0;
  const locationFields = (SCOPE_LOCATION_FIELDS[scope] ?? []).filter(
    (field) => LOCATION_FIELD_LEVEL[field] > userLevel,
  );
  const showCountry = locationFields.includes("country");
  const showState = locationFields.includes("state");
  const showDivision = locationFields.includes("division");
  const showDistrict = locationFields.includes("district");
  const showTehsil = locationFields.includes("tehsil");
  const showTeamLeader = locationFields.includes("team-leader");

  const regionCountryId = activeRegion?.country_id;
  const baseCountryId = countryId ?? regionCountryId;
  const effectiveStateId = stateFilterId ?? stateId;

  const { data: countryOptions = [] } = useCountries({
    enabled: showCountry,
  });
  const { data: stateOptions = [] } = useStates(baseCountryId ?? "", {
    enabled: showState && !!baseCountryId,
  });
  const { data: divisionOptions = [] } = useDivisions(effectiveStateId ?? "", {
    enabled: showDivision && !!effectiveStateId,
  });
  const { data: districtOptions = [] } = useDistricts(effectiveStateId ?? "", {
    enabled: showDistrict && !!effectiveStateId,
  });
  const { data: tehsilOptions = [] } = useTehsils(districtId ?? "", {
    enabled: showTehsil && !!districtId,
  });
  const { data: teamLeaders = [] } = useUsersWithRole(
    TEAM_LEADER_ROLE_ID,
    { districtId, tehsilId },
    { enabled: showTeamLeader && (!!districtId || !!tehsilId) },
  );
  const teamLeaderOptions = teamLeaders.map((u) => ({
    label: u.name,
    value: u.id,
  }));

  useEffect(() => {
    return () => resetFilters();
  }, [resetFilters]);

  useEffect(() => {
    setFilters({
      top_tab: topTab,
      sub_tab: subTab,
      scope,
      time_period: timePeriod,
      status: status.join(","),
      book_order_scope: bookOrderScope.join(","),
      start:
        timePeriod === "custom"
          ? (dateRange?.from?.toISOString() ?? null)
          : null,
      end:
        timePeriod === "custom" ? (dateRange?.to?.toISOString() ?? null) : null,
    });
  }, [
    topTab,
    subTab,
    scope,
    timePeriod,
    dateRange,
    status,
    bookOrderScope,
    setFilters,
  ]);

  useEffect(() => {
    apiClient
      .get("social_media_question")
      .then(({ data }) => {
        const opts = (data?.data ?? []).map((q: any) => ({
          label: q.question,
          value: q.id,
        }));
        setPlatformOptions(opts);
      })
      .catch(console.error);
  }, []);

  const handleTimePeriodChange = (val: string) => {
    setTimePeriod(val);
    if (val !== "custom") setDateRange(undefined);
  };

  const handleTopTabChange = (val: TabState) => {
    setTopTab(val);
    setSubTab(val === "book-order" ? "" : "sm-sevadar");
  };

  const handleCountryChange = (val: string | null) => {
    const id = val ? Number(val) : undefined;
    setCountryId(id);
    setStateFilterId(undefined);
    setDivisionId(undefined);
    setDistrictId(undefined);
    setTehsilId(undefined);
    setTeamLeaderId(undefined);
    setFilters({
      country_id: id ?? null,
      state_id: null,
      division_id: null,
      district_id: null,
      tehsil_id: null,
      team_leader_id: null,
    });
  };

  const handleStateFilterChange = (val: string | null) => {
    const id = val ? Number(val) : undefined;
    setStateFilterId(id);
    setDivisionId(undefined);
    setDistrictId(undefined);
    setTehsilId(undefined);
    setTeamLeaderId(undefined);
    setFilters({
      state_id: id ?? null,
      division_id: null,
      district_id: null,
      tehsil_id: null,
      team_leader_id: null,
    });
  };

  const handleDivisionChange = (val: string | null) => {
    const id = val ? Number(val) : undefined;
    setDivisionId(id);
    setFilters({ division_id: id ?? null });
  };

  const handleDistrictChange = (val: string | null) => {
    const id = val ? Number(val) : undefined;
    setDistrictId(id);
    setTehsilId(undefined);
    setTeamLeaderId(undefined);
    setFilters({
      district_id: id ?? null,
      tehsil_id: null,
      team_leader_id: null,
    });
  };

  const handleTehsilChange = (val: string | null) => {
    const id = val ? Number(val) : undefined;
    setTehsilId(id);
    setTeamLeaderId(undefined);
    setFilters({ tehsil_id: id ?? null, team_leader_id: null });
  };

  const handleTeamLeaderChange = (val: string | null) => {
    const id = val ? Number(val) : undefined;
    setTeamLeaderId(id);
    setFilters({ team_leader_id: id ?? null });
  };

  const handleSevadarChange = (val: string | null) => {
    const id = val ? Number(val) : undefined;
    setSevadarId(id);
    setFilters({ sevadar_id: id ?? null });
  };

  const handleStatusChange = (val: string, checked: boolean) => {
    setStatus((prev) =>
      checked ? [...prev, val] : prev.filter((item) => item !== val),
    );
  };

  const handleBookOrderScopeChange = (val: string, checked: boolean) => {
    setBookOrderScope((prev) =>
      checked ? [...prev, val] : prev.filter((item) => item !== val),
    );
  };

  const handlePlatformChange = (val: string | null) => {
    setLocalPlatformId(val ?? "");
    const opt = platformOptions.find((o) => o.value.toString() === val) ?? null;
    setSelectedPlatformId(opt?.value ?? null);
  };

  const filteredScope = SCOPE_OPTIONS.filter(
    (scope) => scope.index > currentUserHierarchy,
  );
  const scopeSection = (
    <div>
      <SectionLabel label="Scope" />
      <RadioGroup
        value={scope}
        onValueChange={setScope}
        className={cn(
          "grid gap-0 gap-y-1",
          filteredScope.length === 2
            ? "grid-cols-2"
            : filteredScope.length === 3
              ? "grid-cols-3"
              : filteredScope.length === 4
                ? "grid-cols-4"
                : "grid-cols-6",
        )}
      >
        {filteredScope.map((opt) => (
          <label
            key={opt.value}
            htmlFor={`scope-${opt.value}`}
            className={cn("flex flex-1 cursor-pointer items-center gap-1")}
          >
            <RadioGroupItem
              value={opt.value}
              id={`scope-${opt.value}`}
              className={RADIO_CLASS}
            />
            <span className="text-[13px] font-medium">{opt.label}</span>
          </label>
        ))}
      </RadioGroup>
    </div>
  );

  const locationSection = (
    <div className="space-y-1">
      {showPlatformField && (
        <>
          <SectionLabel label="Platform" />
          <LocationSelect
            placeholder="All Platforms..."
            value={selectedPlatformId ? Number(selectedPlatformId) : undefined}
            options={platformOptions}
            onChange={handlePlatformChange}
          />
        </>
      )}
      <SectionLabel label="Scope" />
      {showCountry && (
        <LocationSelect
          placeholder="All Countries..."
          value={countryId}
          options={countryOptions}
          onChange={handleCountryChange}
        />
      )}
      {showState && (
        <LocationSelect
          placeholder="All States..."
          value={stateFilterId}
          options={stateOptions}
          onChange={handleStateFilterChange}
        />
      )}
      {showDivision && (
        <LocationSelect
          placeholder="All Divisions..."
          value={divisionId}
          options={divisionOptions}
          onChange={handleDivisionChange}
        />
      )}
      {showDistrict && (
        <LocationSelect
          placeholder="All District..."
          value={districtId}
          options={districtOptions}
          onChange={handleDistrictChange}
        />
      )}
      {showTehsil && (
        <LocationSelect
          placeholder="All Tehsil..."
          value={tehsilId}
          options={tehsilOptions}
          onChange={handleTehsilChange}
        />
      )}
      {showTeamLeader && (
        <LocationSelect
          placeholder="All Team Leader..."
          value={teamLeaderId}
          options={teamLeaderOptions}
          onChange={handleTeamLeaderChange}
        />
      )}
      {showSevadarField && (
        <LocationSelect
          placeholder="All Sevadar..."
          value={sevadarId}
          options={[]}
          onChange={handleSevadarChange}
        />
      )}
    </div>
  );

  const timePeriodSection = (
    <div>
      <SectionLabel label="Time Period" />
      <RadioGroup
        value={timePeriod}
        onValueChange={handleTimePeriodChange}
        className="grid grid-cols-2 gap-2"
      >
        {TIME_PERIODS.filter((t) =>
          isSevadarTab ? !t.value.includes("this") : true,
        ).map((period) => (
          <label
            key={period.value}
            htmlFor={`time-${period.value}`}
            className={cn(PILL_CLASS, period.className)}
          >
            <RadioGroupItem
              value={period.value}
              id={`time-${period.value}`}
              className={RADIO_CLASS}
            />
            <span className="text-[13px] font-medium text-[#2A2F45]">
              {period.label}
            </span>
          </label>
        ))}
      </RadioGroup>
      {!isSevadarTab && (
        <>
          <SectionLabel label="Or" />
          <DatePickerWithRange
            className="pt-1"
            value={dateRange}
            onChange={(e) => {
              setTimePeriod("");
              setDateRange(e);
            }}
          />
        </>
      )}
    </div>
  );

  const statusSection = (
    <div>
      <SectionLabel label="Status" />
      <div className="grid grid-cols-2 gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            htmlFor={`status-${opt.value}`}
            className={PILL_CLASS}
          >
            <Checkbox
              id={`status-${opt.value}`}
              className={CHECKBOX_CLASS}
              checked={status.includes(opt.value)}
              onCheckedChange={(c) =>
                handleStatusChange(opt.value, c as boolean)
              }
            />
            <span className="text-[13px] font-medium text-[#2A2F45]">
              {opt.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  const labelFor = (
    options: { label: string; value: string | number }[],
    value?: string | number | null,
  ) => options.find((o) => String(o.value) === String(value))?.label;

  const topTabLabel = TOP_TABS.find((t) => t.value === topTab)?.label ?? topTab;
  const subTabLabel = SUB_TABS.find((t) => t.value === subTab)?.label;
  const breadcrumbTitle = subTabLabel
    ? `${topTabLabel} > ${subTabLabel}`
    : topTabLabel;

  const timePeriodLabel =
    timePeriod === "custom"
      ? dateRange?.from
        ? dateRange.to
          ? `${format(dateRange.from, "dd MMM")} - ${format(dateRange.to, "dd MMM")}`
          : format(dateRange.from, "dd MMM")
        : "Custom"
      : (labelFor(TIME_PERIODS, timePeriod) ?? timePeriod);

  const scopeLabel = labelFor(SCOPE_OPTIONS, scope) ?? scope;

  const locationLabels = [
    showPlatformField
      ? (labelFor(platformOptions, selectedPlatformId) ?? "All Platforms")
      : null,
    showCountry
      ? (labelFor(countryOptions, countryId) ?? "All Countries")
      : null,
    showState ? (labelFor(stateOptions, stateFilterId) ?? "All States") : null,
    showDivision
      ? (labelFor(divisionOptions, divisionId) ?? "All Divisions")
      : null,
    showDistrict
      ? (labelFor(districtOptions, districtId) ?? "All District")
      : null,
    showTehsil ? (labelFor(tehsilOptions, tehsilId) ?? "All Tehsil") : null,
    showTeamLeader
      ? (labelFor(teamLeaderOptions, teamLeaderId) ?? "All Team Leader")
      : null,
    showSevadarField ? "All Sevadar" : null,
  ]
    .filter((v): v is string => Boolean(v))
    .map((v) => v.replace(/\.\.\.$/, ""));

  const statusLabel = status
    .map((s) => labelFor(STATUS_OPTIONS, s) ?? s)
    .join(", ");

  const bookOrderScopeLabel = bookOrderScope
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(", ");

  const filterSubtitle =
    topTab === "book-order"
      ? bookOrderScopeLabel || "All"
      : [timePeriodLabel, scopeLabel, ...locationLabels, statusLabel]
          .filter(Boolean)
          .join(" | ");

  if (filterCollapsed) {
    return (
      <ResultHeader
        path={breadcrumbTitle}
        subtitle={filterSubtitle}
        onEdit={() => setFilterCollapsed(false)}
        className={TOP_TABS[0].className}
      />
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <TabShapeBg activeTab={topTab} />

      {/* Top Tabs */}
      <div className="relative z-10 flex gap-1.5 px-2 py-1">
        {TOP_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => handleTopTabChange(tab.value)}
            className={cn(
              "flex-1 cursor-pointer rounded-lg py-1.5 text-[13px] font-semibold whitespace-nowrap transition-all duration-200",
              topTab === tab.value
                ? "bg-linear-to-r text-white shadow-md " + tab.className
                : "bg-white hover:bg-white/90",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-1 px-3 pb-4">
        {/* Sub Tabs */}
        {topTab !== "book-order" && (
          <div className="grid grid-cols-4 gap-1">
            {SUB_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setSubTab(tab.value)}
                className={cn(
                  "cursor-pointer rounded-lg px-0.5 py-1.25 text-[10px] font-semibold whitespace-nowrap transition-all duration-200",
                  subTab === tab.value
                    ? `${SUB_TAB_COLORS[topTab]} text-white shadow-sm`
                    : "bg-white",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* SM Platforms / Platform wise: Time Period leads, then Scope + locations */}
        {topTab !== "book-order" && isPlatformTab && (
          <>
            {timePeriodSection}
            {isSevadarTab ? scopeSection : null}
            {locationSection}
          </>
        )}

        {/* SM Sevadar / PDF Report: Scope leads, then locations + Time Period + Status */}
        {topTab !== "book-order" && !isPlatformTab && (
          <>
            {timePeriodSection}
            {isSevadarTab ? scopeSection : null}
            {locationSection}
            {statusSection}
          </>
        )}

        {/* Book Order scope */}
        {topTab === "book-order" && (
          <div>
            <SectionLabel label="Scope" />
            <div className="grid grid-cols-2 gap-2">
              {BOOK_ORDER_SCOPES.map((val) => (
                <label
                  key={val}
                  htmlFor={`boscope-${val}`}
                  className={PILL_CLASS}
                >
                  <Checkbox
                    id={`boscope-${val}`}
                    className={CHECKBOX_CLASS}
                    checked={bookOrderScope.includes(val)}
                    onCheckedChange={(c) =>
                      handleBookOrderScopeChange(val, c as boolean)
                    }
                  />
                  <span className="text-[13px] font-medium text-[#2A2F45] capitalize">
                    {val}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <SearchButton
          className="w-full rounded-full"
          disabled={Object.keys(filters).length === 0}
          onClick={triggerSearch}
        />
      </div>
    </div>
  );
}
