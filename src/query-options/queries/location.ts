import { useQuery } from "@tanstack/react-query";
import {
  getCountries,
  getDistricts,
  getDivisions,
  getStates,
  getTehsils,
} from "@/shared/functions/location";

const DEFAULT_COUNTRY_ID = 2;

export function useCountriesQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["countries"],
    queryFn: getCountries,
    staleTime: 1000 * 60 * 10,
    ...options,
  });
}

export function useStatesQuery(
  countryId: number = DEFAULT_COUNTRY_ID,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["states", countryId],
    queryFn: () => getStates(countryId),
    enabled: !!countryId && countryId > 0,
    staleTime: 1000 * 60 * 10,
    ...options,
  });
}

export function useDistrictsQuery(
  stateId: number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["districts", stateId],
    queryFn: () => getDistricts(stateId),
    enabled: !!stateId && stateId > 0,
    staleTime: 1000 * 60 * 10,
    ...options,
  });
}

export function useDivisionsQuery(
  stateId: number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["divisions", stateId],
    queryFn: () => getDivisions(stateId),
    enabled: !!stateId && stateId > 0,
    staleTime: 1000 * 60 * 10,
    ...options,
  });
}

export function useTehsilsQuery(
  districtId: number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["tehsils", districtId],
    queryFn: () => getTehsils(districtId),
    enabled: !!districtId && districtId > 0,
    staleTime: 1000 * 60 * 10,
    ...options,
  });
}
