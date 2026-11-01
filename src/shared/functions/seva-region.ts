import {
  regionHirarchyMap,
  regionToRegioIDLable,
  type RoleRegion,
} from "@/constants/app";
import { sevaWiseRoleIds } from "@/constants/roles";
import type { SevaType } from "@/config/roles";
import type {
  GroupPermission,
  Permission,
  Region,
  User,
} from "@/shared/interfaces/user";

export interface LocationOption {
  key: string;
  roleRegion: string;
  region: Region;
  sevas: SevaType[];
  permissions: Permission[];
}

export interface ActiveLocation {
  roleRegion: string;
  region: Region;
}

export interface LocationMatch {
  permission: Permission;
  region: Region;
  roleRegion: string;
}

export interface LocationSelection {
  permission: Permission;
  region: Region;
  regionIndex: number;
  selections: Array<{
    seva: SevaType;
    roleRegion: string;
    region: Region;
  }>;
}

export interface ParsedSevaRegionKey {
  group: string;
  seva: SevaType | null;
  roleRegion: string;
}

export type SevaRegionLevels = Partial<Record<SevaType, ReadonlySet<string>>>;

const SEVA_REGION_KEY_SEPARATOR = "::";
const SEVA_TYPES: SevaType[] = ["social_media", "book_order", "trend_seva"];

function isSevaType(value: string): value is SevaType {
  return SEVA_TYPES.includes(value as SevaType);
}

/**
 * Location selections are scoped by the sidebar role group, the seva, and the
 * role level. This keeps two sevas or two groups that share a level from
 * reusing each other's saved location.
 */
export function getSevaRegionKey(
  group: string | null | undefined,
  seva: SevaType,
  roleRegion: string,
): string {
  return `${group ?? ""}${SEVA_REGION_KEY_SEPARATOR}${seva}${SEVA_REGION_KEY_SEPARATOR}${roleRegion}`;
}

/**
 * Parses both the current `group::seva::level` keys and the legacy
 * `group::level` / `level` keys so they can be migrated in place.
 */
export function parseSevaRegionKey(key: string): ParsedSevaRegionKey | null {
  const parts = key.split(SEVA_REGION_KEY_SEPARATOR);

  if (parts.length === 1) {
    const roleRegion = parts[0];
    return roleRegion ? { group: "", seva: null, roleRegion } : null;
  }

  if (parts.length === 2) {
    const [group, roleRegion] = parts;
    return roleRegion ? { group, seva: null, roleRegion } : null;
  }

  if (parts.length === 3) {
    const [group, seva, roleRegion] = parts;
    if (!roleRegion || !isSevaType(seva)) return null;

    return { group, seva, roleRegion };
  }

  return null;
}

/** Returns the active role IDs for a seva. */
export function getSevaRoleIds(seva: SevaType): readonly number[] {
  return sevaWiseRoleIds[seva] ?? [];
}

/** Finds which seva operates a role. */
export function getSevaForRoleId(
  roleId: number | null | undefined,
): SevaType | null {
  if (roleId === null || roleId === undefined) return null;

  for (const seva of SEVA_TYPES) {
    if (getSevaRoleIds(seva).includes(roleId)) return seva;
  }

  return null;
}

export function permissionSatisfies(
  permission: Permission,
  requiredPermissions?: string | string[] | null,
): boolean {
  if (!requiredPermissions) return true;

  const required = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];

  if (required.length === 0) return true;

  return permission.permissions.some((current) => required.includes(current));
}

export function getLocationKey(roleRegion: string, region: Region): string {
  const idKey = getRoleRegionIdKey(roleRegion);
  const id = region[idKey];

  if (id !== undefined && id !== null && id !== "") {
    return `${roleRegion}:${String(id)}`;
  }

  return `${roleRegion}:name:${getRegionDisplayName(region, roleRegion)}`;
}

/**
 * Builds one deduplicated location list across every configured seva. A
 * location shared by multiple sevas is represented once, with the matching
 * permissions aggregated onto the option.
 */
