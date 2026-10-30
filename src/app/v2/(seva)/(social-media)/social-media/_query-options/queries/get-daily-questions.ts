import { queryOptions, useQuery } from "@tanstack/react-query";

import apiClient from "@/http";

export interface Response {
  success: boolean
  message: string
  data: Question[]
}

export interface Question {
  id: number
  question_type: string
  question: string
  short_name: string
  options: any
  is_common: boolean
  state_id: number
  active: boolean
  icon: string
  topic: string
  priority?: number
  seva_type: any
  created_at: string
  created_by: number
  added: boolean
}

export async function getSocialMediaDailyQuestions(
  params: { state_id: number },
): Promise<Question[]> {
  try {
    const { data } = await apiClient.get<Response>("social_media_question_sub", {
      params: {
        state_id: params.state_id,
        for_add: 1,
      },
    });
    return data?.data;
  } catch (_e: unknown) {
    return []
  }
}

export const useSocialMediaDailyQuestionQueryOptions = (params: { state_id: number }, options?: Record<string,unknown>) => queryOptions({
  queryKey: ["social_media_question_sub", params.state_id],
  queryFn: () => getSocialMediaDailyQuestions(params),
  ...options
})

export const useSocialMediaDailyQuestion = (params: { state_id: number }, options?: Record<string,unknown>) => useQuery(useSocialMediaDailyQuestionQueryOptions(params, options))
