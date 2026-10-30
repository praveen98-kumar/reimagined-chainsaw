import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type {
  TransferSevadar,
  TransferType,
} from "@/shared/interfaces/transfer";

type PrimitiveValue = string | number | boolean | null | undefined;

export type ActiveTab = "manage" | "transfer";

export interface TransferState {
  type: TransferType;
  searching: boolean;
  fromMobile: string;
  toMobile: string;
  fromUser: TransferSevadar | null;
  toUser: TransferSevadar | null;
}

const INITIAL_TRANSFER: TransferState = {
  type: "seva",
  searching: false,
  fromMobile: "",
  toMobile: "",
  fromUser: null,
  toUser: null,
};

interface Actions {
  setFilters: (payload: Record<string, PrimitiveValue>) => void;
  resetFilters: () => void;
  triggerSearch: () => void;
  setSelectedPlatformId: (id: number | null) => void;
  setFilterCollapsed: (collapsed: boolean) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setTransfer: (payload: Partial<TransferState>) => void;
  resetTransfer: () => void;
}

interface State {
  filters: Record<string, PrimitiveValue>;
  searchTrigger: number;
  selectedPlatformId: number | null;
  filterCollapsed: boolean;
  activeTab: ActiveTab;
  transfer: TransferState;
  actions: Actions;
}

const selectFilters = (s: State) => s.filters;
const selectSearchTrigger = (s: State) => s.searchTrigger;
const selectSelectedPlatformId = (s: State) => s.selectedPlatformId;
const selectFilterCollapsed = (s: State) => s.filterCollapsed;
const selectFilterActions = (s: State) => s.actions;
const selectActiveTab = (s: State) => s.activeTab;
const selectTransfer = (s: State) => s.transfer;

export const useFilterStore = create<State>()((set, get) => ({
  filters: {},
  searchTrigger: 0,
  selectedPlatformId: null,
  filterCollapsed: false,
  activeTab: "manage",
  transfer: INITIAL_TRANSFER,
  actions: {
    setFilters: (payload) => {
      const prevFilters = get().filters;
      set({ filters: { ...prevFilters, ...payload } });
    },
    resetFilters: () =>
      set({
        filters: {},
        searchTrigger: 0,
        selectedPlatformId: null,
        filterCollapsed: false,
        activeTab: "manage",
        transfer: INITIAL_TRANSFER,
      }),
    triggerSearch: () =>
      set((state) => ({ searchTrigger: state.searchTrigger + 1 })),
    setSelectedPlatformId: (id) => set({ selectedPlatformId: id }),
    setFilterCollapsed: (collapsed) => set({ filterCollapsed: collapsed }),
    setActiveTab: (tab) => set({ activeTab: tab }),
    setTransfer: (payload) =>
      set((state) => ({ transfer: { ...state.transfer, ...payload } })),
    resetTransfer: () => set({ transfer: INITIAL_TRANSFER }),
  },
}));

export const useFilters = () => useFilterStore(useShallow(selectFilters));
export const useSearchTrigger = () =>
  useFilterStore(useShallow(selectSearchTrigger));
export const useSelectedPlatformId = () =>
  useFilterStore(useShallow(selectSelectedPlatformId));
export const useFilterCollapsed = () => useFilterStore(selectFilterCollapsed);
export const useFilterActions = () =>
  useFilterStore(useShallow(selectFilterActions));
export const useActiveTab = () => useFilterStore(selectActiveTab);
export const useTransfer = () => useFilterStore(useShallow(selectTransfer));
