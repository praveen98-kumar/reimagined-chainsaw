import { Option } from "@/shared/interfaces/option";

export const regionToRegioIDLable = {
  country: "country_id",
  state: "state_id",
  division: "division_id",
  district: "district_id",
  tehsil: "tehsil_id",
  city: "city_id",
} as const;
export const regionHirarchy = [
  "ashram",
  "country",
  "state",
  "division",
  "district",
  "tehsil",
] as const;

export const regionHirarchyMap = {
  ashram: 0,
  country: 1,
  state: 2,
  division: 3,
  district: 4,
  tehsil: 5,
} as const;
export type RoleRegion = keyof typeof regionHirarchyMap;

export const regionHirarchyIndex = (str: string) =>
  regionHirarchy.findIndex((i) => i === str);

export const downloadPageParams: Record<
  string,
  {
    showTab: boolean;
    heading: string;
    url: string;
    showLocationFilters?: boolean;
    params?: object;
    showInternational?: boolean;
    downloadFileName?: string;
  }
> = {
  download_jyada_ruchi_list: {
    showTab: false,
    heading: "download_jyada_ruchi_list",
    showLocationFilters: true,
    downloadFileName: "RUCHI-LIST-",
    url: "download_jyada_ruchi_list",
  },
  download_incorrect_list: {
    showTab: false,
    heading: "download_incorrect_list",
    showLocationFilters: true,
    downloadFileName: "INCORRECT-LIST-",
    url: "download_incorrect_list",
  },
  download_missedcall_list: {
    showTab: false,
    heading: "download_missedcall_list",
    showLocationFilters: true,
    downloadFileName: "MISSCALL-",
    url: "download_missedcall_list",
  },
  download_duplicate_orders: {
    showTab: false,
    heading: "download_duplicate_orders",
    showLocationFilters: true,
    downloadFileName: "DUPLICATE-ORDERS-",
    url: "download_duplicate_orders",
  },
  download_calling_orders: {
    showTab: false,
    heading: "download_calling_orders",
    showLocationFilters: true,
    downloadFileName: "CALLING-ORDERS-",
    url: "download_calling_orders",
  },
  download_national_orders: {
    showTab: false,
    heading: "download_national_orders",
    showLocationFilters: false,
    downloadFileName: "National-Orders-",
    url: "download_orders",
  },
  download_international_orders: {
    showTab: false,
    heading: "download_international_orders",
    showLocationFilters: true,
    downloadFileName: "INTL-ORDERS-",
    url: "download_orders",
    showInternational: true,
  },
  download_incomplete_orders: {
    showTab: false,
    heading: "download_incomplete_orders",
    showLocationFilters: false,
    downloadFileName: "INCOMPLETE-ORDERS-",
    url: "download_orders",
  },
  download_postal_orders: {
    showTab: true,
    heading: "download_postal_orders",
    showLocationFilters: true,
    downloadFileName: "POSTAL-ORDERS-",
    url: "post_orders_download",
  },
  download_book_complain: {
    showTab: false,
    heading: "download_book_complain",
    showLocationFilters: true,
    downloadFileName: "Book-Order-Complain-",
    url: "download_orders",
  },
  download_s_incomplete_calling: {
    showTab: false,
    heading: "download_south_calling",
    showLocationFilters: true,
    downloadFileName: "South-Calling-",
    url: "download_incorrect_list",
  },
};

export const uploadFilePageParams: Record<
  string,
  {
    showTab: boolean;
    heading: string;
    url: string;
    file_name: string;
    sample?: string;
  }
> = {
  upload_book_calling: {
    showTab: false,
    heading: "कॉलिंग सूची अपलोड करें",
    url: "order_import",
    file_name: "order_file",
    sample: "/sample_files/order_template.xlsx",
  },
  upload_incorrect_messages: {
    showTab: false,
    heading: "कॉलिंग सूची अपलोड करें",
    url: "incomplete_import",
    file_name: "incomplete_file",
    sample: "/sample_files/order_template.xlsx",
  },
  upload_miss_calling: {
    showTab: false,
    heading: "कॉलिंग सूची अपलोड करें",
    url: "miss_call_import",
    file_name: "miss_call_file",
    sample: "/sample_files/order_template.xlsx",
  },
  upload_jyada_ruchi: {
    showTab: false,
    heading: "कॉलिंग सूची अपलोड करें",
    url: "jyada_ruchi_import",
    file_name: "jyada_ruchi_file",
    sample: "/sample_files/jyada_ruchi_template.xlsx",
  },
};

export const reportTableParam: Record<
  string,
  {
    header: string[];
    body: string[];
    url: string;
    downloadUrl?: string;
    permission?: string;
    excelExportPermission?: string;
  }
