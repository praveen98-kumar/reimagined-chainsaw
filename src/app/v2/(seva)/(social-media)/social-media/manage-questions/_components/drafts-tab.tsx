"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuestionsByStatus } from "../_store/useMockQuestionStore";
import { DraftsToolbar } from "./drafts-toolbar";
import { QuestionList } from "./question-list";

export function DraftsTab() {
  const drafts = useQuestionsByStatus("draft");
  const [term, setTerm] = useState("");

  const handleSearch = useCallback((value: string) => {
    setTerm(value);
  }, []);

  const filtered = useMemo(() => {
    const keyword = term.trim().toLowerCase();
    if (!keyword) return drafts;
    return drafts.filter((question) =>
      question.title.toLowerCase().includes(keyword),
    );
  }, [drafts, term]);

  return (
    <div className="space-y-3">
      <DraftsToolbar onSearch={handleSearch} />
      <QuestionList questions={filtered} emptyMessage="No drafts yet" />
    </div>
  );
}