export function buildLocationOptions(
  permissions: Permission[],
  sevas?: readonly SevaType[],
): LocationOption[] {
  const allowedSevas = sevas && sevas.length > 0 ? new Set(sevas) : null;
  const options = new Map<string, LocationOption>();

  for (const permission of permissions) {
    const seva = getSevaForRoleId(permission.role_id);
    if (!seva || (allowedSevas && !allowedSevas.has(seva))) continue;

    const roleRegion = permission.role_region;
    if (!roleRegion) continue;

    for (const region of permission.region ?? []) {
      const key = getLocationKey(roleRegion, region);
      const existing = options.get(key);

      if (!existing) {
        options.set(key, {
          key,
          roleRegion,
          region,
          sevas: [seva],
          permissions: [permission],
        });
        continue;
      }

      if (!existing.sevas.includes(seva)) existing.sevas.push(seva);
      if (
        !existing.permissions.some(
          (current) => current.role_id === permission.role_id,
        )
      ) {
        existing.permissions.push(permission);
      }
    }
  }

  return [...options.values()].sort((first, second) => {
    const levelDifference =
      getRoleRegionLevel(first.roleRegion) -
      getRoleRegionLevel(second.roleRegion);

    if (levelDifference !== 0) return levelDifference;

    return getRegionDisplayName(first.region, first.roleRegion).localeCompare(
      getRegionDisplayName(second.region, second.roleRegion),
    );
  });
}

export function getActiveLocation(
  activePermission: Permission | null | undefined,
  activeRegion: Region | null | undefined,
  activeRegionIndex: number,
): ActiveLocation | null {
  const roleRegion = activePermission?.role_region;
  if (!roleRegion) return null;

  const regions = activePermission.region ?? [];
  const active = activeRegion
    ? regions.find((region) => isSameRegion(region, activeRegion, roleRegion))
    : undefined;
  const region = active ?? regions[activeRegionIndex] ?? regions[0];

  return region ? { roleRegion, region } : null;
}

export function findLocationOption(
  locations: readonly LocationOption[],
  location: ActiveLocation | null | undefined,
): LocationOption | null {
  if (!location) return null;

  return (
    locations.find(
      (option) =>
        option.roleRegion === location.roleRegion &&
        isSameRegion(option.region, location.region, location.roleRegion),
    ) ?? null
  );
}

/**
 * Returns the location remembered for the active group and sevas, or `null`
 * when nothing has been saved yet. Callers that want a fallback should use
 * `findGroupLocationOption` / `findPreferredLocationOption`.
 */
export function findSavedRegionOption(
  locations: readonly LocationOption[],
  sevaRegions: Record<string, Region> | null | undefined,
  group: string | null | undefined,
  sevas?: readonly SevaType[],
): LocationOption | null {
  if (locations.length === 0) return null;

  const candidateSevas =
    sevas && sevas.length > 0
      ? sevas
      : [...new Set(locations.flatMap((option) => option.sevas))];

  for (const seva of candidateSevas) {
    const saved = getSevaRegions(sevaRegions, group, seva);

    for (const option of locations) {
      if (!option.sevas.includes(seva)) continue;

      const savedRegion = saved[option.roleRegion];
      if (
        savedRegion &&
        isSameRegion(option.region, savedRegion, option.roleRegion)
      ) {
        return option;
      }
    }
  }

  return null;
}

/**
 * Returns the location last picked while a sidebar group was active. The
 * group-level record is authoritative because one picker selection can only be
 * stored for the sevas that actually have that location. Relying on the
 * per-seva records alone lets a stale entry for another seva win.
 */
export function findGroupLocationOption(
  locations: readonly LocationOption[],
  groupLocations: Record<string, ActiveLocation> | null | undefined,
  group: string | null | undefined,
): LocationOption | null {
  const saved = groupLocations?.[group ?? ""];
  if (!saved) return null;

  return findLocationOption(locations, saved);
}

