"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";

import { cn } from "@/utils/cn";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Field, FieldLabel } from "./ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

type DatePickerWithRangeProps = {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  label?: string;
  placeholder?: string;
  className?: string;
};

export function DatePickerWithRange({
  value,
  onChange,
  label,
  placeholder = "Select date range",
  className,
}: DatePickerWithRangeProps) {
  const id = React.useId();

  return (
    <Field className={cn("w-full", className)}>
      {label ? <FieldLabel htmlFor={id}>{label}</FieldLabel> : null}
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              id={id}
              className="h-7 w-full justify-start border-0 bg-white px-2.5 text-[13px] font-normal shadow-[0_2px_8px_rgba(24,35,90,0.08)]"
            >
              <CalendarIcon data-icon="inline-start" />
              {value?.from ? (
                value.to ? (
                  <>
                    {format(value.from, "LLL dd, y")} -{" "}
                    {format(value.to, "LLL dd, y")}
                  </>
                ) : (
                  format(value.from, "LLL dd, y")
                )
              ) : (
                <span className="text-[#8A93A8]">{placeholder}</span>
              )}
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            classNames={{ months: "rdp-months relative flex flex-row gap-4" }}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}
