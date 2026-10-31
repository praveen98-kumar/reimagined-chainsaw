export type RegionLevel =
  "ashram" | "country" | "state" | "division" | "district" | "tehsil" | "city";

export type SevaType = "social_media" | "book_order" | "trend_seva";

export interface RoleInfo {
  id: number;
  name: string;
  region: RegionLevel;
  level: number;
}

export const ROLES: Record<number, RoleInfo> = {
  32: { id: 32, name: "developer", region: "ashram", level: 0 },
  1: { id: 1, name: "ashram_admin", region: "ashram", level: 1 },
  54: { id: 54, name: "ashram_sevadar", region: "ashram", level: 1.5 },
  2: { id: 2, name: "country_coordinator", region: "country", level: 2 },
  3: { id: 3, name: "state_coordinator", region: "state", level: 3 },
  4: { id: 4, name: "division_coordinator", region: "division", level: 4 },
  5: { id: 5, name: "district_coordinator", region: "district", level: 5 },
  6: { id: 6, name: "tehsil_coordinator", region: "tehsil", level: 6 },
  7: { id: 7, name: "city_coordinator", region: "city", level: 7 },
  8: { id: 8, name: "book_order_state_sevadar", region: "state", level: 8 },
  9: { id: 9, name: "book_delivery_state_sevadar", region: "state", level: 9 },
  10: {
    id: 10,
    name: "book_calling_state_sevadar",
    region: "state",
    level: 10,
  },
  11: { id: 11, name: "jyada_ruchi_state_sevadar", region: "state", level: 11 },
  12: {
    id: 12,
    name: "book_order_division_sevadar",
    region: "division",
    level: 12,
  },
  13: {
    id: 13,
    name: "book_delivery_division_sevadar",
    region: "division",
    level: 13,
  },
  14: {
    id: 14,
    name: "book_calling_division_sevadar",
    region: "division",
    level: 14,
  },
  15: {
    id: 15,
    name: "jyada_ruchi_division_sevadar",
    region: "division",
    level: 15,
  },
  16: {
    id: 16,
    name: "book_order_district_sevadar",
    region: "district",
    level: 16,
  },
  17: {
    id: 17,
    name: "book_delivery_district_sevadar",
    region: "district",
    level: 17,
  },
  18: {
    id: 18,
    name: "book_delivery_tehsil_sevadar",
    region: "tehsil",
    level: 18,
  },
  19: {
    id: 19,
    name: "book_calling_district_sevadar",
    region: "district",
    level: 19,
  },
  20: {
    id: 20,
    name: "jyada_ruchi_district_sevadar",
    region: "district",
    level: 20,
  },
  21: { id: 21, name: "miss_call_team_leader", region: "country", level: 21 },
  22: {
    id: 22,
    name: "incomplete_message_team_leader",
    region: "country",
    level: 22,
  },
  23: {
    id: 23,
    name: "duplicate_order_team_leader",
    region: "country",
    level: 23,
  },
  24: { id: 24, name: "post_seva_admin", region: "country", level: 24 },
  25: { id: 25, name: "book_order_sevadar", region: "tehsil", level: 25 },
  26: { id: 26, name: "book_delivery_sevadar", region: "tehsil", level: 26 },
  27: { id: 27, name: "book_calling_sevadar", region: "district", level: 27 },
  28: { id: 28, name: "jyada_ruchi_sevadar", region: "district", level: 28 },
  29: { id: 29, name: "miss_call_sevadar", region: "country", level: 29 },
  30: {
    id: 30,
    name: "incomplete_message_sevadar",
    region: "country",
    level: 30,
  },
  31: { id: 31, name: "duplicate_order_sevadar", region: "country", level: 31 },
  34: {
    id: 34,
    name: "namdan_calling_country_sevadar",
    region: "country",
    level: 34,
  },
  35: {
    id: 35,
    name: "namdan_calling_state_sevadar",
    region: "state",
    level: 35,
  },
  36: {
    id: 36,
    name: "namdan_calling_division_sevadar",
    region: "division",
    level: 36,
  },
  37: {
    id: 37,
    name: "namdan_calling_district_sevadar",
    region: "district",
    level: 37,
  },
  38: { id: 38, name: "namdan_calling_sevadar", region: "district", level: 38 },
  39: {
    id: 39,
    name: "satnam_calling_country_sevadar",
    region: "country",
    level: 39,
  },
  40: {
    id: 40,
    name: "satnam_calling_state_sevadar",
    region: "state",
    level: 40,
  },
  41: {
    id: 41,
    name: "satnam_calling_division_sevadar",
    region: "division",
    level: 41,
  },
  42: {
    id: 42,
    name: "satnam_calling_district_sevadar",
    region: "district",
    level: 42,
  },
  43: { id: 43, name: "satnam_calling_sevadar", region: "district", level: 43 },
  44: {
    id: 44,
    name: "old_calling_country_sevadar",
    region: "country",
    level: 44,
  },
  45: { id: 45, name: "old_calling_state_sevadar", region: "state", level: 45 },
  46: {
    id: 46,
    name: "old_calling_division_sevadar",
    region: "division",
    level: 46,
  },
  47: {
    id: 47,
    name: "old_calling_district_sevadar",
    region: "district",
    level: 47,
  },
  48: { id: 48, name: "old_calling_sevadar", region: "district", level: 48 },
  49: {
    id: 49,
    name: "social_media_country_sevadar",
    region: "country",
    level: 49,
  },
  50: {
    id: 50,
    name: "social_media_state_sevadar",
    region: "state",
    level: 50,
  },
  51: {
    id: 51,
    name: "social_media_division_sevadar",
    region: "division",
    level: 51,
  },
  52: {
    id: 52,
    name: "social_media_district_sevadar",
    region: "district",
    level: 52,
  },
  53: { id: 53, name: "social_media_sevadar", region: "tehsil", level: 53 },
  55: {
    id: 55,
    name: "book_distributor_district_sevadar",
    region: "district",
    level: 54,
  },
  56: {
    id: 56,
    name: "book_order_complain_team_leader",
    region: "ashram",
    level: 55,
  },
  57: {
    id: 57,
    name: "book_order_complain_sevadar",
    region: "ashram",
    level: 56,
  },
  58: {
    id: 58,
    name: "s_incomplete_calling_team_leader",
    region: "state",
    level: 58,
  },
  59: {
    id: 59,
    name: "s_incomplete_calling_sevadar",
    region: "state",
    level: 59,
  },
  60: { id: 60, name: "social_media_team_leader", region: "tehsil", level: 60 },
  61: { id: 61, name: "ramaini_sevadar", region: "ashram", level: 61 },
};

const ALL_REGIONS: RegionLevel[] = [
  "ashram",
  "country",
  "state",
  "division",
  "district",
  "tehsil",
];

export const SEVA_TYPE_REGIONS: Record<SevaType, RegionLevel[]> = {
  social_media: ALL_REGIONS,
  book_order: ALL_REGIONS,
  trend_seva: ALL_REGIONS,
};
