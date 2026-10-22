import dayjs from "dayjs";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TCount } from "@/redux/features/countSlice";

export interface CountStatus {
  counts: Record<string, number | string>;
  date: string;
  role: string;
  country_id?: number;
  state_id?: number;
  district_id?: number;
  division_id?: number;
  tehsil_id?: number;
  city_id?: number;
  first_order_id?: number;
  first_accepted_order_date?: string;
}

type UpdateCountKeyType = keyof Pick<
  CountStatus,
  | "country_id"
  | "state_id"
  | "district_id"
  | "division_id"
  | "tehsil_id"
  | "city_id"
>;

export interface CountState {
  data: Partial<Record<TCount, Array<CountStatus>>>;
  add: (type: TCount, payload: CountStatus) => void;
  getCount: (
    type: TCount,
    key: UpdateCountKeyType,
    locationId: number,
    activeRole: string
  ) => Partial<CountStatus>;
  upsert: (
    type: TCount,
    filterKey: UpdateCountKeyType,
    payload: Partial<CountStatus>
  ) => void;
  update: (
    type: TCount,
    filterKey: UpdateCountKeyType,
    payload: Partial<CountStatus>,
    upsert?: boolean
  ) => void;
}

const skipCountKeys = ["first_accepted_order_date", "first_order_id"];

export const useCount = create<CountState>()(
  persist(
    (set, get) => ({
      data: {
        bookOrderCounts: [],
        bookCallingCounts: [],
        bookDeliveryCounts: [],
        jyadaRuchiCounts: [],
        missCallCounts: [],
        incorrectCounts: [],
        sincorrectCounts: [],
        duplicateCounts: [],
        socialMediaCounts: [],
      },
      getCount: (type: TCount, key, locationId, activeRole) => {
        const data = { ...get().data };
        const found = data[type]?.find(
          (t) => t[key] == locationId && t.role == activeRole
        );
        return found ?? {};
      },
      add: (type, payload) => {
        const data = { ...get().data };
        data[type]?.push(payload);
        set({ data });
      },
      upsert: (type, key, payload) => {
        const t = get().data?.[type];
        const data = t?.map((item) =>
          item[key] === payload[key] && item.role === payload.role
            ? { ...item, ...payload, date: dayjs().format("DD-MM-YYYY") }
            : item
        );
        set({ data: { ...get().data, [type]: data } });
      },
      update: async (type, key, payload, upsert = false) => {
        const t = get().data?.[type];
        const data = t?.map((item) => {
          if (item[key] == payload[key] && item.role === payload.role) {
            const { counts: c, date, ...rest } = payload;
            const counts = Object.entries(item.counts).reduce((a, [k, v]) => {
              if (
                payload.counts?.[k] != undefined &&
                !skipCountKeys.includes(key)
              ) {
                return {
                  ...a,
                  [k]: upsert
                    ? Number(payload.counts[k])
                    : Math.max(0, Number(payload.counts[k]) + Number(v)),
                };
              } else {
                return { ...a, [k]: v };
              }
            }, {});
            return {
              ...item,
              ...rest,
              counts,
              date: dayjs().format("DD-MM-YYYY"),
            };
          } else {
            return item;
          }
        });
        set({ data: { ...get().data, [type]: data } });
      },
    }),
    {
      name: "count-store",
    }
  )
);
