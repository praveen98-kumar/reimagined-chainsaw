import dayjs from "dayjs";

type DayFilter =
  | "today"
  | "yesturday"
  | "this_week"
  | "this_month"
  | "last_month";

export const getDateFilters = (day_filter: DayFilter | string) => {
  let start, end: undefined | string;

  switch (day_filter) {
    case "today":
      start = dayjs().startOf("day").toISOString();
      end = dayjs().endOf("day").toISOString();
      break;
    case "yesterday":
      start = dayjs().subtract(1, "day").startOf("day").toISOString();
      end = dayjs().subtract(1, "day").endOf("day").toISOString();
      break;
    case "this_week":
      start = dayjs().startOf("week").startOf("day").toISOString();
      end = dayjs().endOf("day").toISOString();
      break;
    case "this_month":
      start = dayjs().startOf("month").startOf("day").toISOString();
      end = dayjs().endOf("day").toISOString();
      break;
    case "last_month":
      start = dayjs()
        .subtract(1, "month")
        .startOf("month")
        .startOf("day")
        .toISOString();
      end = dayjs()
        .subtract(1, "month")
        .endOf("month")
        .endOf("day")
        .toISOString();
      break;
    default:
      break;
  }

  return { day_filter, start, end };
};
