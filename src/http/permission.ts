import { ApiResponse } from "@/shared/interfaces/api";
import apiClient from ".";
import { getOptionArray } from "@/shared/functions/utils";
import { useQuery } from "@tanstack/react-query";

interface PermissionGroupResponse
  extends ApiResponse<Array<{ name: string }>> {}

export const getPermissionGroup = async () => {
  try {
    const { data } = await apiClient.get<PermissionGroupResponse>(
      "permission_group"
    );
    return getOptionArray(data.data, "name", "name");
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const useGetPermissionGroup = () => {
  return useQuery({
    queryKey: ["permission_group"],
    queryFn: getPermissionGroup,
  });
};
