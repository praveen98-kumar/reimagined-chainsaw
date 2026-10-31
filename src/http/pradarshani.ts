import dayjs from "dayjs";
import apiClient from ".";
import {
  FeedbackFormValues,
  FeedbackListData,
  FeedbackListFilters,
  FeedbackListResponse,
  PradarshaniReportData,
  PradarshaniReportFilters,
  PradarshaniReportResponse,
  PradarshaniSevaCountData,
  PradarshaniSevaCountResponse,
} from "@/shared/interfaces/pradarshani";

export const getFeedbackList = async (
  params?: FeedbackListFilters,
): Promise<FeedbackListData> => {
  try {
    const { data } = await apiClient.get<FeedbackListResponse>(
      "pradarshani_feedback",
      { params },
    );
    return data.data;
  } catch (error) {
    console.error(error);
    return { feedback_list: [], total: 0 };
  }
};

export const submitFeedback = async (body: FeedbackFormValues) => {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(
    "pradarshani_feedback",
    body,
  );
  return data;
};

export const getPradarshaniSevaCount = async (
  params?: Record<string, unknown>,
): Promise<PradarshaniSevaCountData> => {
  try {
    const { data } = await apiClient.get<PradarshaniSevaCountResponse>(
      "pradarshani_seva_count",
      { params },
    );
    return data.data;
  } catch (error) {
    console.error(error);
    return { total_count: 0 };
  }
};

export const getFeedbackReport = async (
  body: PradarshaniReportFilters,
): Promise<PradarshaniReportData> => {
  try {
    const { data } = await apiClient.post<PradarshaniReportResponse>(
      "pradarshani_seva_report",
      body,
    );
    return data.data;
  } catch (error) {
    console.error(error);
    return { report: [] };
  }
};

export const buildPradarshaniLocationFilter = ({
  country_id,
  state_id,
  district_id,
}: {
  country_id?: number | null;
  state_id?: number | null;
  district_id?: number | null;
}): Record<string, number> => {
  if (district_id) return { district_id };
  if (state_id) return { state_id };
  if (country_id) return { country_id };
  return {};
};

export const buildDateRangeParams = (
  dayFilter?: string,
  start?: Date | string | null,
  end?: Date | string | null,
): { start_date?: string; end_date?: string } => {
  let start_date: string | undefined;
  let end_date: string | undefined;

  switch (dayFilter) {
    case "today":
      start_date = dayjs().startOf("day").toISOString();
      end_date = dayjs().endOf("day").toISOString();
      break;
    case "yesterday":
      start_date = dayjs().subtract(1, "day").startOf("day").toISOString();
      end_date = dayjs().subtract(1, "day").endOf("day").toISOString();
      break;
    case "this_week":
      start_date = dayjs().startOf("week").startOf("day").toISOString();
      end_date = dayjs().endOf("day").toISOString();
      break;
    case "this_month":
      start_date = dayjs().startOf("month").startOf("day").toISOString();
      end_date = dayjs().endOf("day").toISOString();
      break;
    default:
      if (start && end) {
        start_date = dayjs(start).startOf("day").toISOString();
        end_date = dayjs(end).endOf("day").toISOString();
      }
      break;
  }

  return start_date && end_date ? { start_date, end_date } : {};
};
