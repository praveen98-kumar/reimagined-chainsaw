import React from "react";

export interface ISevaList {
  href: string;
  Icon: React.ReactNode;
  title: string;
  subtitle?: string;
  count?: number;
  permission: string;
}

export interface Order {
  id: number;
  message: string;
  created_by: string;
  created_at: string;
  emergency: boolean;
  allocated_to: string;
  allocation_date: string;
  status: string;
  response_at: string;
  response_by: string;
  calling_alloted_to: string;
  calling_allocation_date: string;
  jr_alloted_to: string;
  jr_allocation_date: string;
  jr_detail: string;
}

export interface TopSevadars {
  tehsil_seva: Array<object>;
  district_seva: Array<object>;
}

export interface RoleSwitch {
  group: string;
  roles: number[];
}

export interface UserInfo {
  id: number;
  name: string;
}

export interface Duplicate {
  id: number;
  message: string;
  mobile_no: string;
  alloted_to: UserInfo | null;
  allocation_date: string;
  status: string;
  created_at: string;
  created_by: UserInfo;
  status_int: number;
}

export interface BaseOrder {
  created_by: UserInfo;
  mobile_no: string;
  allocated_to: UserInfo;
  allocation_date: string;
  status: string;
  message: string;
  alt_mobile_no: string;
  response_by: UserInfo;
  created_at: string;
  id: number;
  duplicates: [Duplicate];
  response_at: string;
  order_allotted_at: string;
}

export interface Ramaini {
  id: number;
  groom_full_name: string;
  bride_full_name: string;
  groom_mobile_no: string;
  bride_mobile_no: string;
  bride_wedding_date: string;
  created_at: string;
}
