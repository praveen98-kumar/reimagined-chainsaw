"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import type {
  Question,
  QuestionFormValues,
} from "../_types/manage-questions.types";
import { useMockQuestionStore } from "../_store/useMockQuestionStore";
import { buildQuestion } from "../_utils/question.schema";
import { QuestionFormCard } from "./question-form-card";
import { QuestionListCard } from "./question-list-card";

interface QuestionListProps {
  questions: Question[];
  loading?: boolean;
  readOnly?: boolean;
  emptyMessage?: string;
}

function QuestionSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl bg-white shadow-md">
      <div className="h-8 bg-slate-200" />
      <div className="space-y-3 p-3">
        <div className="h-14 rounded-xl bg-slate-100" />
        <div className="h-4 w-2/3 rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

export function QuestionList({
  questions,
  loading,
  readOnly,
  emptyMessage = "No questions found",
}: QuestionListProps) {
  const { updateQuestion, removeQuestion, publishQuestion } =
    useMockQuestionStore((state) => state.actions);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEdit = useCallback((question: Question) => {
    setEditingId(question.id);
  }, []);

  const handleDelete = useCallback(
    (question: Question) => {
      removeQuestion(question.id);
      toast.success("Question deleted");
    },
    [removeQuestion],
  );

  const handlePublish = useCallback(
    (question: Question) => {
      publishQuestion(question.id);
      toast.success("Question published");
    },
    [publishQuestion],
  );

  const handleSaveEdit = useCallback(
    (question: Question) => (values: QuestionFormValues) => {
      updateQuestion(
        question.id,
        buildQuestion(values, {
          id: question.id,
          status: question.status,
          createdAt: question.createdAt,
        }),
      );
      setEditingId(null);
      toast.success("Question updated");
    },
    [updateQuestion],
  );

  if (loading) {
    return (
      <div className="space-y-3">
        <QuestionSkeleton />
        <QuestionSkeleton />
        <QuestionSkeleton />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl bg-white/70 px-4 py-10 text-center text-sm text-[#8A93A8] shadow-md">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {questions.map((question, position) => {
        const index = position + 1;

        if (!readOnly && editingId === question.id) {
          return (
            <QuestionFormCard
              key={question.id}
              mode="edit"
              index={index}
              defaultValues={question}
              onSubmit={handleSaveEdit(question)}
              onCancel={() => setEditingId(null)}
            />
          );
        }

        return (
          <QuestionListCard
            key={question.id}
            question={question}
            index={index}
            readOnly={readOnly}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPublish={handlePublish}
          />
        );
      })}
    </div>
  );
}
