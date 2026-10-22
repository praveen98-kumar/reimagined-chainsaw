import type { Permission, Region } from "@/shared/interfaces/user";

export function getPageHeaderSubtitle(
  activePermission: Permission | null | undefined,
  activeRegion: Region | null | undefined,
  activeRegionIndex: number,
): string | undefined {
  if (!activePermission) return undefined;

  const activeRoleRegion = activePermission.role_region;
  const roleRegionNameKey =
    activeRoleRegion === "ashram" ? "country_name" : `${activeRoleRegion}_name`;

  const activeRegionName = activeRegion
    ? (activeRegion[roleRegionNameKey as keyof Region] as string)
    : (activePermission.region?.[activeRegionIndex]?.[
        roleRegionNameKey as keyof Region
      ] as string | undefined);

  if (!activeRegionName) return undefined;

  if (activeRoleRegion === "ashram") {
    return "Ashram Admin";
  }

  const roleSuffix = activePermission.role?.split("_").splice(2).join(" ");

  return `${activeRegionName} - ${roleSuffix}`;
}
