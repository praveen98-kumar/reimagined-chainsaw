import { ApiResponse } from "@/shared/interfaces/api";
import apiClient from ".";
import { useQuery } from "@tanstack/react-query";
import { getStates } from "@/shared/functions/location";

export interface Role {
  id: number;
  name: string;
  sequence: number;
  level: number;
  region: string;
  group: string;
}

interface RolesResponse extends ApiResponse<Array<Role>> {}

export const getRoles = async (params?: Record<string, unknown>) => {
  try {
    const { data } = await apiClient.get<RolesResponse>("roles", {
      params,
    });
    return data.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};
export const useGetRoles = (options = {}) => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: () => getRoles(),
    ...options,
  });
};

export interface RoleCreatePermission {
  id: number;
  group: string;
  creator_role_id: number;
  creator_user_id: any;
  target_role_id: number;
  all_state: boolean;
  state_ids: number[] | null;
  active: boolean;
  created_by: number;
  created_at: string;
  updated_by: any;
  updated_at: any;
}

interface RoleCreatePermissionsResponse extends ApiResponse<
  Array<RoleCreatePermission>
> {}

export const getRoleCreatePermissions = async (
  params?: Record<string, unknown>,
) => {
  try {
    const { data } = await apiClient.get<RoleCreatePermissionsResponse>(
      "role_creation_permission",
      {
        params,
      },
    );
    return data.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const useRoleCreatePermissions = (
  params?: Record<string, unknown>,
  options?: Record<string, unknown>,
) => {
  return useQuery({
    queryKey: ["role_creation_permission", params],
    queryFn: () => getRoleCreatePermissions(params),
    ...options,
  });
};

export const useGetStateOptions = (countryId: number) => {
  return useQuery({
    queryKey: ["states", countryId],
    queryFn: () => getStates(countryId),
  });
};

// export const createRoleCreatePermission = async (payload: any) => {
//     try {
//         const { data } = await apiClient.post('role_creation_permission', payload)
//     } catch (error) {
//         console.error(error)
//         throw error
//     }
// }
