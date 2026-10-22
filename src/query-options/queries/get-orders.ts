import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import apiClient from "@/http/index";

const PAGINATION_LIMIT = 10;
const getOrders = async ({
  pageParam,
  ...params
}: { pageParam: number } & Record<string, unknown>) => {
  const { data } = await apiClient.get("orders", {
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

export function useGetOrdersList(
  params?: Record<string, unknown>,
  options?: Record<string, unknown>,
) {
  return useInfiniteQuery({
    initialPageParam: 1,
    queryKey: ["orders", JSON.stringify(params)],
    enabled: false,
    queryFn: ({ pageParam }) => getOrders({ pageParam, ...params }),
    getNextPageParam: (lastPage) => {
      return lastPage.nextPage ?? undefined;
    },
    placeholderData: keepPreviousData,
    ...options,
  });
}
