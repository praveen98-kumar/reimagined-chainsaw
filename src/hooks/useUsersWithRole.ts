import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import apiClient from "@/http/index";
import type { ApiResponse } from "@/shared/interfaces/api";

interface UserWithRole {
  id: number;
  name: string;
  mobile_no: string;
  disciple_id: number;
  relation: string;
  team_leader_id: number | null;
  guardian_name: string;
  satnam_date: string | null;
  sarnam_date: string | null;
  sarshabd_date: string | null;
}
interface UserWithRoleResponse
  extends ApiResponse<{ data: UserWithRole[]; total: number }> {}
export const useUsersWithRole = (
  roleId: number,
  locationParams?: {
    tehsilId?: number;
    districtId?: number;
    mobileNo?: string;
    teamLeaderId?: number;
  },
  options?: Record<string, unknown>
) => {
  if (locationParams?.mobileNo) {
    delete locationParams.districtId;
    delete locationParams.tehsilId;
  }
  if (
    locationParams?.mobileNo ||
    locationParams?.tehsilId ||
    locationParams?.districtId ||
    locationParams?.teamLeaderId === 0
  ) {
    delete locationParams.teamLeaderId;
  }

  return useQuery({
    queryKey: [
      "users_with_role",
      roleId,
      locationParams?.districtId,
      locationParams?.tehsilId,
      locationParams?.mobileNo,
      locationParams?.teamLeaderId,
    ],

    queryFn: async () => {
      const response = await apiClient.get<UserWithRoleResponse>(
        "users_with_role",
        {
          params: {
            limit: 0,
            role_id: roleId,
            ...(locationParams?.tehsilId && {
              tehsil_id: locationParams?.tehsilId,
            }),
            ...(locationParams?.districtId && {
              district_id: locationParams?.districtId,
            }),
            ...(locationParams?.teamLeaderId && {
              team_leader_id: locationParams?.teamLeaderId,
            }),
            ...(locationParams?.mobileNo && {
              mobile_no: `+91${locationParams?.mobileNo}`,
            }),
          },
        }
      );
      return response.data.data.data;
    },
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

const PAGINATION_LIMIT = 10;

export const getDisciples = async ({
  pageParam,
  ...rest
}: { pageParam: number } & Record<string, unknown>) => {
  const { data } = await apiClient.get<UserWithRoleResponse>(
    "users_with_role",
    {
      params: {
        page: pageParam,
        limit: PAGINATION_LIMIT,
        ...rest,
      },
    }
  );
  const responseData = data.data.data;
  const hasMorePage = data.data.total > pageParam * PAGINATION_LIMIT;
  return {
    data: responseData,
    nextPage: hasMorePage ? pageParam + 1 : undefined,
  };
};

export const useUsersWithRoleListQuery = (
  filters: Record<string, unknown>,
  options?: Record<string, unknown>
) => {
  return useInfiniteQuery({
    initialPageParam: 1,
    queryKey: ["users_with_role_list", filters],
    queryFn: ({ pageParam }) => getDisciples({ pageParam, ...filters }),
    getNextPageParam: (lastPage) => {
      return lastPage.nextPage ?? undefined;
    },
    enabled: false,
    placeholderData: keepPreviousData,
    ...options,
  });
};
