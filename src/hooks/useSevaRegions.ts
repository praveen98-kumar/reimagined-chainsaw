"use client";

import { useCallback, useEffect, useMemo } from "react";
import type { SevaType } from "@/config/roles";
import { SEVA_CONFIG } from "@/constants/roles";
import { setActiveLocation } from "@/redux/features/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  buildLocationOptions,
  createLocationSelection,
  findLocationOption,
  findPreferredLocationOption,
  getActiveLocation,
  getActivePermissions,
  getSevaRoleIds,
  isSameRegion,
  type LocationOption,
} from "@/shared/functions/seva-region";

export function useSevaRegions(sevas?: readonly SevaType[]) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const allPermission = useAppSelector((state) => state.auth.all_permission);
  const sevaRegions = useAppSelector((state) => state.auth.seva_regions);
  const groupLocations = useAppSelector((state) => state.auth.group_locations);
  const activePermission = useAppSelector(
    (state) => state.auth.active_permission,
  );
  const activeRegion = useAppSelector((state) => state.auth.active_region);
  const activeRegionIndex = useAppSelector(
    (state) => state.auth.active_region_index,
  );

  const activePermissions = useMemo(
    () => getActivePermissions(user, allPermission),
    [user, allPermission],
  );

  const availableSevas = useMemo(
    () =>
      (Object.keys(SEVA_CONFIG) as SevaType[]).filter((seva) =>
        activePermissions.some((permission) =>
          getSevaRoleIds(seva).includes(permission.role_id),
        ),
      ),
    [activePermissions],
  );

  const configuredSevas = useMemo(() => {
    const available = new Set(availableSevas);
    const configured = sevas && sevas.length > 0 ? sevas : availableSevas;
    const seen = new Set<SevaType>();

    return configured.filter((seva) => {
      if (seen.has(seva) || !available.has(seva)) return false;

      seen.add(seva);
      return true;
    });
  }, [availableSevas, sevas]);

  const locations = useMemo(
    () => buildLocationOptions(activePermissions, configuredSevas),
    [activePermissions, configuredSevas],
  );

  const activeLocation = useMemo(
    () => getActiveLocation(activePermission, activeRegion, activeRegionIndex),
    [activePermission, activeRegion, activeRegionIndex],
  );

  const isCurrentPermissionInGroup = useMemo(
    () =>
      activePermission !== null &&
      activePermissions.some(
        (permission) => permission.role_id === activePermission.role_id,
      ),
    [activePermission, activePermissions],
  );

  const selectedLocation = useMemo(() => {
    const currentLocation = activeRegion ? activeLocation : null;

    return findPreferredLocationOption(
      locations,
      sevaRegions,
      groupLocations,
      allPermission.group,
      configuredSevas,
      currentLocation,
      isCurrentPermissionInGroup,
    );
  }, [
    activeLocation,
    activeRegion,
    allPermission.group,
    configuredSevas,
    groupLocations,
    isCurrentPermissionInGroup,
    locations,
    sevaRegions,
  ]);

  const selection = useMemo(
    () =>
      selectedLocation
        ? createLocationSelection(selectedLocation, activePermission)
        : null,
    [activePermission, selectedLocation],
  );

  useEffect(() => {
    if (!selection) return;

    const activeOption = findLocationOption(locations, activeLocation);
    const samePermission =
      activePermission?.role_id === selection.permission.role_id;
    const sameRegion = activeRegion
      ? isSameRegion(
          activeRegion,
          selection.region,
          selection.permission.role_region,
        )
      : false;
    const sameIndex = activeRegionIndex === selection.regionIndex;

    if (activeOption && samePermission && sameRegion && sameIndex) return;

    dispatch(setActiveLocation(selection));
  }, [
    activeLocation,
    activePermission,
    activeRegion,
    activeRegionIndex,
    dispatch,
    locations,
    selection,
  ]);

  const setLocation = useCallback(
    (option: LocationOption) => {
      const nextSelection = createLocationSelection(option, activePermission);
      if (nextSelection) dispatch(setActiveLocation(nextSelection));
    },
    [activePermission, dispatch],
  );

  return {
    group: allPermission.group,
    locations,
    selectedLocation,
    setLocation,
  };
}
