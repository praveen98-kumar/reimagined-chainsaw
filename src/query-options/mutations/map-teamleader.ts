import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import apiClient from "@/http";

type Input = {
  mode: "add" | "remove";
  sevadar_ids: number[];
  leader_id: number;
};
type Response = unknown;

async function addOrRemoveTeamLeader(payload: Input): Promise<Response> {
  const { data } = await apiClient.post("sm_seva_team_map", payload);
  return data;
}

export function useMapTeamLeaderMutation(
  options?: UseMutationOptions<Response, Error, Input>,
) {
  return useMutation({
    mutationFn: addOrRemoveTeamLeader,
    ...options,
  });
}
