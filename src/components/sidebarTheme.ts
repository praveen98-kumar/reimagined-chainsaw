/**
 * Shared Tailwind class names for the sidebar (Saffron & Ivory theme).
 * Used by Sidebar.tsx, UserSwitcher.tsx and SwitchRole.tsx so the menu
 * looks the same everywhere.
 */

// Panel background: ivory with soft saffron / gold glows
export const sidebarPanelBackground =
  "radial-gradient(circle at 100% 0%, rgba(253,186,116,0.55) 0%, rgba(253,186,116,0) 45%), " +
  "radial-gradient(circle at 0% 100%, rgba(253,230,138,0.55) 0%, rgba(253,230,138,0) 50%), #fffaf0";

const rowBase =
  "flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-left transition-colors";

// A top-level menu row (closed / expanded)
export const menuRowClosed = `${rowBase} hover:bg-orange-100/70`;
export const menuRowOpen = `${rowBase} bg-orange-100`;

// Round icon chip at the start of a row
export const iconChip =
  "flex size-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[#9a3412]";

export const rowLabel = "flex-1 text-base font-semibold text-[#431407]";

// Small count badge (e.g. number of logged-in users)
export const countBadge =
  "flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-[#c2410c] px-1.5 text-xs font-bold text-white";

// Expanded list under a row
export const subPanel =
  "mt-1 space-y-1 overflow-hidden rounded-2xl border border-orange-100 bg-white/80 p-2";

const subItemBase =
  "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[15px] text-[#431407] cursor-pointer";

export const subItem = `${subItemBase} font-semibold hover:bg-orange-50`;
// Currently selected user / account
export const subItemActive = `${subItemBase} border border-orange-300 bg-white font-bold`;

// "Login Another Account"
export const dashedAction =
  "flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-orange-500 bg-white/90 px-3 py-2.5 font-bold text-[#9a3412] hover:bg-orange-50";

// Logout
export const logoutButton =
  "flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#c2410c] to-[#9a3412] py-3 text-lg font-bold text-white shadow-[0_6px_16px_rgba(154,52,18,0.4)]";
