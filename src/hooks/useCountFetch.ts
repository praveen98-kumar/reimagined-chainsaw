"use client";

import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { regionToRegioIDLable } from "@/constants/app";
import { type CountState, type CountStatus, useCount } from "@/hooks/useCount";
import {
  resetCounts,
  setCounts,
  type TCount,
} from "@/redux/features/countSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { getApiCounts } from "@/shared/functions/api";
import type { Region } from "@/shared/interfaces/user";

type RoleRegion =
  "country" | "state" | "division" | "district" | "tehsil" | "city";

type RegionIdKey =
  | "country_id"
  | "state_id"
  | "division_id"
  | "district_id"
  | "tehsil_id"
  | "city_id";

interface UseCountFetchOptions {
  path: string;
  type: TCount;
  sevadar_type: string;
  activeRole: string | undefined;
  userRoleId?: number;
  roleRegion?: string;
  region?: Region | null;
}

interface LocalCountStore {
  state: {
    data: CountState["data"];
  };
}

type CountRecord = Record<string, number | string>;

function getLocalCounts(
  type: TCount,
  activeRegion: Region | undefined,
  activeRole: string | undefined,
  activeRoleRegion: RoleRegion | undefined,
): CountStatus | null {
  const raw = localStorage.getItem("count-store");
  if (!raw) return null;

  try {
    const jsonValue = JSON.parse(raw) as LocalCountStore;
    const localCounts = jsonValue.state.data?.[type];

    if (!activeRoleRegion || !activeRegion) return null;

    const locationID = regionToRegioIDLable[activeRoleRegion];
    if (!localCounts || localCounts.length === 0) return null;

    const found = localCounts.find(
      (t) =>
        t[locationID] === activeRegion[locationID] && t.role === activeRole,
    );

    return found ?? null;
  } catch {
    return null;
  }
}

// Per-day count requests currently in flight. Under React Strict Mode
// (development) the mount effect runs twice before the first response has
// been cached, so without this guard the same counts were requested twice.
// The run that owns the request writes the result to the shared store, which
// every mounted consumer reads from.
const pendingCountRequests = new Set<string>();

function getLocationIdKey(
  activeRoleRegion: RoleRegion | undefined,
): RegionIdKey | null {
  if (!activeRoleRegion) return null;
  return regionToRegioIDLable[activeRoleRegion] ?? null;
}

