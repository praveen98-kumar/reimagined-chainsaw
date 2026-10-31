import apiClient from "@/http/index";
import { getOptionArray } from "./utils";

export const getCountries = async () => {
  try {
    const { data } = await apiClient.get(`countries`);
    return getOptionArray(data.data, "name", "id");
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getStates = async (countryId: number | string) => {
  try {
    const { data } = await apiClient.get(`states?country_id=${countryId}`);
    return getOptionArray(data.data, "name", "id");
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getDistricts = async (stateId: number | string) => {
  try {
    const { data } = await apiClient.get(`districts?state_id=${stateId}`);
    return getOptionArray(data.data, "name", "id");
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getDistrictsUnderDivision = async (division: number | string) => {
  try {
    const { data } = await apiClient.get(`districts?division_id=${division}`);
    return getOptionArray(data.data, "name", "id");
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getTehsils = async (districtId: number | string) => {
  try {
    const { data } = await apiClient.get(
      `tehsil_list?district_id=${districtId}`,
    );
    return getOptionArray(data.data, "name", "id");
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getDivisions = async (stateId: number | string) => {
  try {
    const { data } = await apiClient.get(`division_list?state_id=${stateId}`);
    return getOptionArray(data.data, "name", "id");
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getCenters = async (district_id: number | string) => {
  try {
    const { data } = await apiClient.get(
      `namdan_center_list?district_id=${district_id}`,
    );
    return getOptionArray(data.data.namdan_center, "name", "id");
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getAshrams = async () => {
  try {
    const { data } = await apiClient.get("namdan_center_list?is_ashram=1&limit=0");
    return getOptionArray(data.data.namdan_center, "name", "id", true);
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const handleDistrictChange = async (
  value: string | number,
  cb: (data?: any) => void,
) => {
  if (value) {
    const tehsils = await getTehsils(value);
    cb(tehsils);
  }
};

export const handleCountryChange = async (
  value: string | number,
  cb: (data?: any) => void,
  stateIds: number[] = [],
) => {
  if (value) {
    const states = await getStates(value);
    if (states.length > 0) {
      cb(states.filter((s) => stateIds.includes(Number(s.value))));
    } else {
      cb(states);
    }
  }
};

export const handleStateChange = async (
  value: string | number,
  cb: (data?: any) => void,
) => {
  if (value) {
    const districts = await getDistricts(value);
    cb(districts);
  }
};

export const handleStateChangeForDivisions = async (
  value: string | number,
  cb: (data?: any) => void,
) => {
  if (value) {
    const divisions = await getDivisions(value);
    cb(divisions);
  }
};

export const handleDivisionChange = async (
  value: string | number,
  cb: (data?: any) => void,
) => {
  if (value) {
    const divisions = await getDistrictsUnderDivision(value);
    cb(divisions);
  }
};

export const getRegionValue = (
  active_permission: any,
  active_region_index: number = 0,
  prefix: string = "",
) => {
  if (active_permission && active_permission?.region?.length > 0) {
    const key = `${active_permission?.role_region}_id`;
    const keyWithPrefix = `${active_permission?.role_region}${prefix}`;
    let item: any = {};
    item[keyWithPrefix] = active_permission?.region[active_region_index][key];
    return item;
  }
  return {};
};
