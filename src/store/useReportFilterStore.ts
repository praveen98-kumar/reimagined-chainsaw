import { create } from "zustand";

interface FilterState {
  start?: string; //start_date
  end?: string; //end_date
  report_type: string;
  sevadar_level: string;
  day_filter?: string;
  country?: number;
  state?: number;
  division?: number;
  district?: number;
  tehsil?: number;
  [k: string]: unknown;
}

interface FilterActions {
  setFilters: (filter: Partial<FilterState>) => void;
}

interface FilterStore extends FilterState {
  actions: FilterActions;
}

export const useReportFilterStore = create<FilterStore>()((set) => ({
  report_type: "sevadar",
  sevadar_level: "region",
  actions: {
    setFilters: (filters) => set((old) => ({ ...old, ...filters })),
  },
}));

export const useReportFilterStoreActions = () => useReportFilterStore().actions;
