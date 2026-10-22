import { BOOK_ORDER_STATUS } from "./app";

export interface OrderIn {
  id: number;
  name: string;
  message: string;
  mobile_no: string;
  pincode: string;
  book_name: string;
  book_lang: string;
  order_at: string;
  order_allotted_at: string;
  delivered_at: string;
  created_at: string;
  book_order_status: BOOK_ORDER_STATUS;
  reason: string;
  allocated_to_name: string;
  response_by_name: string;
  tehsil_id: number;
  [k: string]: string | number;
}

export interface ByPost {
  id: number;
  name: string;
  message: string;
  mobile_no: string;
  created_at: string;
  pincode: string;
  book_name: string;
  book_lang: string;
  order_at: string;
  order_allotted_at: string;
  delivered_at: string;
  book_order_status: BOOK_ORDER_STATUS;
  reason: string;
  allocated_to_name: string;
  tracking_id: string;
  response_at: string;
  response_by_name: string;
  tehsil_id: number;
  [k: string]: string | number;
}
