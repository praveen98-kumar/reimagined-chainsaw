import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import apiClient from "@/http";
import type { Response } from "../queries/social-media-seva";

type Input = {
  answers: {
    question_id: number;
    answer: string;
  }[];
};

async function queueSocialAnswers(
  payload: Input,
  headers = {},
): Promise<Response> {
  const { data } = await apiClient.post<Response>(
    "queue_enqueue_seva_answers",
    payload,
    {
      headers,
    },
  );
  return data;
}

export function useSocialMediaSevaMutation(
  options?: UseMutationOptions<Response, Error, Input>,
  headers = {},
) {
  return useMutation({
    mutationFn: (values) => queueSocialAnswers(values, headers),
    onSuccess: (data) => {
      toast.success(data.message);
    },
    ...options,
  });
}
