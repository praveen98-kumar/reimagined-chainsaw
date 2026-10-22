import { Region } from "@/shared/interfaces/user";
import { Option } from "@/shared/interfaces/option";

export const getReportParams: Record<
  string,
  { keyLabel: string; valueLable: string | keyof Region }
> = {
  ashram: { keyLabel: "", valueLable: "" },
  country: { keyLabel: "country", valueLable: "country_id" },
  state: { keyLabel: "state", valueLable: "country_id" },
  division: { keyLabel: "division", valueLable: "state_id" },
  district: { keyLabel: "district", valueLable: "state_id" },
  tehsil: { keyLabel: "tehsil", valueLable: "district_id" },
  // district: { keyLabel: "tehsil", valueLable: "district_id" },
  // tehsil: { keyLabel: "sevadar", valueLable: "tehsil_id" },
};

export const reportTypes: Array<Option> = [
  { label: "District Wise", value: "sevadar" },
  { label: "Division Wise", value: "region" },
];

export const reportTypesForDistrictSevadar: Array<Option> = [
  { label: "Sevadar Wise", value: "sevadar" },
  { label: "Region Wise", value: "region" },
];
