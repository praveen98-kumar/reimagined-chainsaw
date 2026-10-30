"use client";

import Image from "next/image";
import { Clock, Lock, MoreVertical } from "lucide-react";
import { Checkbox } from "@/components/v2/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/DropdownMenu";
import {
  ACTION_META,
  ACTION_ORDER,
  PLATFORM_OPTIONS_BY_VALUE,
  STATE_LABELS_BY_VALUE,
} from "../_constants/manage-questions.constants";
import type { ActionKey, Question } from "../_types/manage-questions.types";
import { formatSchedule } from "../_utils/format";

interface QuestionListCardProps {
  question: Question;
  index: number;
  readOnly?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  dateLabel?: string;
  onEdit?: (question: Question) => void;
  onDelete?: (question: Question) => void;
  onPublish?: (question: Question) => void;
}

const ANSWER_LETTER: Record<string, string> = {
  numeric: "N",
  checkbox: "C",
};

export function QuestionListCard({
  question,
  index,
  readOnly,
  selectable,
  selected,
  onSelectedChange,
  dateLabel = "Scheduled for",
  onEdit,
  onDelete,
  onPublish,
}: QuestionListCardProps) {
  const platform = PLATFORM_OPTIONS_BY_VALUE[question.platform];
  const scheduledFor = question.schedule.enabled
    ? formatSchedule(question.schedule.date, question.schedule.time)
    : null;

  const statesLabel =
    question.stateIds.length === 0
      ? "All States"
      : question.stateIds
          .map((id) => STATE_LABELS_BY_VALUE[id])
          .filter(Boolean)
          .join(", ");

  const enabledActions = ACTION_ORDER.filter(
    (key) => question.actions[key].enabled,
  );

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-md">
      <div className="flex items-center justify-between bg-linear-to-r from-[#0A1A6B] to-[#1E3FD8] px-3 py-1.5">
        <div className="flex items-center gap-2">
          {selectable && (
            <Checkbox
              checked={selected}
              onCheckedChange={(checked) => onSelectedChange?.(!!checked)}
              aria-label={`Select question ${index}`}
            />
          )}
          <p className="text-sm font-bold text-white">Question {index}</p>
        </div>
        <div className="flex items-center gap-2">
          {question.questionType === "permanent" ? (
            <Lock className="size-3.5 text-white" aria-label="Permanent" />
          ) : (
            <Clock className="size-3.5 text-white" aria-label="Temporary" />
          )}
          {!readOnly && (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Question actions"
                className="text-white outline-none"
              >
                <MoreVertical className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onEdit?.(question)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onPublish?.(question)}>
                  Publish
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => onDelete?.(question)}
                  className="text-red-600 focus:text-red-600"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="space-y-3 p-3">
        <div className="flex items-stretch gap-2">
          <div className="flex w-20 shrink-0 flex-col items-center justify-center gap-1">
            {platform && (
              <Image
                src={platform.icon}
                alt={platform.label}
                width={28}
                height={28}
                className="h-7 w-7 object-contain"
              />
            )}
            <span className="text-[11px] font-medium text-[#2A2F45]">
              {platform?.label ?? question.platform}
            </span>
          </div>
          <div className="flex-1 rounded-xl bg-[#DCE8FB] px-2.5 py-2">
            <p className="line-clamp-2 text-[13px] font-medium text-[#2A2F45]">
              {question.title}
            </p>
          </div>
        </div>

        {enabledActions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {enabledActions.map((key: ActionKey) => {
              const meta = ACTION_META[key];
              const answerType = question.actions[key].answerType;
              return (
                <span
                  key={key}
                  className="flex items-center gap-1 rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-medium text-[#2A2F45]"
                >
                  <Image
                    src={meta.icon}
                    alt={meta.label}
                    width={12}
                    height={12}
                    className="h-3 w-3 object-contain"
                  />
                  {meta.label}
                  {answerType ? ` (${ANSWER_LETTER[answerType]})` : ""}
                </span>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-[#8A93A8]">{statesLabel}</span>
          {scheduledFor && (
            <span className="rounded-full bg-[#DCE8FB] px-2 py-0.5 text-[11px] font-medium text-[#2554FF]">
              {dateLabel}: {scheduledFor}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
