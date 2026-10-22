"use client";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/http/index";
import { useAppSelector } from "@/redux/store";
import { getInitialValues } from "@/shared/functions/utils";
import type { ApiResponse } from "@/shared/interfaces/api";

export interface SMPlatformReport extends ApiResponse<Data> {}

export interface Data {
  total_sevadar: number;
  platform_wise: PlatformWise[];
}

export interface PlatformWise {
  platform: string;
  count: number;
  sequence: number;
}

export function useSMPlatformReport() {
  const { active_permission, active_region_index } = useAppSelector(
    (s) => s.auth,
  );

  const regionIdMap = getInitialValues(active_permission, active_region_index);
  const transformedRegionIdMap = Object.entries(regionIdMap).reduce((a, c) => {
    const key = c[0].replace("_id", "");
    return Object.assign(a, { [key]: c[1] });
  }, {});

  const { data } = useQuery({
    queryKey: ["platform_report"],
    queryFn: async () => {
      const response = await apiClient.get<SMPlatformReport>(
        "social_media_platform_report",
        {
          params: transformedRegionIdMap,
        },
      );
      return response?.data;
    },
  });
  const platforms =
    data?.data?.platform_wise.sort((a, b) => a.sequence - b.sequence) ||
    ([] as PlatformWise[]);

  return {
    platforms,
    total_sevadar: data?.data.total_sevadar || 0,
  };
}
