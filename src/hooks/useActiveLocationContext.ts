"use client";

import { useEffect, useMemo, useRef } from "react";
import { useAppSelector } from "@/redux/store";
import {
  getActiveLocation,
  getLocationKey,
  getRoleRegionIdKey,
} from "@/shared/functions/seva-region";
import type { Permission, Region } from "@/shared/interfaces/user";

export interface ActiveLocationContext {
  key: string;
  roleId: number;
  role: string;
  roleRegion: string;
  region: Region;
  userRoleId: number;
  params: Record<string, number>;
}

export function useActiveLocationContext(): ActiveLocationContext | null {
  const activePermission = useAppSelector(
    (state) => state.auth.active_permission,
  );
  const activeRegion = useAppSelector((state) => state.auth.active_region);
  const activeRegionIndex = useAppSelector(
    (state) => state.auth.active_region_index,
  );

  return useMemo(
    () =>
      buildActiveLocationContext(
        activePermission,
        activeRegion,
        activeRegionIndex,
      ),
    [activePermission, activeRegion, activeRegionIndex],
  );
}

function buildActiveLocationContext(
  activePermission: Permission | null | undefined,
  activeRegion: Region | null | undefined,
  activeRegionIndex: number,
): ActiveLocationContext | null {
  const location = getActiveLocation(
    activePermission,
    activeRegion,
    activeRegionIndex,
  );

  if (!activePermission || !location) return null;

  const idKey = getRoleRegionIdKey(location.roleRegion);
  const id = location.region[idKey];

  return {
    key: `${activePermission.role_id}:${getLocationKey(
      location.roleRegion,
      location.region,
    )}`,
    roleId: activePermission.role_id,
    role: activePermission.role,
    roleRegion: location.roleRegion,
    region: location.region,
    userRoleId: location.region.user_role_id,
    params:
      id === undefined || id === null || id === ""
        ? {}
        : { [idKey]: Number(id) },
  };
}

/**
 * Runs a callback only when the canonical location actually changes after the
 * first resolved location. This avoids refetching during initial hydration.
 */
export function useLocationChange(
  onChange: (location: ActiveLocationContext) => void,
  options: { enabled?: boolean } = {},
) {
  const location = useActiveLocationContext();
  const previousKey = useRef<string | null>(null);
  const callbackRef = useRef(onChange);
  const { enabled = true } = options;

  useEffect(() => {
    callbackRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!enabled || !location) return;

    if (previousKey.current === null) {
      previousKey.current = location.key;
      return;
    }

    if (previousKey.current === location.key) return;

    previousKey.current = location.key;
    callbackRef.current(location);
  }, [enabled, location]);
}