/**
 * Seeds a group's remembered location from the persisted active location.
 * This keeps existing users' last selection after upgrading to group-level
 * tracking. An existing group entry is never overwritten.
 */
export function seedGroupLocation(
  groupLocations: Record<string, ActiveLocation> | null | undefined,
  group: string | null | undefined,
  roles: readonly number[] | null | undefined,
  permission: Permission | null | undefined,
  region: Region | null | undefined,
): Record<string, ActiveLocation> {
  const current = groupLocations ?? {};
  const groupKey = group ?? "";

  if (
    current[groupKey] ||
    !permission ||
    !region ||
    !permission.role_region ||
    !roles?.includes(permission.role_id)
  ) {
    return current;
  }

  return {
    ...current,
    [groupKey]: { roleRegion: permission.role_region, region },
  };
}

/**
 * Resolves the location a page should display. The location chosen while the
 * current sidebar group was active is kept. When the active permission does not
 * belong to the group selected in the sidebar (for example right after
 * switching groups), the last location picked in that group wins instead so
 * the picker does not keep the previous group's selection.
 */
export function findPreferredLocationOption(
  locations: readonly LocationOption[],
  sevaRegions: Record<string, Region> | null | undefined,
  groupLocations: Record<string, ActiveLocation> | null | undefined,
  group: string | null | undefined,
  sevas: readonly SevaType[] | undefined,
  currentLocation: ActiveLocation | null | undefined,
  isCurrentPermissionInGroup: boolean,
): LocationOption | null {
  const currentOption = findLocationOption(locations, currentLocation);

  if (isCurrentPermissionInGroup && currentOption) {
    return currentOption;
  }

  return (
    findGroupLocationOption(locations, groupLocations, group) ??
    findSavedRegionOption(locations, sevaRegions, group, sevas) ??
    currentOption ??
    locations[0] ??
    null
  );
}

/** Finds the option that represents a specific region and role level. */
export function findLocationOptionForRegion(
  locations: readonly LocationOption[],
  roleRegion: string,
  region: Region,
): LocationOption | null {
  return (
    locations.find(
      (option) =>
        option.roleRegion === roleRegion &&
        isSameRegion(option.region, region, roleRegion),
    ) ?? null
  );
}

/**
 * Builds the selection used when a seva card navigates to its page. Uses the
 * location last picked in the active group (then the per-seva record) so the
 * target page keeps the same location instead of falling back to the first
 * region of a permission.
 */
export function findSavedLocationSelection(
  permissions: Permission[],
  sevaRegions: Record<string, Region> | null | undefined,
  groupLocations: Record<string, ActiveLocation> | null | undefined,
  group: string | null | undefined,
  preferredPermission?: Permission | null,
): LocationSelection | null {
  const options = buildLocationOptions(permissions);
  const option =
    findGroupLocationOption(options, groupLocations, group) ??
    findSavedRegionOption(options, sevaRegions, group);

  return option ? createLocationSelection(option, preferredPermission) : null;
}

export function findRegionInPermission(
  permission: Permission,
  roleRegion: string,
  region: Region,
): Region | null {
  if (permission.role_region !== roleRegion) return null;

  return (
    (permission.region ?? []).find((current) =>
      isSameRegion(current, region, roleRegion),
    ) ?? null
  );
}

export function createLocationSelection(
  option: LocationOption,
  preferredPermission?: Permission | null,
): LocationSelection | null {
  const matching = option.permissions
    .map((permission) => ({
      permission,
      region: findRegionInPermission(
        permission,
        option.roleRegion,
        option.region,
      ),
    }))
    .filter(
      (
        entry,
      ): entry is {
        permission: Permission;
        region: Region;
      } => Boolean(entry.region),
    );

  if (matching.length === 0) return null;

  const preferred = preferredPermission
    ? matching.find(
        (entry) => entry.permission.role_id === preferredPermission.role_id,
      )
    : undefined;
  const primary = preferred ?? matching[0];

  if (!primary) return null;

  const selections: LocationSelection["selections"] = [];
  const selectedSevas = new Set<SevaType>();

  for (const entry of matching) {
    const seva = getSevaForRoleId(entry.permission.role_id);
    if (!seva || selectedSevas.has(seva)) continue;

    selectedSevas.add(seva);
    selections.push({
      seva,
      roleRegion: option.roleRegion,
      region: entry.region,
    });
  }

  return {
    permission: primary.permission,
    region: primary.region,
    regionIndex: getRegionIndex(primary.permission, primary.region),
    selections,
  };
}

