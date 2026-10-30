import { create } from "zustand";
import { SEED_PLATFORMS } from "../_constants/manage-platforms.constants";
import type { Platform } from "../_types/manage-platforms.types";

export const createPlatformId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `p-${Date.now()}`;

interface MockPlatformActions {
  addPlatform: (platform: Platform) => void;
  updatePlatform: (id: string, platform: Platform) => void;
  removePlatform: (id: string) => void;
}

interface MockPlatformState {
  platforms: Platform[];
  actions: MockPlatformActions;
}

export const useMockPlatformStore = create<MockPlatformState>()((set) => ({
  platforms: SEED_PLATFORMS,
  actions: {
    addPlatform: (platform) =>
      set((state) => ({ platforms: [platform, ...state.platforms] })),
    updatePlatform: (id, platform) =>
      set((state) => ({
        platforms: state.platforms.map((item) =>
          item.id === id ? platform : item,
        ),
      })),
    removePlatform: (id) =>
      set((state) => ({
        platforms: state.platforms.filter((item) => item.id !== id),
      })),
  },
}));
