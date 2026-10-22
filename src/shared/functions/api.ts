import dayjs from "dayjs";
import apiClient from "@/http/index";

export const getApiCounts = async (url: string, params = {}, headers = {}) => {
  try {
    const { data } = await apiClient.get(url, {
      params: {
        ...params,
        from_date: dayjs().startOf("day").toISOString(),
        to_date: dayjs().endOf("day").toISOString(),
        month_date: dayjs().startOf("month").startOf("day").toISOString(),
      },
      headers,
    });
    return data.data;
  } catch (error) {
    console.error(error);
    return {};
  }
};
