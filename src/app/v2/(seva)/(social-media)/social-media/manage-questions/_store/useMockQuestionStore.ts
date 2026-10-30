import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { ACTION_ORDER } from "../_constants/manage-questions.constants";
import type {
  ActionKey,
  AnswerType,
  Question,
  QuestionAction,
  QuestionStatus,
} from "../_types/manage-questions.types";

function buildActions(
  enabled: Partial<Record<ActionKey, AnswerType>>,
): Record<ActionKey, QuestionAction> {
  return ACTION_ORDER.reduce(
    (acc, key) => {
      const answerType = enabled[key] ?? null;
      acc[key] = { enabled: answerType !== null, answerType };
      return acc;
    },
    {} as Record<ActionKey, QuestionAction>,
  );
}

const SEED_QUESTIONS: Question[] = [
  {
    id: "q-1",
    platform: "facebook",
    title: "How many posts did you share today?",
    actions: buildActions({ post: "numeric", like: "checkbox" }),
    questionType: "permanent",
    stateIds: [],
    schedule: { enabled: false, date: null, time: null },
    status: "draft",
    createdAt: "2026-03-10",
  },
  {
    id: "q-2",
    platform: "instagram",
    title: "Did you comment on the daily satsang reel?",
    actions: buildActions({ comment: "checkbox" }),
    questionType: "temporary",
    stateIds: [1, 3],
    schedule: { enabled: true, date: "2026-03-21", time: "11:00" },
    status: "draft",
    createdAt: "2026-03-12",
  },
  {
    id: "q-3",
    platform: "whatsapp",
    title: "How many groups did you share the message with?",
    actions: buildActions({ share: "numeric" }),
    questionType: "permanent",
    stateIds: [],
    schedule: { enabled: false, date: null, time: null },
    status: "published",
    createdAt: "2026-03-14",
  },
  {
    id: "q-4",
    platform: "youtube",
    title: "Did you like and comment on the latest video?",
    actions: buildActions({ like: "checkbox", comment: "checkbox" }),
    questionType: "temporary",
    stateIds: [5],
    schedule: { enabled: true, date: "2026-03-22", time: "18:00" },
    status: "published",
    createdAt: "2026-03-15",
  },
  {
    id: "q-5",
    platform: "twitter",
    title: "How many reposts were made from your account?",
    actions: buildActions({ post: "numeric" }),
    questionType: "permanent",
    stateIds: [],
    schedule: { enabled: false, date: null, time: null },
    status: "history",
    createdAt: "2026-02-28",
  },
];

interface MockQuestionActions {
  addQuestion: (question: Question) => void;
  updateQuestion: (id: string, question: Question) => void;
  removeQuestion: (id: string) => void;
  publishQuestion: (id: string) => void;
}

interface MockQuestionState {
  questions: Question[];
  actions: MockQuestionActions;
}

export const createQuestionId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `q-${Date.now()}`;

export const useMockQuestionStore = create<MockQuestionState>()((set) => ({
  questions: SEED_QUESTIONS,
  actions: {
    addQuestion: (question) =>
      set((state) => ({ questions: [question, ...state.questions] })),
    updateQuestion: (id, question) =>
      set((state) => ({
        questions: state.questions.map((item) =>
          item.id === id ? question : item,
        ),
      })),
    removeQuestion: (id) =>
      set((state) => ({
        questions: state.questions.filter((item) => item.id !== id),
      })),
    publishQuestion: (id) =>
      set((state) => ({
        questions: state.questions.map((item) =>
          item.id === id
            ? { ...item, status: "published" as QuestionStatus }
            : item,
        ),
      })),
  },
}));

export const useQuestionsByStatus = (status: QuestionStatus) =>
  useMockQuestionStore(
    useShallow((state) => state.questions.filter((q) => q.status === status)),
  );
