"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Form, Formik, useFormikContext } from "formik";
import { Button } from "@/components/v2/ui/button";
import { Checkbox } from "@/components/v2/ui/checkbox";
import { Label } from "@/components/v2/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/v2/ui/radio-group";
import { Textarea } from "@/components/v2/ui/textarea";
import { DatePicker } from "@/components/v2/DatePicker";
import { ReactSelect } from "@/components/v2/ReactSelect";
import {
  MOCK_STATES,
  PLATFORM_OPTIONS,
  QUESTION_TYPE_OPTIONS,
} from "../_constants/manage-questions.constants";
import type {
  Question,
  QuestionFormValues,
} from "../_types/manage-questions.types";
import {
  emptyQuestionValues,
  questionSchema,
  toFormValues,
} from "../_utils/question.schema";
import { ActionAnswerGrid } from "./action-answer-grid";
import { TimeSelect } from "./time-select";

interface QuestionFormCardProps {
  mode: "create" | "edit";
  index: number;
  defaultValues?: Question;
  onSubmit: (values: QuestionFormValues) => void;
  onCancel: () => void;
}

function FormRow({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={htmlFor} className="text-[11px] text-[#8A93A8]">
        {label}
      </Label>
      {children}
    </div>
  );
}

function QuestionFormFields({ mode }: { mode: "create" | "edit" }) {
  const { values, setFieldValue } = useFormikContext<QuestionFormValues>();

  const stateOptions = useMemo(
    () =>
      MOCK_STATES.map((state) => ({
        value: state.value,
        label: state.label,
      })),
    [],
  );

  const expanded = mode === "edit" || values.platform !== "";

  return (
    <div className="space-y-3">
      <FormRow label="Platform Icon">
        <ReactSelect
          options={PLATFORM_OPTIONS}
          value={
            PLATFORM_OPTIONS.find(
              (option) => option.value === values.platform,
            ) ?? null
          }
          onChange={(option: any) =>
            setFieldValue("platform", option?.value ?? "")
          }
          placeholder="Select Icon..."
          formatOptionLabel={(option: any) => (
            <span className="flex items-center gap-2">
              <Image
                src={option.icon}
                alt={option.label}
                width={16}
                height={16}
                className="h-4 w-4 object-contain"
              />
              {option.label}
            </span>
          )}
        />
      </FormRow>

      {expanded && (
        <>
          <FormRow label="Actions">
            <ActionAnswerGrid variant="tile" />
          </FormRow>

          <FormRow label="Question Title" htmlFor="question-title">
            <Textarea
              id="question-title"
              name="title"
              value={values.title}
              onChange={(event) => setFieldValue("title", event.target.value)}
              placeholder="Enter Question..."
              className="min-h-20 rounded-xl border-[#E5E5E5] bg-white"
            />
          </FormRow>

          <FormRow label="Question Type:">
            <RadioGroup
              value={values.questionType}
              onValueChange={(value: string) =>
                setFieldValue("questionType", value)
              }
              className="flex items-center gap-6"
            >
              {QUESTION_TYPE_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center gap-2">
                  <RadioGroupItem
                    value={option.value}
                    id={`qtype-${option.value}`}
                  />
                  <Label
                    htmlFor={`qtype-${option.value}`}
                    className="text-[13px] text-[#2A2F45]"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </FormRow>

          <FormRow label="States">
            <ReactSelect
              isMulti
              options={stateOptions}
              value={stateOptions.filter((option) =>
                values.stateIds.includes(option.value),
              )}
              onChange={(options: any) =>
                setFieldValue(
                  "stateIds",
                  (options ?? []).map((option: any) => option.value),
                )
              }
              placeholder="All States..."
            />
          </FormRow>

          <FormRow label="Schedule Question">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="schedule-enabled-date"
                  checked={values.scheduleEnabled}
                  onCheckedChange={(checked) =>
                    setFieldValue("scheduleEnabled", !!checked)
                  }
                />
                <div className="flex-1">
                  <DatePicker
                    value={values.scheduleDate}
                    onChange={(date) =>
                      setFieldValue("scheduleDate", date ?? null)
                    }
                    disabled={!values.scheduleEnabled}
                    placeholder="Select Date"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="schedule-enabled-time"
                  checked={values.scheduleEnabled}
                  onCheckedChange={(checked) =>
                    setFieldValue("scheduleEnabled", !!checked)
                  }
                />
                <div className="flex-1">
                  <TimeSelect
                    value={values.scheduleTime}
                    onChange={(time) => setFieldValue("scheduleTime", time)}
                    disabled={!values.scheduleEnabled}
                  />
                </div>
              </div>
            </div>
          </FormRow>
        </>
      )}
    </div>
  );
}

export function QuestionFormCard({
  mode,
  index,
  defaultValues,
  onSubmit,
  onCancel,
}: QuestionFormCardProps) {
  const initialValues = useMemo(
    () => (defaultValues ? toFormValues(defaultValues) : emptyQuestionValues()),
    [defaultValues],
  );

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-md">
      <div className="bg-linear-to-r from-[#0A1A6B] to-[#1E3FD8] px-4 py-1.5">
        <p className="text-sm font-bold text-white">
          {mode === "create" ? `Question ${index}` : `Edit Question ${index}`}
        </p>
      </div>

      <div className="p-3">
        <Formik
          initialValues={initialValues}
          validationSchema={questionSchema}
          enableReinitialize
          onSubmit={(values, helpers) => {
            onSubmit(values);
            if (mode === "create") helpers.resetForm();
          }}
        >
          {({ submitForm, isSubmitting }) => (
            <Form className="space-y-4">
              <QuestionFormFields mode={mode} />

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="submit"
                  className="h-9 rounded-xl text-sm font-bold"
                  disabled={isSubmitting}
                  onClick={submitForm}
                >
                  {mode === "create" ? "Submit Draft" : "Save Edits"}
                </Button>
                <Button
                  type="button"
                  variant="cancel"
                  className="h-9 rounded-xl text-sm font-bold"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
