"use client";

import { useMemo } from "react";
import { ReactSelect } from "@/components/v2/ReactSelect";
import { buildTimeSlots } from "../_utils/format";

interface TimeSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function TimeSelect({
  value,
  onChange,
  placeholder = "Select Time",
  disabled,
}: TimeSelectProps) {
  const options = useMemo(() => buildTimeSlots(), []);

  return (
    <ReactSelect
      options={options}
      value={options.find((option) => option.value === value) ?? null}
      onChange={(option: any) => onChange(option?.value ?? null)}
      placeholder={placeholder}
      isDisabled={disabled}
      isClearable={false}
      isSearchable={false}
    />
  );
}
