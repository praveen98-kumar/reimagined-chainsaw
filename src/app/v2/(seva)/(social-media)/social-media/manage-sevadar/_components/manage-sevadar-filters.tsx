"use client";

import { ReactSelect } from "@/components/v2/ReactSelect";
import { SearchButton } from "@/components/v2/SearchButton";
import { Input } from "@/components/v2/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/v2/ui/radio-group";
import {
  isRoleBelow,
  regionHirarchy,
  regionHirarchyMap,
} from "@/constants/app";
import { sevaWiseRoleIds } from "@/constants/roles";
import type { SevaType } from "@/config/roles";
import { useGetRoles } from "@/http/role";
import {
  useCountries,
  useDistricts,
  useDivisions,
  useStates,
  useTehsils,
} from "@/hooks/useLocationAPI";
import { useAppSelector } from "@/redux/store";
import { capitalizeWords } from "@/shared/functions/utils";
import type { TransferType } from "@/shared/interfaces/transfer";
import {
  type ActiveTab,
  useActiveTab,
  useFilterActions,
  useTransfer,
} from "@/store/useFilterStore";
import { cn } from "@/utils/cn";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const TABS: { label: string; value: ActiveTab }[] = [
  { label: "Manage", value: "manage" },
  { label: "Transfer", value: "transfer" },
];

const TRANSFER_TYPES: { label: string; value: TransferType }[] = [
  { label: "Seva Transfer", value: "seva" },
  { label: "Location Transfer", value: "location" },
];

const SEVA_OPTIONS = [
  { label: "Social Media Seva", value: "social_media" },
  { label: "Book Order Seva", value: "book_order" },
  { label: "Trend Seva", value: "trend_seva" },
];

const ALLOWED_ROLE_GROUPS = ["book_order", "social_media"];

type SearchType = "mobile" | "seva";
type RoleRegion = keyof typeof regionHirarchyMap;

const RADIO_CLASS =
  "size-4 border-[#A9B1C2] bg-white data-[checked]:border-[#0BA6B6] [&_span]:bg-[#0BA6B6]";

const PILL_CLASS =
  "flex items-center gap-2 rounded-full bg-[#F1F5F9] px-3 py-2.5 cursor-pointer";

interface MobileInputWithSearch {
  onSearch?: () => void;
  defaultValue?: string;
}

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
      options={options}
      value={selectedOption}
      placeholder={placeholder}
      isSearchable
      isDisabled={options.length === 0}
      onChange={(option: any) => onChange(option ? String(option.value) : null)}
    />
  );
}

function MobileField({
  title,
  align = "left",
  value,
  onChange,
}: {
  title?: string;
  align?: "left" | "right";
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div
      className={cn("relative rounded-2xl bg-[#0E7C86] p-2", title && "pt-4")}
    >
      {title && (
        <div
          className={cn(
            "absolute -top-3 rounded-md bg-[#0E7C86] text-sm px-4 pt-2 font-bold text-white w-1/2 text-center",
            align === "left" ? "left-0" : "right-0",
          )}
        >
          {title}
        </div>
      )}
      <div
        className={cn(
          "flex h-10 items-center rounded-xl border border-[#0E7C86]/30 bg-white px-3",
        )}
      >
        <span className="text-[13px] text-slate-400">+91</span>
        <span className="mx-2 h-5 w-px bg-slate-200" />
        <Input
          value={value}
          inputMode="numeric"
          maxLength={10}
          placeholder="Enter 10 digit mobile number"
          onChange={(e) =>
            onChange(String(e.target.value).replace(/[^0-9]/g, ""))
          }
          className="h-full flex-1 rounded-none border-0 bg-transparent px-0 text-[13px] shadow-none focus-visible:ring-0"
        />
      </div>
    </div>
  );
}

