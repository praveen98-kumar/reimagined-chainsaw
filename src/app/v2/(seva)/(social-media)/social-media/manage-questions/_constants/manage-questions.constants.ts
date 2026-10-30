import { socialImages3d, socialMediaActionImages } from "@/constants/images";
import type { ActionKey } from "../_types/manage-questions.types";

export const ACTION_ORDER: ActionKey[] = ["post", "like", "comment", "share"];

export const ACTION_META: Record<ActionKey, { label: string; icon: string }> = {
  post: { label: "Post", icon: socialMediaActionImages.post },
  like: { label: "Like", icon: socialMediaActionImages.like },
  comment: { label: "Comment", icon: socialMediaActionImages.comment },
  share: { label: "Share", icon: socialMediaActionImages.share },
};

export const ANSWER_TYPE_OPTIONS = [
  { label: "Numeric", value: "numeric" },
  { label: "Checkbox", value: "checkbox" },
] as const;

export const ANSWER_TYPE_LABEL: Record<string, string> = {
  numeric: "Numeric",
  checkbox: "Checkbox",
};

export const QUESTION_TYPE_OPTIONS = [
  { label: "Permanent", value: "permanent" },
  { label: "Temporary", value: "temporary" },
] as const;

const PLATFORM_LABELS: Record<string, string> = {
  facebook: "Facebook",
  twitter: "Twitter / X",
  google: "Google",
  common: "Common",
  koo: "Koo",
  linkedin: "LinkedIn",
  linked: "LinkedIn",
  youtube: "YouTube",
  tumblr: "Tumblr",
  pinterest: "Pinterest",
  reddit: "Reddit",
  threads: "Threads",
  instagram: "Instagram",
  ycs: "YCS",
  yss: "YSS",
  sharechat: "ShareChat",
  dailyhunt: "Dailyhunt",
  whatsapp: "WhatsApp",
};

export interface PlatformOption {
  value: string;
  label: string;
  icon: string;
}

export const PLATFORM_OPTIONS: PlatformOption[] = Object.entries(
  socialImages3d,
).map(([value, icon]) => ({
  value,
  label: PLATFORM_LABELS[value] ?? value,
  icon,
}));

export const PLATFORM_OPTIONS_BY_VALUE: Record<string, PlatformOption> =
  Object.fromEntries(PLATFORM_OPTIONS.map((option) => [option.value, option]));

export const MOCK_STATES: { value: number; label: string }[] = [
  { value: 1, label: "Punjab" },
  { value: 2, label: "Haryana" },
  { value: 3, label: "Delhi" },
  { value: 4, label: "Uttar Pradesh" },
  { value: 5, label: "Maharashtra" },
  { value: 6, label: "Gujarat" },
  { value: 7, label: "Rajasthan" },
  { value: 8, label: "Karnataka" },
];

export const STATE_LABELS_BY_VALUE: Record<number, string> = Object.fromEntries(
  MOCK_STATES.map((state) => [state.value, state.label]),
);
