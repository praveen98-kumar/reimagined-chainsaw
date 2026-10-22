"use client";

import { useMemo } from "react";
import { type AuthContext, canCheck } from "@/components/v2/Can";
import { useSocialMediaSevaMutation } from "@/query-options/mutations/social-media-seva";
import { useSocialMediaQuery } from "@/query-options/queries/social-media-seva";
import { store } from "@/redux/store";
import SocialMediaUpdateForm from "./item";

export function SevaFormView() {
  const auth: AuthContext = store.getState().auth;
  const socialMediaMatch = useMemo(
    () =>
      canCheck(auth, {
        sevadarType: "social_media",
        permissions: "social_media_seva",
      }),
    [auth],
  );

  const { data } = useSocialMediaQuery(
    socialMediaMatch
      ? {
          user_role_id: socialMediaMatch.userRoleId,
        }
      : {},
  );
  const { mutate } = useSocialMediaSevaMutation(
    {},
    socialMediaMatch
      ? {
          user_role_id: socialMediaMatch.userRoleId,
        }
      : {},
  );
  const questions = useMemo(() => {
    if (data) {
      const tempQuestions = data?.questions
        .sort((a, b) => a.priority - b.priority)
        .map((q) => {
          const mappedAnswer = data.answers?.find(
            (a) => a.question_id === q.id,
          );
          return {
            ...q,
            answer:
              q.question_type === "checkbox"
                ? mappedAnswer?.answer === 1
                : q.question_type === "numeric"
                  ? Number(mappedAnswer?.answer) || 0
                  : String(mappedAnswer?.answer) || "",
          };
        });
      const commonQuestion = [];
      const stateQuestion = [];
      for (const question of tempQuestions) {
        if (question.is_common) {
          commonQuestion.push(question);
        } else {
          stateQuestion.push(question);
        }
      }

      return [...stateQuestion, ...commonQuestion];
    }
  }, [data]);

  if (!socialMediaMatch) {
    return null;
  }
  return (
    <SocialMediaUpdateForm
      //@ts-expect-error
      questions={questions || []}
      onSubmit={(data) => {
        const payload = data.map((q) => ({
          question_id: Number(q.id),
          answer:
            q.question_type === "checkbox"
              ? q.answer === true
                ? "1"
                : "0"
              : q.answer
                ? String(q.answer)
                : "0",
        }));
        mutate({ answers: payload });
      }}
    />
  );
}
