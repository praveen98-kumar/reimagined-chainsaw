export interface Call {
  id: number;
  order_id: number;
  name: string;
  message: string;
  mobile_no: string;
  pincode: string;
  created_at: string;
  order_status: string;
  book_name: string;
  book_lang: string;
  country_id: string;
  state_id: string;
  district_id: string;
  tehsil_id: string;
  order_at: string;
  order_allotted_at: string;
  delivered_at: string;
  calling_seva_status: string;
  calling_allotted_at: string;
  calling_response_at: string;
  jyada_ruchi_allotted_at: string;
  status: string;
  response_at: string;
  not_on_wa: boolean;
  satgyan_link_sent: boolean;
  reason: string;
  alt_mobile_no?: string;
  new_mobile_no?: string;
}

export interface RuchiCall extends Call {
  history: {
    created_at: string;
    status: string;
    remark: string | null;
    form_no: string;
  }[];
  accepted_by: string;
  response_by: string;
}

export interface MissCall extends Call {
  status_int?: number;
  order_id: any;
  allocated_to: any;
  response_by: any;
  allocation_date: string;
}

export interface NamdanCenter {
  address: string | null;
  alt_mobile_no: string | null;
  city_name: string | null;
  country_name: string | null;
  district_name: string | null;
  maps_link: string | null;
  mobile_no: string | null;
  name: string | null;
  pincode: string | null;
  state_name: string | null;
  tehsil_name: string | null;
  tehsil_name1: string | null;
}
