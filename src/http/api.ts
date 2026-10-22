import { getOptionArray } from "@/shared/functions/utils";
import apiClient from ".";

export const getOccupationList = async () => {
  try {
    const { data } = await apiClient.get(`misc/list`, {
      params: { slug: "occupation" },
    });
    return getOptionArray(data.data, "name", "id");
  } catch (error) {
    console.log(error);
    return [];
  }
};