/**
 * Finds the permission and region that represent a selected location. When no
 * location is selected yet, the first region of a matching permission is used
 * so existing pages still render before the picker initializes.
 */
export function findLocationMatch(
  permissions: Permission[],
  location: ActiveLocation | null | undefined,
  preferredPermission?: Permission | null,
): LocationMatch | null {
  const matches: LocationMatch[] = [];

  for (const permission of permissions) {
    const roleRegion = permission.role_region;
    const regions = permission.region ?? [];
    if (!roleRegion || regions.length === 0) continue;

    if (location) {
      if (roleRegion !== location.roleRegion) continue;

      const region = regions.find((current) =>
        isSameRegion(current, location.region, roleRegion),
      );

      if (region) matches.push({ permission, region, roleRegion });
      continue;
    }

    matches.push({ permission, region: regions[0], roleRegion });
  }

  if (matches.length === 0) return null;

  const preferred = preferredPermission
    ? matches.find(
        (match) => match.permission.role_id === preferredPermission.role_id,
      )
    : undefined;

  return preferred ?? matches[0];
}

/**
 * Returns the level-keyed selections for one seva in one sidebar group.
 */
export function getSevaRegions(
  sevaRegions: Record<string, Region> | null | undefined,
  group: string | null | undefined,
  seva: SevaType,
): Record<string, Region> {
  const targetGroup = group ?? "";
  const selections: Record<string, Region> = {};

  for (const [key, region] of Object.entries(sevaRegions ?? {})) {
    const parsed = parseSevaRegionKey(key);

    if (
      parsed?.seva === seva &&
      parsed.group === targetGroup &&
      parsed.roleRegion
    ) {
      selections[parsed.roleRegion] = region;
    }
  }

  return selections;
}

/**
 * Builds a seva -> available role-region map from the user's permissions in
 * the active sidebar group.
 */
export function getSevaRegionLevels(
  user: User | null | undefined,
  allPermission?: GroupPermission | null,
): SevaRegionLevels {
  const levels: Partial<Record<SevaType, Set<string>>> = {};

  for (const permission of getActivePermissions(user, allPermission)) {
    for (const seva of SEVA_TYPES) {
      if (!getSevaRoleIds(seva).includes(permission.role_id)) continue;

      if (!levels[seva]) levels[seva] = new Set();
      levels[seva]?.add(permission.role_region);
    }
  }

  return levels;
}

/**
 * Moves legacy `level` and `group::level` selections into the current
 * `group::seva::level` format. A legacy selection is copied to every seva that
 * operates that level, which preserves the previous shared-location behavior
 * until the user picks a separate location for each seva.
 */