export function useCountFetch(options: UseCountFetchOptions) {
  const {
    type,
    path,
    sevadar_type,
    activeRole,
    userRoleId,
    roleRegion,
    region,
  } = options;

  const { data: countData, add, upsert } = useCount();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const active_permission = useAppSelector(
    (state) => state.auth.active_permission,
  );
  const active_region_index = useAppSelector(
    (state) => state.auth.active_region_index,
  );
  const active_region = useAppSelector((state) => state.auth.active_region);

  const activeRegion = useMemo(
    () =>
      region ??
      active_region ??
      (active_permission?.region[active_region_index] as Region | undefined),
    [active_permission?.region, active_region_index, active_region, region],
  );

  const activeRoleRegion = useMemo(() => {
    const currentRoleRegion = roleRegion ?? active_permission?.role_region;

    return (currentRoleRegion === "ashram" ? "country" : currentRoleRegion) as
      RoleRegion | undefined;
  }, [active_permission?.role_region, roleRegion]);

  const locationID = useMemo(
    () => getLocationIdKey(activeRoleRegion),
    [activeRoleRegion],
  );

  const getAndSetCountsFromStore = useCallback(() => {
    if (!activeRegion || !activeRoleRegion || !locationID) return;

    const currentRegionCount = activeRole
      ? getLocalCounts(type, activeRegion, activeRole, activeRoleRegion)
      : null;

    if (currentRegionCount) {
      dispatch(
        setCounts({ type, counts: currentRegionCount.counts as CountRecord }),
      );
    } else {
      dispatch(resetCounts({ type }));
    }
  }, [dispatch, type, activeRegion, activeRole, activeRoleRegion, locationID]);

  const updateLocalCount = useCallback(
    (counts: CountRecord) => {
      if (!activeRegion || !activeRoleRegion || !locationID || !activeRole)
        return;

      const currentDate = dayjs().format("DD-MM-YYYY");
      const currentRegionCount = countData?.[type]?.find(
        (item) =>
          item?.[locationID] === activeRegion[locationID] &&
          item?.role === activeRole,
      );

      const { first_order_id, first_accepted_order_date, ...rest } = counts;

      if (Object.keys(counts).length === 0) return;

      if (currentRegionCount) {
        upsert(type, locationID, {
          [locationID]: activeRegion[locationID],
          counts: rest,
          role: activeRole,
          ...(first_order_id && first_accepted_order_date
            ? {
                first_order_id: first_order_id as number,
                first_accepted_order_date: first_accepted_order_date as string,
              }
            : {}),
        });
      } else {
        add(type, {
          [locationID]: activeRegion[locationID],
          date: currentDate,
          role: activeRole,
          counts: rest,
          ...(first_order_id && first_accepted_order_date
            ? {
                first_order_id: first_order_id as number,
                first_accepted_order_date: first_accepted_order_date as string,
              }
            : {}),
        });
      }
      dispatch(setCounts({ type, counts: rest }));
    },
    [
      dispatch,
      add,
      upsert,
      countData,
      type,
      activeRegion,
      activeRole,
      locationID,
      activeRoleRegion,
    ],
  );

  const getPerDayCountsHandler = useCallback(async () => {
    if (!activeRegion || !activeRoleRegion || !locationID) return;

    try {
      const currentDate = dayjs().format("DD-MM-YYYY");
      const currentRegionCount = getLocalCounts(
        type,
        activeRegion,
        activeRole,
        activeRoleRegion,
      );

      if (currentRegionCount && currentDate === currentRegionCount.date) {
        dispatch(
          setCounts({ type, counts: currentRegionCount.counts as CountRecord }),
        );
      } else {
        const requestKey = [
          path,
          type,
          activeRole,
          userRoleId ?? "",
          locationID,
          activeRegion[locationID],
        ].join("|");
        if (pendingCountRequests.has(requestKey)) return;

        pendingCountRequests.add(requestKey);
        setIsLoading(true);
        try {
          const counts = await getApiCounts(
            path,
            {},
            userRoleId ? { user_role_id: userRoleId } : {},
          );
          updateLocalCount(counts as CountRecord);
        } finally {
          pendingCountRequests.delete(requestKey);
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error("Failed to fetch per day counts:", error);
    }
  }, [
    dispatch,
    type,
    path,
    userRoleId,
    updateLocalCount,
    activeRegion,
    activeRole,
    activeRoleRegion,
    locationID,
  ]);

  const getCountsForSevadars = useCallback(async () => {
    if (!activeRoleRegion || !activeRegion) return;

    setIsLoading(true);
    try {
      const counts = await getApiCounts(
        path,
        {
          [activeRoleRegion]: activeRegion[`${activeRoleRegion}_id`],
        },
        userRoleId ? { user_role_id: userRoleId } : {},
      );
      updateLocalCount(counts as CountRecord);
    } catch (error) {
      console.error("Failed to fetch counts for sevadars:", error);
    } finally {
      setIsLoading(false);
    }
  }, [path, userRoleId, activeRoleRegion, activeRegion, updateLocalCount]);

  useEffect(() => {
    if (!sevadar_type || !activeRole) return;

    if (activeRole === sevadar_type) {
      getPerDayCountsHandler();
    } else {
      getAndSetCountsFromStore();
    }
  }, [
    sevadar_type,
    activeRole,
    getPerDayCountsHandler,
    getAndSetCountsFromStore,
  ]);

  return {
    isLoading,
    getCountsForSevadars,
  };
}
