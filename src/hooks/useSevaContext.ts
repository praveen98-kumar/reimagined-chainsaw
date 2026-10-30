"use client";

import { useMemo } from "react";
import type { MatchResult } from "@/components/v2/Can";
import type { SevaType } from "@/config/roles";
import { useEnsureActiveContext } from "@/hooks/useEnsureActiveContext";

/**
 * Keeps the legacy `active_permission` / `active_region` pair aligned with the
 * selected location while a seva-specific page is open, and returns the
 * matching permission for that seva.
 */
export function useSevaContext(
  sevadarType: SevaType,
  permissions: string | string[],
): MatchResult | null {
  const { permission, region } = useEnsureActiveContext(
    [sevadarType],
    permissions,
  );

  return useMemo(() => {
    if (!permission || !region) return null;

    return {
      userRole: permission.role,
      userRoleId: region.user_role_id,
      roleRegion: permission.role_region,
      region,
      permission,
    };
  }, [permission, region]);
}
