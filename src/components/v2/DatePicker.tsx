"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/utils/cn";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Field, FieldLabel } from "./ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

type DatePickerProps = {
  value?: Date | null;
  onChange?: (date: Date | undefined) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export function DatePicker({
  value,
  onChange,
  label,
  placeholder = "Select date",
  disabled,
  className,
}: DatePickerProps) {
  const id = React.useId();

  return (
    <Field className={cn("w-full", className)}>
      {label ? <FieldLabel htmlFor={id}>{label}</FieldLabel> : null}
      <Popover>
        <PopoverTrigger
          disabled={disabled}
          render={
            <Button
              variant="outline"
              id={id}
              disabled={disabled}
              className="h-9 w-full justify-start gap-2 border-[#E5E5E5] bg-white px-3 text-[13px] font-normal disabled:opacity-60"
            >
              <CalendarIcon data-icon="inline-start" className="size-4" />
              {value ? (
                format(value, "dd MMM, yyyy")
              ) : (
                <span className="text-[#8A93A8]">{placeholder}</span>
              )}
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value ?? undefined}
            defaultMonth={value ?? undefined}
            onSelect={onChange}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}
