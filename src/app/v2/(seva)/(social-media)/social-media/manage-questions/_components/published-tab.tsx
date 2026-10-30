"use client";

import { useQuestionsByStatus } from "../_store/useMockQuestionStore";
import { QuestionList } from "./question-list";

export function PublishedTab() {
  const published = useQuestionsByStatus("published");

  return (
    <QuestionList
      questions={published}
      emptyMessage="No published questions yet"
    />
  );
}
