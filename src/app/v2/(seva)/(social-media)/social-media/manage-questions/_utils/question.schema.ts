import * as Yup from "yup";
import { ACTION_ORDER } from "../_constants/manage-questions.constants";
import type {
  ActionKey,
  Question,
  QuestionAction,
  QuestionFormValues,
} from "../_types/manage-questions.types";
import { toDateString, toDateValue } from "./format";

export const questionSchema = Yup.object({
  platform: Yup.string().required("Platform is required"),
  title: Yup.string().trim().required("Question is required"),
});

export function emptyAction(): QuestionAction {
  return { enabled: false, answerType: null };
}

export function emptyActions(): Record<ActionKey, QuestionAction> {
  return ACTION_ORDER.reduce(
    (acc, key) => ({ ...acc, [key]: emptyAction() }),
    {} as Record<ActionKey, QuestionAction>,
  );
}

export function emptyQuestionValues(): QuestionFormValues {
  return {
    platform: "",
    actions: emptyActions(),
    title: "",
    questionType: "permanent",
    stateIds: [],
    scheduleEnabled: false,
    scheduleDate: null,
    scheduleTime: null,
  };
}

export function toFormValues(question: Question): QuestionFormValues {
  return {
    platform: question.platform,
    actions: { ...question.actions },
    title: question.title,
    questionType: question.questionType,
    stateIds: question.stateIds,
    scheduleEnabled: question.schedule.enabled,
    scheduleDate: toDateValue(question.schedule.date),
    scheduleTime: question.schedule.time,
  };
}

interface BuildQuestionContext {
  id: string;
  status: Question["status"];
  createdAt: string;
}

export function buildQuestion(
  values: QuestionFormValues,
  context: BuildQuestionContext,
): Question {
  return {
    id: context.id,
    platform: values.platform,
    title: values.title.trim(),
    actions: values.actions,
    questionType: values.questionType,
    stateIds: values.stateIds,
    schedule: {
      enabled: values.scheduleEnabled,
      date: values.scheduleEnabled ? toDateString(values.scheduleDate) : null,
      time: values.scheduleEnabled ? values.scheduleTime : null,
    },
    status: context.status,
    createdAt: context.createdAt,
  };
}
