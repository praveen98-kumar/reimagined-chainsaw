import { queryOptions, useQuery } from "@tanstack/react-query";

import apiClient from "@/http";

export interface Response {
  success: boolean;
  message: string;
  data: QuestionData;
}

export interface QuestionData {
  questions: Question[];
  answers: any[];
}

export interface Question {
  id: number;
  question: string;
  short_name: string;
  icon: string;
  question_type: string;
  is_common: boolean;
  options: any[];
  topic: string;
  priority: number;
  seva_type: string;
}

export interface SocialMediaSevaParams {
  user_role_id?: number;
}

export async function getSocialMediaSeva(
  params: SocialMediaSevaParams = {},
): Promise<QuestionData> {
  try {
    const { data } = await apiClient.get<Response>("social_media_seva", {
      headers:
        params.user_role_id !== undefined
          ? { user_role_id: params.user_role_id }
          : undefined,
    });
    return data?.data;
  } catch (_e: unknown) {
    throw new Error("unable to fetch");
  }
}

export const useSocialMediaQueryOptions = (
  params: SocialMediaSevaParams = {},
  options: Record<string, unknown> = {},
) =>
  queryOptions({
    queryKey: ["social_media_seva", params.user_role_id ?? null],
    queryFn: () => getSocialMediaSeva(params),
    enabled: params.user_role_id !== undefined,
    ...options,
  });

export const useSocialMediaQuery = (
  params: SocialMediaSevaParams = {},
  options: Record<string, unknown> = {},
) => useQuery(useSocialMediaQueryOptions(params, options));
