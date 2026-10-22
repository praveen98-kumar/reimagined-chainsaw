import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import apiClient from "@/http/index";

const PAGINATION_LIMIT = 10;
const getDisciples = async ({
  pageParam,
  ...params
}: { pageParam: number } & Record<string, unknown>) => {
  const { data } = await apiClient.get("disciples", {
    params: {
      page: pageParam,
      limit: PAGINATION_LIMIT,
      ...params,
    },
  });
  const responseData = data.data.result;
  const hasMorePage = data.data.total > pageParam * PAGINATION_LIMIT;
  return {
    data: responseData,
    nextPage: hasMorePage ? pageParam + 1 : undefined,
  };
};

const getDisciplesWithRoles = async ({
  pageParam,
  ...params
}: { pageParam: number } & Record<string, unknown>) => {
  const { data } = await apiClient.get("disciple_with_role", {
    params: {
      page: pageParam,
      limit: PAGINATION_LIMIT,
      ...params,
    },
  });
  const responseData = data.data.data;
  const hasMorePage = data.data.total > pageParam * PAGINATION_LIMIT;
  return {
    data: responseData,
    nextPage: hasMorePage ? pageParam + 1 : undefined,
  };
};

export function useGetDisciples(
  params?: Record<string, unknown>,
  options?: Record<string, unknown>,
) {
  return useInfiniteQuery({
    initialPageParam: 1,
    queryKey: ["disciples", params],
    enabled: false,
    queryFn: ({ pageParam }) => getDisciples({ pageParam, ...params }),
    getNextPageParam: (lastPage) => {
      return lastPage.nextPage ?? undefined;
    },
    placeholderData: keepPreviousData,
    ...options,
  });
}
export function useGetDisciplesWithRole(
  params?: Record<string, unknown>,
  options?: Record<string, unknown>,
) {
  return useInfiniteQuery({
    initialPageParam: 1,
    queryKey: ["disciples_with_role", params],
    enabled: false,
    queryFn: ({ pageParam }) => getDisciplesWithRoles({ pageParam, ...params }),
    getNextPageParam: (lastPage) => {
      return lastPage.nextPage ?? undefined;
    },
    placeholderData: keepPreviousData,
    ...options,
  });
}
