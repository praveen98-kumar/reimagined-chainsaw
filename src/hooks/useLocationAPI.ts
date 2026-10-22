"use client";
import {
  getCountries,
  getDistricts,
  getDivisions,
  getStates,
  getTehsils,
} from "@/shared/functions/location";
import { useQuery } from "@tanstack/react-query";

export const useCountries = (options?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ["countries"],
    queryFn: getCountries,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

export const useStates = (
  countryId?: number | string,
  options?: Record<string, unknown>,
) => {
  return useQuery({
    queryKey: ["states", countryId],
    queryFn: () => (countryId ? getStates(countryId) : []),
    staleTime: 1 * 60 * 1000,
    ...options,
  });
};

export const useDistricts = (
  stateId?: number | string,
  options?: Record<string, unknown>,
) => {
  return useQuery({
    queryKey: ["districts", stateId],
    queryFn: () => (stateId ? getDistricts(stateId) : []),
    staleTime: 1 * 60 * 1000,
    ...options,
  });
};

export const useDivisions = (
  stateId: number | string,
  options?: Record<string, unknown>,
) => {
  return useQuery({
    queryKey: ["districts", stateId],
    queryFn: () => (stateId ? getDivisions(stateId) : []),
    staleTime: 1 * 60 * 1000,
    ...options,
  });
};

export const useTehsils = (
  districtId?: number | string,
  options?: Record<string, unknown>,
) => {
  return useQuery({
    queryKey: ["tehsils", districtId],
    queryFn: () => (districtId ? getTehsils(districtId) : []),
    staleTime: 1 * 60 * 1000,
    ...options,
  });
};
