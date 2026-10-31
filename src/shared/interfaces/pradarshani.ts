import type { ApiResponse } from "./api";

export interface FeedbackRow {
  id: number;
  name: string;
  country_id: number;
  state_id: number;
  district_id: number;
  locality: string | null;
  mobile_no: string;
  whatsapp_no: string | null;
  rating: number;
  remark: string;
  created_at: string | null;
  updated_at: string | null;
  namdan_center_name: string;
  country: { name: string } | null;
  state: { name: string } | null;
  district: { name: string } | null;
  created_user: { disciple: { name: string } } | null;
}

export interface FeedbackListData {
  feedback_list: FeedbackRow[];
  total: number;
}

export interface FeedbackListResponse extends ApiResponse<FeedbackListData> {}

export interface FeedbackFormValues {
  name: string;
  country_id: number | null;
  state_id: number | null;
  district_id: number | null;
  locality?: string;
  mobile_no: string;
  whatsapp_no?: string;
  rating: number;
  remark: string;
  is_bhagat: number | null;
}

export interface FeedbackListFilters {
  response_type?: "list" | "csv";
  country_id?: number;
  state_id?: number;
  district_id?: number;
  mobile_no?: string;
  namdan_center_id?: number;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface PradarshaniSevaCountData {
  total_count: number;
}

export interface PradarshaniSevaCountResponse extends ApiResponse<PradarshaniSevaCountData> {}

export interface PradarshaniReportFilters {
  country_id?: number;
  state_id?: number;
  namdan_center_id?: number;
  start_date?: string;
  end_date?: string;
  report_type?: string;
}

export interface PradarshaniReportRow {
  id: number;
  name: string;
  count: number;
}

export interface PradarshaniReportData {
  report: PradarshaniReportRow[];
}

export interface PradarshaniReportResponse extends ApiResponse<PradarshaniReportData> {}
