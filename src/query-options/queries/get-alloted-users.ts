import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import apiClient from "@/http/index";

const PAGINATION_LIMIT = 10;
const getUsers = async ({
  pageParam,
  ...params
}: { pageParam: number } & Record<string, unknown>) => {
  const { data } = await apiClient.get("allot_roles_users", {
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

export function useGetAllotRoleUsers(
  params?: Record<string, unknown>,
  options?: Record<string, unknown>,
) {
  return useInfiniteQuery({
    initialPageParam: 1,
    enabled: false,
    queryKey: ["allot_roles_users", params],
    queryFn: ({ pageParam }) => getUsers({ pageParam, ...params }),
    getNextPageParam: (lastPage) => {
      return lastPage.nextPage ?? undefined;
    },
    placeholderData: keepPreviousData,
    ...options,
  });
}
