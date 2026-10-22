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

export async function getSocialMediaSeva(headers = {}): Promise<QuestionData> {
  try {
    const { data } = await apiClient.get<Response>("social_media_seva", {
      headers,
    });
    return data?.data;
  } catch (_e: unknown) {
    throw new Error("unable to fetch");
  }
}

export const useSocialMediaQueryOptions = (options = {}, headers = {}) =>
  queryOptions({
    queryKey: ["social_media_seva"],
    queryFn: () => getSocialMediaSeva(headers),
    ...options,
  });

export const useSocialMediaQuery = (headers = {}) =>
  useQuery(useSocialMediaQueryOptions({}, headers));
