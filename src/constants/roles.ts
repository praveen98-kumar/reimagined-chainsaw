import type { SevaType } from "@/config/roles";

export interface SevaConfig {
  label: string;
  roleIds: readonly number[];
}

/**
 * Metadata for every seva handled by the v2 location picker.
 *
 * `trend_seva` is intentionally not mapped yet; its empty role list makes the
 * picker skip it while keeping the type exhaustive.
 */
export const SEVA_CONFIG: Record<SevaType, SevaConfig> = {
  social_media: {
    label: "Social Media",
    roleIds: [49, 50, 51, 52, 63, 64, 60, 53],
  },
  book_order: {
    label: "Book Order",
    roleIds: [8, 12, 16, 25],
  },
  trend_seva: {
    label: "Trend Seva",
    roleIds: [],
  },
};

/**
 * Maps a seva type to the roles that operate that seva.
 */
export const sevaWiseRoleIds: Record<SevaType, readonly number[]> = {
  social_media: SEVA_CONFIG.social_media.roleIds,
  book_order: SEVA_CONFIG.book_order.roleIds,
  trend_seva: SEVA_CONFIG.trend_seva.roleIds,
};

/**
 * Sevas shown in the location picker for each v2 page.
 */
export const SEVA_PAGE_CONFIG = {
  socialMediaDashboard: ["social_media", "book_order"],
  socialMediaReport: ["social_media", "book_order"],
  socialMediaSeva: ["social_media", "book_order"],
  manageSevadar: ["social_media", "book_order"],
  socialMediaSevaForm: ["social_media"],
  managePlatforms: ["social_media"],
  bookOrderList: ["book_order"],
  bookOrderForm: ["book_order"],
} as const satisfies Record<string, readonly SevaType[]>;
