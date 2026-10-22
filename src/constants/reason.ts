import { getHN_Reason } from "@/shared/functions/utils";
import { Option } from "@/shared/interfaces/option";

export const wrongOrderReason: Option[] = [
  { label: "select_reason", value: "" },
  { label: "customer_not_accepted", value: "Customer Order Not Accepted" },
  {
    label: "wrong_number",
    value: "Wrong Number",
  },
];

export const mobileIssueList: Option[] = [
  // { label: getHN_Reason("Select Issue"), value: "" },
  { label: "mobile_no_issue", value: "Mobile Number Issue" },
  {
    label: "language_issue",
    value: "Language Issue",
  },
];
