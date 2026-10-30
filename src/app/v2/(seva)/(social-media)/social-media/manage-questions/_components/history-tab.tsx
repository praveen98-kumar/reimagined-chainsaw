"use client";

import { useQuestionsByStatus } from "../_store/useMockQuestionStore";
import { QuestionList } from "./question-list";

export function HistoryTab() {
  const history = useQuestionsByStatus("history");

  return (
    <QuestionList questions={history} readOnly emptyMessage="No history yet" />
  );
}