export function migrateSevaRegionsToGroup(
  sevaRegions: Record<string, Region> | null | undefined,
  group: string | null | undefined,
  levels: SevaRegionLevels = {},
): Record<string, Region> {
  const targetGroup = group ?? "";
  const migrated: Record<string, Region> = {};
  const legacyEntries: Array<{
    key: string;
    group: string;
    roleRegion: string;
    region: Region;
  }> = [];
  const emptyGroupEntries: Array<{
    seva: SevaType;
    roleRegion: string;
    region: Region;
  }> = [];

  for (const [key, region] of Object.entries(sevaRegions ?? {})) {
    const parsed = parseSevaRegionKey(key);

    if (!parsed) continue;

    if (parsed.seva) {
      if (targetGroup && parsed.group === "") {
        emptyGroupEntries.push({
          seva: parsed.seva,
          roleRegion: parsed.roleRegion,
          region,
        });
      } else {
        migrated[key] = region;
      }
      continue;
    }

    if (parsed.group === "" || parsed.group === targetGroup) {
      legacyEntries.push({
        key,
        group: parsed.group,
        roleRegion: parsed.roleRegion,
        region,
      });
    } else {
      // Keep legacy selections for other groups until that group is active.
      migrated[key] = region;
    }
  }

  for (const entry of emptyGroupEntries) {
    const nextKey = getSevaRegionKey(targetGroup, entry.seva, entry.roleRegion);
    if (!migrated[nextKey]) migrated[nextKey] = entry.region;
  }

  const hasKnownLevels = SEVA_TYPES.some(
    (seva) => (levels[seva]?.size ?? 0) > 0,
  );

  for (const entry of legacyEntries) {
    const target = targetGroup || entry.group;
    const matchingSevas = SEVA_TYPES.filter((seva) =>
      levels[seva]?.has(entry.roleRegion),
    );

    if (matchingSevas.length === 0) {
      // If levels are not known yet, keep the old key so a later auth sync can
      // migrate it instead of silently dropping the selection.
      if (!hasKnownLevels) migrated[entry.key] = entry.region;
      continue;
    }

    for (const seva of matchingSevas) {
      const nextKey = getSevaRegionKey(target, seva, entry.roleRegion);
      if (!migrated[nextKey]) migrated[nextKey] = entry.region;
    }
  }

  return migrated;
}

const REGION_NAME_KEYS = [
  "tehsil_name",
  "district_name",
  "division_name",
  "city_name",
  "state_name",
  "country_name",
] as const;

/**
 * The region column that identifies a permission's assigned location.
 * Ashram roles are scoped by country in the API, so they use `country_id`.
 */
export function getRoleRegionIdKey(roleRegion: string): keyof Region {
  if (roleRegion === "ashram") return "country_id";

  return (
    regionToRegioIDLable[roleRegion as keyof typeof regionToRegioIDLable] ??
    (`${roleRegion}_id` as keyof Region)
  );
}

export function isSameRegion(
  first: Region,
  second: Region,
  roleRegion: string,
): boolean {
  const key = getRoleRegionIdKey(roleRegion);
  const firstValue = first[key];
  const secondValue = second[key];

  if (firstValue === undefined || firstValue === null || firstValue === "") {
    return false;
  }

  return String(firstValue) === String(secondValue);
}

export function getRegionDisplayName(
  region: Region,
  roleRegion?: string,
): string {
  if (roleRegion) {
    const levelNameKey =
      roleRegion === "ashram"
        ? "country_name"
        : (`${roleRegion}_name` as keyof Region);
    const levelName = region[levelNameKey];

    if (levelName !== undefined && levelName !== null && levelName !== "") {
      return String(levelName);
    }
  }

  const name = REGION_NAME_KEYS.map((key) => region[key]).find(
    (value) => value !== undefined && value !== null && value !== "",
  );

  return name ?? "";
}

export function getRoleRegionLevel(roleRegion: string): number {
  return regionHirarchyMap[roleRegion as RoleRegion] ?? Number.MAX_SAFE_INTEGER;
}

/**
 * Permissions available for the role group selected in the sidebar
 * (`all_permission.roles`). Falls back to every permission before the group
 * has been resolved (for example on first render).
 */
export function getActivePermissions(
  user: User | null | undefined,
  allPermission?: GroupPermission | null,
): Permission[] {
  if (!user) return [];

  const roles = allPermission?.roles ?? [];
  if (roles.length === 0) return user.permission;

  return user.permission.filter((permission) =>
    roles.includes(permission.role_id),
  );
}

export function getRegionIndex(
  permission: Permission,
  region: Region | null | undefined,
): number {
  if (!region) return 0;

  const index = (permission.region ?? []).findIndex((current) =>
    isSameRegion(current, region, permission.role_region),
  );

  return index >= 0 ? index : 0;
}
