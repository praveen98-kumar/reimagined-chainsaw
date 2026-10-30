"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  createQuestionId,
  useMockQuestionStore,
  useQuestionsByStatus,
} from "../_store/useMockQuestionStore";
import type { QuestionFormValues } from "../_types/manage-questions.types";
import { buildQuestion } from "../_utils/question.schema";
import { QuestionFormCard } from "./question-form-card";

export function CreateTab() {
  const drafts = useQuestionsByStatus("draft");
  const addQuestion = useMockQuestionStore(
    (state) => state.actions.addQuestion,
  );
  const [formKey, setFormKey] = useState(0);

  const handleSubmit = (values: QuestionFormValues) => {
    addQuestion(
      buildQuestion(values, {
        id: createQuestionId(),
        status: "draft",
        createdAt: new Date().toISOString().slice(0, 10),
      }),
    );
    toast.success("Question saved as draft");
  };

  return (
    <QuestionFormCard
      key={formKey}
      mode="create"
      index={drafts.length + 1}
      onSubmit={handleSubmit}
      onCancel={() => setFormKey((key) => key + 1)}
    />
  );
}
