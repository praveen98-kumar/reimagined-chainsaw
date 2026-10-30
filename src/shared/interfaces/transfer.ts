export type TransferType = "seva" | "location";

export interface TransferSevadar {
  id: number;
  name: string;
  avatar?: string;
  relation: string;
  guardian_name: string;
  mobile_no: string;
  district: string;
  state: string;
  tehsil?: string;
  created_at: string;
}
