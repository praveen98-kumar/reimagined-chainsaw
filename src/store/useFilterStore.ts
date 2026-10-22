import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

type PrimitiveValue = string | number | boolean | null | undefined;

interface Actions {
  setFilters: (payload: Record<string, PrimitiveValue>) => void;
  resetFilters: () => void;
  triggerSearch: () => void;
  setSelectedPlatformId: (id: number | null) => void;
  setFilterCollapsed: (collapsed: boolean) => void;
}

interface State {
  filters: Record<string, PrimitiveValue>;
  searchTrigger: number;
  selectedPlatformId: number | null;
  filterCollapsed: boolean;
  actions: Actions;
}

const selectFilters = (s: State) => s.filters;
const selectSearchTrigger = (s: State) => s.searchTrigger;
const selectSelectedPlatformId = (s: State) => s.selectedPlatformId;
const selectFilterCollapsed = (s: State) => s.filterCollapsed;
const selectFilterActions = (s: State) => s.actions;

export const useFilterStore = create<State>()((set, get) => ({
  filters: {},
  searchTrigger: 0,
  selectedPlatformId: null,
  filterCollapsed: false,
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
      }),
    triggerSearch: () =>
      set((state) => ({ searchTrigger: state.searchTrigger + 1 })),
    setSelectedPlatformId: (id) => set({ selectedPlatformId: id }),
    setFilterCollapsed: (collapsed) => set({ filterCollapsed: collapsed }),
  },
}));

export const useFilters = () => useFilterStore(useShallow((s) => s.filters));
export const useSearchTrigger = () =>
  useFilterStore(useShallow((s) => s.searchTrigger));
export const useSelectedPlatformId = () =>
  useFilterStore(useShallow((s) => s.selectedPlatformId));
export const useFilterCollapsed = () =>
  useFilterStore((s) => s.filterCollapsed);
export const useFilterActions = () =>
  useFilterStore(useShallow((s) => s.actions));
