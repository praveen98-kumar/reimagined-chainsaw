"use client";

import { useEffect, useMemo } from "react";
import type { SevaType } from "@/config/roles";
import { setActiveLocation } from "@/redux/features/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  buildLocationOptions,
  createLocationSelection,
  findLocationOption,
  findSavedLocationOption,
  getActiveLocation,
  getActivePermissions,
  getSevaForRoleId,
  isSameRegion,
  permissionSatisfies,
} from "@/shared/functions/seva-region";

/**
 * Ensures umbrella v2 pages (report, manage sevadars) have a valid active
 * location from the sidebar-resolved role group and the page's configured
 * sevas. The selected location is shared across all matching sevas.
 */
export function useEnsureActiveContext(
  sevas?: readonly SevaType[],
  requiredPermissions?: string | string[],
) {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  const pagePermissions = useMemo(
    () =>
      getActivePermissions(auth.user, auth.all_permission).filter(
        (permission) => {
          if (sevas && sevas.length > 0) {
            const seva = getSevaForRoleId(permission.role_id);
            if (!seva || !sevas.includes(seva)) return false;
          }

          return permissionSatisfies(permission, requiredPermissions);
        },
      ),
    [auth.user, auth.all_permission, requiredPermissions, sevas],
  );

  const locations = useMemo(
    () => buildLocationOptions(pagePermissions, sevas),
    [pagePermissions, sevas],
  );

  const activeLocation = useMemo(
    () =>
      getActiveLocation(
        auth.active_permission,
        auth.active_region,
        auth.active_region_index,
      ),
    [auth.active_permission, auth.active_region, auth.active_region_index],
  );

  const selectedLocation = useMemo(() => {
    const currentLocation = auth.active_region ? activeLocation : null;

    return (
      findLocationOption(locations, currentLocation) ??
      findSavedLocationOption(
        locations,
        auth.seva_regions,
        auth.all_permission.group,
        sevas,
      )
    );
  }, [
    activeLocation,
    auth.active_region,
    auth.all_permission.group,
    auth.seva_regions,
    locations,
    sevas,
  ]);

  const selection = useMemo(
    () =>
      selectedLocation
        ? createLocationSelection(selectedLocation, auth.active_permission)
        : null,
    [auth.active_permission, selectedLocation],
  );

  useEffect(() => {
    if (!selection) return;

    const samePermission =
      auth.active_permission?.role_id === selection.permission.role_id;
    const sameRegion = auth.active_region
      ? isSameRegion(
          auth.active_region,
          selection.region,
          selection.permission.role_region,
        )
      : false;
    const sameIndex = auth.active_region_index === selection.regionIndex;

    if (samePermission && sameRegion && sameIndex) return;

    dispatch(setActiveLocation(selection));
  }, [
    auth.active_permission,
    auth.active_region,
    auth.active_region_index,
    dispatch,
    selection,
  ]);

  return {
    permission: selection?.permission ?? null,
    region: selection?.region,
  };
}