export function ManageSMSevadarFilters({
  onSearch,
  defaultValue = "",
}: MobileInputWithSearch) {
  const { setFilters, resetFilters, setActiveTab, setTransfer } =
    useFilterActions();

  const activeTab = useActiveTab();
  const transfer = useTransfer();

  const auth = useAppSelector((s) => s.auth);
  const { active_permission, active_region_index } = auth;
  const activeRegion = (active_permission?.region as any)?.[
    active_region_index
  ];
  const roleRegion = active_permission?.role_region as RoleRegion;
  const userLevel = regionHirarchyMap[roleRegion] ?? 0;

  const locationFields = useMemo(
    () => regionHirarchy.slice(userLevel + 1) as string[],
    [userLevel],
  );

  const [searchType, setSearchType] = useState<SearchType>("mobile");
  const [mobile, setMobile] = useState(defaultValue);
  const [sevaType, setSevaType] = useState("");
  const [roleId, setRoleId] = useState<number>();

  const [countryId, setCountryId] = useState<number>();
  const [stateFilterId, setStateFilterId] = useState<number>();
  const [divisionId, setDivisionId] = useState<number>();
  const [districtId, setDistrictId] = useState<number>();
  const [tehsilId, setTehsilId] = useState<number>();

  useEffect(() => {
    return () => {
      resetFilters();
    };
  }, [resetFilters]);

  const showCountry = locationFields.includes("country");
  const showState = locationFields.includes("state");
  const showDivision = locationFields.includes("division");
  const showDistrict = locationFields.includes("district");
  const showTehsil = locationFields.includes("tehsil");

  const baseCountryId = countryId ?? activeRegion?.country_id;
  const baseStateId = stateFilterId ?? activeRegion?.state_id;
  const baseDistrictId = districtId ?? activeRegion?.district_id;

  const { data: countryOptions = [] } = useCountries({ enabled: showCountry });
  const { data: stateOptions = [] } = useStates(baseCountryId ?? "", {
    enabled: showState && !!baseCountryId,
  });
  const { data: divisionOptions = [] } = useDivisions(baseStateId ?? "", {
    enabled: showDivision && !!baseStateId,
  });
  const { data: districtOptions = [] } = useDistricts(baseStateId ?? "", {
    enabled: showDistrict && !!baseStateId,
  });
  const { data: tehsilOptions = [] } = useTehsils(baseDistrictId ?? "", {
    enabled: showTehsil && !!baseDistrictId,
  });

  const { data: allRoles = [] } = useGetRoles({});

  const roleOptions = useMemo(() => {
    const sevaRoleIds = sevaType ? sevaWiseRoleIds[sevaType as SevaType] : null;
    const currentRole = allRoles.find(
      (role) => role.id === active_permission?.role_id,
    );

    return allRoles
      .filter((role) =>
        sevaRoleIds
          ? sevaRoleIds.includes(role.id)
          : ALLOWED_ROLE_GROUPS.includes(role.group),
      )
      .filter((role) => isRoleBelow(role, roleRegion ?? "ashram", currentRole))
      .map((role) => ({
        label: capitalizeWords(role.name.replace(/_/g, " ")),
        value: role.id,
      }));
  }, [allRoles, sevaType, roleRegion, active_permission?.role_id]);

  const handleTabChange = (next: ActiveTab) => {
    if (next === activeTab) return;
    resetFilters();
    setActiveTab(next);
  };

  const handleSearchTypeChange = (val: SearchType) => {
    setSearchType(val);

    if (val === "mobile") {
      setMobile("");
      setSevaType("");
      setRoleId(undefined);
      setCountryId(undefined);
      setStateFilterId(undefined);
      setDivisionId(undefined);
      setDistrictId(undefined);
      setTehsilId(undefined);
      setFilters({
        mobile_no: "",
        seva_type: "",
        role_id: null,
        state_id: null,
        division_id: null,
        district_id: null,
        tehsil_id: null,
      });
      return;
    }

    setMobile("");
    setFilters({ mobile_no: "" });
  };

  const handleMobileChange = (val: string) => {
    const digits = val.replace(/[^0-9]/g, "").slice(0, 10);
    setMobile(digits);
    setFilters({ mobile_no: digits.length === 10 ? `+91${digits}` : "" });
  };

  const handleSevaChange = (val: string | null) => {
    setSevaType(val ?? "");
    setRoleId(undefined);
    setFilters({ seva_type: val ?? "", role_id: null });
  };

  const handleRoleChange = (val: string | null) => {
    const id = val ? Number(val) : undefined;
    setRoleId(id);
    setFilters({ role_id: id ?? null });
  };

  const handleCountryChange = (val: string | null) => {
    const id = val ? Number(val) : undefined;
    setCountryId(id);
    setStateFilterId(undefined);
    setDivisionId(undefined);
    setDistrictId(undefined);
    setTehsilId(undefined);
    setFilters({
      state_id: null,
      division_id: null,
      district_id: null,
      tehsil_id: null,
    });
  };

  const handleStateFilterChange = (val: string | null) => {
    const id = val ? Number(val) : undefined;
    setStateFilterId(id);
    setDivisionId(undefined);
    setDistrictId(undefined);
    setTehsilId(undefined);
    setFilters({
      state_id: id ?? null,
      division_id: null,
      district_id: null,
      tehsil_id: null,
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
    setFilters({ district_id: id ?? null, tehsil_id: null });
  };

  const handleTehsilChange = (val: string | null) => {
    const id = val ? Number(val) : undefined;
    setTehsilId(id);
    setFilters({ tehsil_id: id ?? null });
  };

  const handleTransferTypeChange = (val: TransferType) => {
    setTransfer({
      type: val,
      searching: false,
      fromMobile: "",
      toMobile: "",
      fromUser: null,
      toUser: null,
    });
    setFilters({ mobile_no: "" });
  };

  const handleTransferMobileChange = (val: string, step: "from" | "to") => {
    const digits = val.replace(/[^0-9]/g, "").slice(0, 10);
    setTransfer(
      step === "from"
        ? { fromMobile: digits, searching: false }
        : { toMobile: digits, searching: false },
    );
    setFilters({ mobile_no: "" });
  };

  const handleTransferSearch = () => {
    const digits =
      transfer.type === "location"
        ? transfer.fromMobile
        : transfer.fromUser
          ? transfer.toMobile
          : transfer.fromMobile;

    if (digits.length !== 10) {
      toast.error("Enter a valid 10 digit mobile number");
      return;
    }

    setTransfer({ searching: true });
    setFilters({ mobile_no: `+91${digits}` });
    onSearch?.();
  };

  const showTransferSearch =
    !transfer.searching &&
    (transfer.type === "location" || !(transfer.fromUser && transfer.toUser));

  return (
    <div className="space-y-1 rounded-2xl border border-gray-100 bg-white/50 p-3 shadow-md">
      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => handleTabChange(t.value)}
            className={cn(
              "flex-1 cursor-pointer rounded-xl py-2 text-sm leading-tight font-semibold transition-all duration-200",
              activeTab === t.value
                ? "bg-linear-to-r from-[#02525A] to-[#38D2E2] text-white shadow-md"
                : "border border-[#CDE7EA] bg-white text-[#0B93A3]",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "manage" && (
        <div className="space-y-1">
          <SectionLabel label="Search by" />

          <RadioGroup
            value={searchType}
            onValueChange={(val: any) => handleSearchTypeChange(val)}
            className="grid grid-cols-2 gap-2"
          >
            <label htmlFor="search-mobile" className={PILL_CLASS}>
              <RadioGroupItem
                value="mobile"
                id="search-mobile"
                className={RADIO_CLASS}
              />
              <span className="text-sm font-medium text-slate-700">
                Mobile number
              </span>
            </label>
            <label htmlFor="search-seva" className={PILL_CLASS}>
              <RadioGroupItem
                value="seva"
                id="search-seva"
                className={RADIO_CLASS}
              />
              <span className="text-sm font-medium text-slate-700">
                Seva type
              </span>
            </label>
          </RadioGroup>

          {searchType === "mobile" ? (
            <div className="flex h-11 items-center rounded-xl border border-input bg-white px-3">
              <span className="text-sm text-slate-400">+91</span>
              <span className="mx-2 h-5 w-px bg-slate-200" />
              <Input
                id="mobileNo"
                value={mobile}
                inputMode="numeric"
                maxLength={10}
                placeholder="Enter 10 digit mobile number"
                onChange={(e) => handleMobileChange(String(e.target.value))}
                className="h-full flex-1 rounded-none border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <ReactSelect
                placeholder="Select Seva"
                options={SEVA_OPTIONS}
                value={
                  SEVA_OPTIONS.find((option) => option.value === sevaType) ??
                  null
                }
                onChange={(option: any) =>
                  handleSevaChange(option?.value ?? null)
                }
              />
              <ReactSelect
                placeholder="Select Role"
                options={roleOptions}
                value={
                  roleOptions.find((option) => option.value === roleId) ?? null
                }
                isDisabled={roleOptions.length === 0}
                onChange={(option: any) =>
                  handleRoleChange(option ? String(option.value) : null)
                }
              />
              {showCountry && (
                <LocationSelect
                  placeholder="All Country"
                  value={countryId}
                  options={countryOptions}
                  onChange={handleCountryChange}
                />
              )}
              {showState && (
                <LocationSelect
                  placeholder="All State"
                  value={stateFilterId}
                  options={stateOptions}
                  onChange={handleStateFilterChange}
                />
              )}
              {showDivision && (
                <LocationSelect
                  placeholder="All Division"
                  value={divisionId}
                  options={divisionOptions}
                  onChange={handleDivisionChange}
                />
              )}
              {showDistrict && (
                <LocationSelect
                  placeholder="All District"
                  value={districtId}
                  options={districtOptions}
                  onChange={handleDistrictChange}
                />
              )}
              {showTehsil && (
                <LocationSelect
                  placeholder="All Tehsil"
                  value={tehsilId}
                  options={tehsilOptions}
                  onChange={handleTehsilChange}
                />
              )}
            </div>
          )}

          <SearchButton className="w-2/3 rounded-full" onClick={onSearch} />
        </div>
      )}

      {activeTab === "transfer" && (
        <div className="space-y-2">
          <SectionLabel label="Type of transfer" />

          <RadioGroup
            value={transfer.type}
            onValueChange={(val: any) => handleTransferTypeChange(val)}
            className="grid grid-cols-2 gap-2"
          >
            {TRANSFER_TYPES.map((type) => (
              <label
                key={type.value}
                htmlFor={`transfer-${type.value}`}
                className={PILL_CLASS}
              >
                <RadioGroupItem
                  value={type.value}
                  id={`transfer-${type.value}`}
                  className={RADIO_CLASS}
                />
                <span className="text-sm font-medium text-slate-700">
                  {type.label}
                </span>
              </label>
            ))}
          </RadioGroup>

          {transfer.type === "seva" ? (
            <>
              {!transfer.fromUser && (
                <MobileField
                  title="From"
                  align="left"
                  value={transfer.fromMobile}
                  onChange={(val) => handleTransferMobileChange(val, "from")}
                />
              )}
              {transfer.fromUser && !transfer.toUser && (
                <MobileField
                  title="To"
                  align="right"
                  value={transfer.toMobile}
                  onChange={(val) => handleTransferMobileChange(val, "to")}
                />
              )}
            </>
          ) : (
            <MobileField
              value={transfer.fromMobile}
              onChange={(val) => handleTransferMobileChange(val, "from")}
            />
          )}

          {showTransferSearch && (
            <SearchButton
              className="w-2/3 rounded-full"
              onClick={handleTransferSearch}
            />
          )}
        </div>
      )}
    </div>
  );
}
