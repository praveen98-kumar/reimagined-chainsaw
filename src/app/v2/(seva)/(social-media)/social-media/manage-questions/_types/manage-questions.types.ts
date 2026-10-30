export type ActionKey = "post" | "like" | "comment" | "share";

export type AnswerType = "numeric" | "checkbox";

export type QuestionStatus = "draft" | "published" | "history";

export type QuestionType = "permanent" | "temporary";

export interface QuestionAction {
  enabled: boolean;
  answerType: AnswerType | null;
}

export interface QuestionSchedule {
  enabled: boolean;
  date: string | null;
  time: string | null;
}

export interface Question {
  id: string;
  platform: string;
  title: string;
  actions: Record<ActionKey, QuestionAction>;
  questionType: QuestionType;
  stateIds: number[];
  schedule: QuestionSchedule;
  status: QuestionStatus;
  createdAt: string;
}

export interface QuestionFormValues {
  platform: string;
  actions: Record<ActionKey, QuestionAction>;
  title: string;
  questionType: QuestionType;
  stateIds: number[];
  scheduleEnabled: boolean;
  scheduleDate: Date | null;
  scheduleTime: string | null;
}

export type QuestionTab = "create" | "drafts" | "published" | "history";
