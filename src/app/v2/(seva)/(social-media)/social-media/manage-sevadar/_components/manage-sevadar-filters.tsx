"use client";

import { LocationInputs } from "@/components/v2/LocationInputs";
import { SearchButton } from "@/components/v2/SearchButton";
import { RadioGroupItem } from "@/components/v2/ui/radio-group";
import type { Option } from "@/shared/interfaces/option";
import { useFilters, useFilterActions } from "@/store/useFilterStore";
import { Input } from "@/components/v2/ui/input";
import { Label } from "@/components/v2/ui/label";
import { RadioGroup } from "@/components/v2/ui/radio-group";
import { useState, useEffect } from "react";
import { ReactSelect } from "@/components/v2/ReactSelect";
import { cn } from "@/utils/cn";

const sevaOptions: Option[] = [
  { label: "Social Media Seva", value: "social_media" },
  { label: "Book Order Seva", value: "book_order" },
  { label: "Trend Seva", value: "trend_seva" },
];

interface MobileInputWithSearch {
  onSearch?: () => void;
  defaultValue?: string;
}
export function ManageSMSevadarFilters({
  onSearch,
  defaultValue = "",
}: MobileInputWithSearch) {
  const { setFilters, resetFilters } = useFilterActions();
  const [input, setInput] = useState(defaultValue);
  const [searchType, setSearchType] = useState<"mobile" | "seva">("mobile");

  useEffect(() => {
    return () => {
      resetFilters();
    };
  }, [resetFilters]);

  return (
    <div className="space-y-4">
      {/* Search By Container */}
      <div className="bg-white rounded-2xl shadow-md p-3 border border-gray-100">
        <div className="space-y-2">
          {/* <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white px-3 flex items-center gap-2">
            <div className="h-[1px] w-4 bg-gray-200" />
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider whitespace-nowrap">
              Search by
            </span>
            <div className="h-[1px] w-4 bg-gray-200" />
          </div> */}

          <RadioGroup
            value={searchType}
            onValueChange={(val: any) => {
              setSearchType(val);
              if (val === "seva") {
                setFilters({ mobile_no: "" });
              } else {
                setFilters({ seva_type: "", sevadar_status: "" });
              }
            }}
            className="flex items-center gap-2"
          >
            <div
              className={cn(
                "flex items-center gap-2 bg-[#F1F5F9] rounded-full px-3 py-2.5 flex-1 transition-colors cursor-pointer",
              )}
            >
              <RadioGroupItem value="mobile" id="mobile" />
              <Label
                htmlFor="mobile"
                className="text-[13px] text-slate-600 font-medium cursor-pointer"
              >
                Mobile number
              </Label>
            </div>
            <div
              className={cn(
                "flex items-center gap-2 bg-[#F1F5F9] rounded-full px-3 py-2.5 flex-1 transition-colors cursor-pointer",
              )}
            >
              <RadioGroupItem
                value="seva"
                id="seva"
                className="size-4 border-gray-400 bg-white"
              />
              <Label
                htmlFor="seva"
                className="text-[13px] text-slate-600 font-medium cursor-pointer"
              >
                Seva type
              </Label>
            </div>
          </RadioGroup>

          {/* Conditional Inputs */}
          <div className="flex flex-col justify-center">
            {searchType === "mobile" ? (
              <Input
                id="mobileNo"
                value={input}
                placeholder="Enter 10 digit mobile number"
                maxLength={10}
                onChange={(e) => {
                  const val = String(e.target.value).replace(/[^0-9]/g, "");
                  setInput(val);
                  if (val.length === 10) {
                    setFilters({
                      mobile_no: `+91${val}`,
                    });
                  }
                }}
                className="h-10"
              />
            ) : (
              <div className="space-y-1">
                <LocationInputs useGlobalFilters />
              </div>
            )}
          </div>

          {/*<ReactSelect
            placeholder={`Select Seva type`}
            options={sevaOptions}
            onChange={(opt: any) => {
              setFilters({
                seva_type: opt.value,
              });
            }}
          />*/}
          {/* Additional Filters (placed before search button as per feedback) */}
          {/*<RadioGroup
            className={"flex items-center justify-center gap-8"}
            onValueChange={(val) => setFilters({ sevadar_status: val })}
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem value="added" id="added" />
              <Label htmlFor="added" className="text-sm text-slate-700">
                Sevadar Added
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="not-added" id="not-added" />
              <Label htmlFor="not-added" className="text-sm text-slate-700">
                Sevadar Not Added
              </Label>
            </div>
          </RadioGroup>*/}

          <SearchButton
            onClick={onSearch}
            // disabled={Object.keys(filters).length === 0}
          />
          {/*{JSON.stringify(filters)}*/}
        </div>
      </div>
    </div>
  );
}
