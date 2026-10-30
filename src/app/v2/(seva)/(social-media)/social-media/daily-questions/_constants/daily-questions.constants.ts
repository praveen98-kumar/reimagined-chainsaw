import type { Question } from "../../manage-questions/_types/manage-questions.types";

const DEFAULT_ACTIONS: Question["actions"] = {
  post: { enabled: true, answerType: "numeric" },
  like: { enabled: true, answerType: "checkbox" },
  comment: { enabled: true, answerType: "numeric" },
  share: { enabled: true, answerType: "checkbox" },
};

export const DAILY_QUESTIONS: Question[] = [
  {
    id: "dq-1",
    platform: "facebook",
    title:
      "किसान रत्न सम्मान समारोह से संबंधित सभी न्यूज़ वीडियो पर Like, Comment, Share करें।",
    actions: DEFAULT_ACTIONS,
    questionType: "permanent",
    stateIds: [],
    schedule: { enabled: true, date: "2026-03-20", time: "11:00" },
    status: "published",
    createdAt: "2026-03-20",
  },
  {
    id: "dq-2",
    platform: "facebook",
    title:
      "किसान रत्न सम्मान समारोह से संबंधित सभी न्यूज़ वीडियो पर Like, Comment, Share करें।",
    actions: DEFAULT_ACTIONS,
    questionType: "permanent",
    stateIds: [],
    schedule: { enabled: true, date: "2026-03-20", time: "09:00" },
    status: "published",
    createdAt: "2026-03-20",
  },
  {
    id: "dq-3",
    platform: "facebook",
    title:
      "508वा परमेश्वर कबीर जी निर्वाण दिवस । दहेज मुक्त विवाह (रमैणी) । सतलोक आश्रम धवलपुरी",
    actions: DEFAULT_ACTIONS,
    questionType: "temporary",
    stateIds: [5],
    schedule: { enabled: true, date: "2026-03-20", time: "07:00" },
    status: "published",
    createdAt: "2026-03-20",
  },
  {
    id: "dq-4",
    platform: "facebook",
    title:
      "अन्नपूर्णा मुद्दे । EP-1733 । पिल्लूखेड़ा मंडी, जींद, हरियाणा - SANIYA Haryana",
    actions: DEFAULT_ACTIONS,
    questionType: "temporary",
    stateIds: [2],
    schedule: { enabled: true, date: "2026-03-20", time: "07:30" },
    status: "published",
    createdAt: "2026-03-20",
  },
];