> = {
  book_calling_report: {
    header: [
      "allot_pending",
      "seva_pending",
      "book_not_receive1",
      "interested",
      "ok",
      "link_send",
      "not_on_whatsapp",
      "namdan_taken",
      "not_interested",
      "mobile_no_issue",
      "duplicate",
    ],
    url: "book_calling_reports",
    downloadUrl: "download_book_calling_reports",
    body: [
      "allot_pending",
      "pending_seva",
      "book_not_receive",
      "jyada_ruchi",
      "ok",
      "satgyan_link_sent",
      "not_on_whatsapp",
      "got_initiation",
      "not_interested",
      "mobile_no_issue",
      "duplicate",
    ],
    permission: "book_calling_seva_reports_pdf",
  },
  namdan_calling_reports: {
    header: [
      "Pending In",
      "Pending Out",
      "Namdan Taken",
      "Namdan Not Taken",
      "Discussion",
    ],
    url: "namdan_calling_reports",
    downloadUrl: "download_namdan_calling_reports",
    body: [
      "pending_in",
      "pending_seva",
      "namdan_taken",
      "namdan_not_taken",
      "discussion",
    ],
    permission: "namdan_calling_reports_pdf",
  },
  jyada_ruchi_calling_report: {
    header: [
      "In Pending",
      "Out Pending",
      "Will Confirm Later",
      "Issues with Rules",
      "Come In Satsang",
      "Interested For Namdan",
      "Namdan Taken",
      "Not Interested",
    ],
    url: "jyada_ruchi_reports",
    downloadUrl: "download_jyada_ruchi_reports",
    body: [
      "allot_pending",
      "pending_seva",
      "will_confirm_later",
      "issue_with_rule",
      "come_in_satsang",
      "interested",
      "got_initiation",
      "not_interested",
    ],
    permission: "book_calling_seva_reports_pdf",
  },
  miss_calling_report: {
    header: [
      "Want Book",
      "Interested For Namdan",
      "Duplicate",
      "Namdan Taken",
      "Not Interested",
      "Out Of Reach",
    ],
    url: "miss_call_reports",
    body: [
      "want_book",
      "interested",
      "duplicate",
      "got_initiation",
      "not_interested",
      "out_of_reach",
    ],
    permission: "book_calling_seva_reports_pdf",
  },
  incorrect_message_report: {
    header: [
      "Sevadar Pending",
      "Details Updated",
      "Not Interested",
      "Out Of Reach",
    ],
    url: "incomplete_order_reports",
    body: ["sevadar_pending", "want_book", "not_interested", "out_of_reach"],
    permission: "book_calling_seva_reports_pdf",
  },
  s_incomplete_calling_report: {
    header: ["allot_pending", "seva_pending", "Completed", "not_interested"],
    url: "s_incomplete_calling_report",
    body: ["allot_pending", "sevadar_pending", "completed", "not_interested"],
    permission: "book_calling_seva_reports_pdf",
  },
  duplicate_order_report: {
    header: ["Order Updated", "Order Rejected"],
    url: "duplicate_order_reports",
    body: ["accept", "reject"],
    permission: "book_calling_seva_reports_pdf",
  },
  book_order_report: {
    header: ["National", "International"],
    url: "order_reports",
    downloadUrl: "download_order_report",
    body: ["national", "international"],
    permission: "order_seva_reports_export_pdf",
    excelExportPermission: "order_seva_reports_export_excel",
  },
  book_order_delivery_report: {
    header: [
      "Pending In",
      // "Total Out",
      "Pending Out",
      "Delivered",
      "Duplicate",
      "Fake Orders",
    ],
    url: "book_delivery_reports_new",
    downloadUrl: "download_book_delivery_reports",
    body: [
      "pending_in",
      // "total_out",
      "pending_out",
      "delivered",
      "duplicated",
      "wrong_order",
    ],
    permission: "book_delivery_reports_pdf",
  },
  social_media_report: {
    header: ["Contact", "Total", "Pending", "Done", "Percentage"],
    url: "social_media_pending_report_region_wise",
    downloadUrl: "download_social_media_seva_report",
    body: ["contact", "total_sevadar", "pending", "total_sum", "percentage"],
    permission: "social_media_seva_reports_pdf",
    excelExportPermission: "social_media_seva_reports_excel",
  },
  ramaini_seva_report: {
    header: [
      "Pending",
      "Complete",
      "First Verified",
      "Second Verified",
      "First Reject",
      "Second Reject",
    ],
    url: "ramaini_seva_report",
    downloadUrl: "ramaini_seva_report",
    body: [
      "pending",
      "complete",
      "first_verified",
      "second_verified",
      "first_reject",
      "second_reject",
    ],
    permission: "ramaini_seva_reports_pdf",
  },
};

export const sevaAllot: Record<
  string,
  {
    url: string;
    sevaType: string;
    countKey: string;
    pendingKey: string;
  }
> = {
  book_calling: {
    url: "calling",
    sevaType: "book_calling",
    countKey: "bookCallingCounts",
    pendingKey: "allot_pending",
  },
  duplicate_order: {
    url: "duplicate_orders",
    sevaType: "duplicate_order",
    countKey: "duplicateCounts",
    pendingKey: "pending_in",
  },
  miss_call: {
    url: "miss_call",
    sevaType: "miss_call",
    countKey: "missCallCounts",
    pendingKey: "pending_in",
  },
  incomplete_message: {
    url: "incorrect_orders",
    sevaType: "incomplete_message",
    countKey: "incorrectCounts",
    pendingKey: "pending_in",
  },
  s_incomplete_calling: {
    url: "incorrect_orders",
    sevaType: "s_incomplete_calling",
    countKey: "incorrectCounts",
    pendingKey: "pending_in",
  },
};

export const defaultCountries: Array<Option> = [
  { label: "India", value: 2 },
  { label: "Dummy Country 1", value: 238 },
];

export const defaultRamainiCountries: Array<Option> = [
  { label: "India", value: 2 },
  { label: "Nepal", value: 156 },
];
