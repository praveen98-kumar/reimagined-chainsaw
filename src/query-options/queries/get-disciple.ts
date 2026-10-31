import { useQuery } from "@tanstack/react-query";
import apiClient from "@/http/index";
import type { Disciple } from "@/shared/interfaces/user";

const getDiscipleById = async (id: number) => {
  const { data } = await apiClient.get(`disciples/${id}`);
  return data.data as Disciple;
};

export function useGetDiscipleById(id?: number, options?: Record<string, unknown>) {
  return useQuery<Disciple | undefined>({
    queryKey: ["disciple", id],
    enabled: !!id,
    queryFn: () => (id ? getDiscipleById(id) : Promise.resolve(undefined)),
    ...options,
  });
}

