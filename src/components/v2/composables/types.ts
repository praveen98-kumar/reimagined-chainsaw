import type { Option } from "@/shared/interfaces/option";
import type { Role } from "@/http/role";

export type RoleOption = Option & { regionLevel?: number };

export type LocationField =
  | "country"
  | "state"
  | "division"
  | "district"
  | "tehsil";

export interface LocationValues {
  country_id: number;
  state_id: number;
  division_id: number;
  district_id: number;
  tehsil_id: number;
}

export interface ExistingRole {
  id?: number;
  role_id: number;
  country_id?: number;
  state_id?: number;
  division_id?: number;
  district_id?: number;
  tehsil_id?: number;
  title?: string;
  role?: string;
  key?: string;
  created_by?: number;
}

export interface AllotmentPayload {
  role_id: number;
  country_id?: number;
  state_id?: number;
  division_id?: number;
  district_id?: number;
  tehsil_id?: number;
  title?: string;
  key?: string;
}

export interface UseAssignRoleOptions {
  allowedRoles?: number[];
  allowedGroups?: string[];
  enabled?: boolean;
  onError?: (message: string) => void;
}

export interface UseAssignRoleReturn {
  selectedRoleId: number | null;
  selectedRole: Role | null;
  formValues: LocationValues;
  roleOptions: RoleOption[];
  isRolesLoading: boolean;

  stateOptions: Option[];
  districtOptions: Option[];
  divisionOptions: Option[];
  tehsilOptions: Option[];

  currentUserLevel: number;
  visibleFields: LocationField[];

  checkDuplicate: (
    existingRoles: ExistingRole[],
    allottedRoles: ExistingRole[],
    field: LocationField,
    value: number,
  ) => boolean;

  handleRoleChange: (opt: Option | null) => void;
  handleCountryChange: (opt: Option | null) => void;
  handleStateChange: (opt: Option | null) => void;
  handleDistrictChange: (opt: Option | null) => void;
  handleDivisionChange: (opt: Option | null) => void;
  handleTehsilChange: (opt: Option | null) => void;

  getPayload: (
    existingRoles: ExistingRole[],
    allottedRoles: ExistingRole[],
  ) => { payload: AllotmentPayload | null; error: string | null };

  reset: () => void;
  isLocationLoading: boolean;
}
