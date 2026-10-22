import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import apiClient from "@/http";

type Input = Record<string, unknown>;
type Response = unknown;

async function allotRoles(payload: Input): Promise<Response> {
  const { data } = await apiClient.post("allot_roles", payload);
  return data;
}

export function useAllotRoles(
  options?: UseMutationOptions<Response, Error, Input>,
) {
  return useMutation({
    mutationFn: allotRoles,
    ...options,
  });
}
