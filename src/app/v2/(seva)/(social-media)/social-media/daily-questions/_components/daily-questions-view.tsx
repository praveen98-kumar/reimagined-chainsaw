"use client";

import { useCallback, useMemo, useState } from "react";
import type { Question } from "../../manage-questions/_types/manage-questions.types";
import { DraftsToolbar } from "../../manage-questions/_components/drafts-toolbar";
import { QuestionListCard } from "../../manage-questions/_components/question-list-card";
import { useSocialMediaDailyQuestion } from "../../_query-options/queries/get-daily-questions";

interface DailyQuestionsViewProps {
  questions: Question[];
}

export function DailyQuestionsView({ questions }: DailyQuestionsViewProps) {
  const { data } = useSocialMediaDailyQuestion({
    state_id: 27
  })

  const [term, setTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    questions.map((question) => question.id),
  );

  const handleSearch = useCallback((value: string) => {
    setTerm(value);
  }, []);

  const handleSelect = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked
        ? prev.includes(id)
          ? prev
          : [...prev, id]
        : prev.filter((selectedId) => selectedId !== id),
    );
  }, []);

  const filtered = useMemo(() => {
    const keyword = term.trim().toLowerCase();
    if (!keyword) return questions;
    return questions.filter((question) =>
      question.title.toLowerCase().includes(keyword),
    );
  }, [questions, term]);

  return (
    <div className="space-y-3">
      <DraftsToolbar onSearch={handleSearch} />

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white/70 px-4 py-10 text-center text-sm text-[#8A93A8] shadow-md">
          No questions found
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((question, position) => (
            <QuestionListCard
              key={question.id}
              question={question}
              index={position + 1}
              readOnly
              selectable
              selected={selectedIds.includes(question.id)}
              onSelectedChange={(checked) => handleSelect(question.id, checked)}
              dateLabel="Published on"
            />
          ))}
        </div>
      )}
    </div>
  );
}
