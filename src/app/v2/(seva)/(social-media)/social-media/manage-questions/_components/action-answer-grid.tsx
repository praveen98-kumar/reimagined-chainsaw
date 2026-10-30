"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useField } from "formik";
import { Checkbox } from "@/components/v2/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/v2/ui/popover";
import { cn } from "@/utils/cn";
import {
  ACTION_META,
  ACTION_ORDER,
  ANSWER_TYPE_LABEL,
  ANSWER_TYPE_OPTIONS,
} from "../_constants/manage-questions.constants";
import type {
  ActionKey,
  AnswerType,
  QuestionAction,
} from "../_types/manage-questions.types";

type ActionsValue = Record<ActionKey, QuestionAction>;

interface AnswerMenuProps {
  value: AnswerType | null;
  onSelect: (value: AnswerType | null) => void;
  disabled?: boolean;
}

function AnswerMenu({ value, onSelect, disabled }: AnswerMenuProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (next: AnswerType | null) => {
    onSelect(next);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        render={
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "flex items-center gap-0.5 rounded-md border border-[#E5E5E5] bg-white px-1.5 py-0.5 text-[10px] font-medium text-[#2A2F45] disabled:cursor-not-allowed disabled:opacity-50",
              value && "border-[#2554FF] text-[#2554FF]",
            )}
          >
            {value ? ANSWER_TYPE_LABEL[value] : "Answer"}
            <ChevronDown className="size-3" />
          </button>
        }
      />
      <PopoverContent className="w-32 gap-0 p-1" align="center">
        {ANSWER_TYPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSelect(option.value)}
            className="w-full rounded-md px-2 py-1.5 text-left text-xs hover:bg-slate-100"
          >
            {option.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleSelect(null)}
          className="w-full rounded-md px-2 py-1.5 text-left text-xs text-red-500 hover:bg-red-50"
        >
          Cancel
        </button>
      </PopoverContent>
    </Popover>
  );
}

interface ActionAnswerGridProps {
  name?: string;
  variant: "tile" | "checkbox";
}

export function ActionAnswerGrid({
  name = "actions",
  variant,
}: ActionAnswerGridProps) {
  const [field, , helpers] = useField<ActionsValue>(name);

  const update = (key: ActionKey, patch: Partial<QuestionAction>) => {
    helpers.setValue({
      ...field.value,
      [key]: { ...field.value[key], ...patch },
    });
  };

  return (
    <div className="grid grid-cols-4 gap-2">
      {ACTION_ORDER.map((key) => {
        const meta = ACTION_META[key];
        const action = field.value[key];

        if (variant === "tile") {
          return (
            <div
              key={key}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border-2 bg-white px-1 py-2 transition-colors",
                action.answerType ? "border-[#2554FF]" : "border-[#E5E5E5]",
              )}
            >
              <Image
                src={meta.icon}
                alt={meta.label}
                width={22}
                height={22}
                className="h-5 w-5 object-contain"
              />
              <span className="text-[11px] font-semibold text-[#2A2F45]">
                {meta.label}
              </span>
              <AnswerMenu
                value={action.answerType}
                onSelect={(answerType) =>
                  update(key, { answerType, enabled: answerType !== null })
                }
              />
            </div>
          );
        }

        return (
          <div key={key} className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-1.5">
              <Checkbox
                id={`action-${key}`}
                checked={action.enabled}
                onCheckedChange={(checked) =>
                  update(key, {
                    enabled: !!checked,
                    ...(checked ? {} : { answerType: null }),
                  })
                }
              />
              <Image
                src={meta.icon}
                alt={meta.label}
                width={18}
                height={18}
                className="h-4 w-4 object-contain"
              />
              <span className="text-[11px] font-semibold text-[#2A2F45]">
                {meta.label}
              </span>
            </div>
            <AnswerMenu
              value={action.answerType}
              disabled={!action.enabled}
              onSelect={(answerType) => update(key, { answerType })}
            />
          </div>
        );
      })}
    </div>
  );
}
