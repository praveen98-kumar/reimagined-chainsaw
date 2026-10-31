export interface User {
  id: number;
  token: string;
  disciple_id: number;
  is_user_exit: boolean;
  status: string;
  active_role?: number;
  pending_seva?: number;
  permission: Permission[];
  role_level: RoleLevel[];
  is_pin_set: boolean;
  disciple: Disciple;
  mobile_no: string;
}

export interface Permission {
  role_id: number;
  level: number;
  role: string;
  permissions: string[];
  region: Region[];
  role_region: string;
}

export interface RoleLevel {
  group: string;
  roles: number[];
}

export interface GroupPermission {
  group: string;
  roles: number[];
  permissions: string[];
}

export interface Region {
  user_role_id: number;
  country_id: number;
  country_name: string;
  state_id: number;
  state_name: string;
  division_id: number;
  division_name: string;
  district_id: number;
  district_name: string;
  tehsil_id: number;
  tehsil_name: string;
  city_id: number;
  city_name: string;
  namdan_center_id: number;
  namdan_center_name: string;
}

export interface UserListParamsType {
  remove: string;
  add: string;
  allot: string;
  allotted: string;
  done: string;
}

export interface Disciple {
  avatar: string;
  guardian_name: string;
  id: number;
  mobile_no: string;
  name: string;
  relation: string;
  sarnam_date: string | null;
  sarshabd_date: string | null;
  satnam_date: string | null;
  status: string;
  created_at?: string;
  country_id?: number;
  state_id?: number;
  district_id?: number;
  tehsil_id?: number;
  district?: { name?: string };
  tehsil?: { name?: string };
  state?: { name?: string };
  country?: { name?: string };
  address?: string;
  [k: string]: unknown;
}
