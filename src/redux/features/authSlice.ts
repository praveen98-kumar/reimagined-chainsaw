import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  GroupPermission,
  Permission,
  Region,
  RoleLevel,
  User,
} from "@/shared/interfaces/user";

import {
  getSevaRegionKey,
  getSevaRegionLevels,
  migrateSevaRegionsToGroup,
  parseSevaRegionKey,
  seedGroupLocation,
  type ActiveLocation,
  type LocationSelection,
} from "@/shared/functions/seva-region";

import {
  addOrUpdateUser,
  getActiveUser,
  removeUser as removeUserFromStorage,
  setActiveUserId,
  updateActiveUserAllPermission,
  updateActiveUser as updateActiveUserInStorage,
  updateActiveUserGroupLocations,
  updateActiveUserPermission,
  updateActiveUserRegionIndex,
  updateActiveUserRegion,
  updateActiveUserSevaRegions,
} from "@/utils/multi-user-storage";

interface IState {
  user: User | null;
  active_permission: Permission | null;
  all_permission: GroupPermission;
  active_region_index: number;
  active_region: Region | null;
  seva_regions: Record<string, Region>;
  group_locations: Record<string, ActiveLocation>;
  /**
   * False until the stored session has been loaded into the store (see
   * `hydrateAuth`). Lets the UI tell "not loaded yet" apart from "logged out".
   */
  hydrated: boolean;
}

export type StoredAuth = Omit<IState, "hydrated">;

interface SetPermissionAction {
  payload: Permission | null;
  type: string;
}

interface SetActiveLocationAction {
  payload: LocationSelection;
  type: string;
}

const emptyAllPermission = (): GroupPermission => ({
  group: "",
  permissions: [],
  roles: [],
});

const readGlobalAllPermission = (): GroupPermission | null => {
  const allPermissionStr = localStorage.getItem("all_permission");
  if (!allPermissionStr) return null;
  try {
    return JSON.parse(allPermissionStr);
  } catch {
    return null;
  }
};

/**
 * Reads the active user's session from multi-user storage (localStorage).
 *
 * Browser-only. It must NOT run while the store is created: the server has no
 * localStorage, so reading it at module load made the first client render
 * differ from the server HTML (hydration mismatch). Instead the store starts
 * empty everywhere and the app dispatches `hydrateAuth(loadStoredAuth())`
 * once mounted — see `src/app/providers.tsx` and `src/pages/_app.tsx`.
 */
export function loadStoredAuth(): StoredAuth {
  let user: User | null = null;
  let active_permission: Permission | null = null;
  let active_region_index = 0;
  let active_region: Region | null = null;
  let seva_regions: Record<string, Region> = {};
  let group_locations: Record<string, ActiveLocation> = {};
  let all_permission = emptyAllPermission();

  const activeUserData = getActiveUser();
  if (activeUserData) {
    user = activeUserData.user;
    active_permission = activeUserData.active_permission;
    active_region_index = activeUserData.active_region_index;
    active_region = activeUserData.active_region;
    seva_regions = activeUserData.seva_regions ?? {};
    group_locations = activeUserData.group_locations ?? {};
  }
  // Prefer the active user's copy; fall back to the global key for backward
  // compatibility.
  all_permission =
    activeUserData?.all_permission ??
    readGlobalAllPermission() ??
    all_permission;

  seva_regions = migrateSevaRegionsToGroup(
    seva_regions,
    all_permission.group,
    getSevaRegionLevels(user, all_permission),
  );

  group_locations = seedGroupLocation(
    group_locations,
    all_permission.group,
    all_permission.roles,
    active_permission,
    active_region,
  );

  return {
    user,
    active_permission,
    all_permission,
    active_region_index,
    active_region,
    seva_regions,
    group_locations,
  };
}

// Identical on the server and the client; filled in by `hydrateAuth`.
const initialState: IState = {
  user: null,
  active_permission: null,
  all_permission: emptyAllPermission(),
  active_region_index: 0,
  active_region: null,
  seva_regions: {},
  group_locations: {},
  hydrated: false,
};

interface UpdateRoleAction {
  payload: RoleLevel;
  type: string;
}

interface LoginAction {
  payload: User[]; // Omit<IState, "all_permission" | "active_region_index">;
  type: string;
}

interface SwitchUserAction {
  payload: number; // disciple_id
  type: string;
}

interface RemoveUserAction {
  payload: number; // disciple_id
  type: string;
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateAuth: (_state: IState, action: PayloadAction<StoredAuth>) => ({
      ...action.payload,
      hydrated: true,
    }),
    login: (state: IState, action: LoginAction) => {
      // const { user, active_permission } = action.payload;
      const active_region_index = 0;

      // Preserve existing all_permission or use from state
      const existingAllPermission = state.all_permission.group
        ? state.all_permission
        : undefined;

      // Add or update user in multi-user storage
      // if(user) {
      //     addOrUpdateUser(user, active_permission, active_region_index, existingAllPermission);
      // }
      const currentActivePermission =
        [...action.payload[0].permission].filter(
          (r) => r["role_id"] === action.payload[0].active_role,
        )[0] ?? null;
      let storedSevaRegions: Record<string, Region> = {};
      let storedGroupLocations: Record<string, ActiveLocation> = {};

      for (const [index, user] of action.payload.entries()) {
        const activePermission =
          [...user.permission].filter(
            (r) => r["role_id"] === user.active_role,
          )[0] ?? null;
        const storedUser = addOrUpdateUser(
          user,
          activePermission,
          active_region_index,
          existingAllPermission,
        );

        if (index === 0) {
          storedSevaRegions = storedUser.seva_regions ?? {};
          storedGroupLocations = storedUser.group_locations ?? {};
        }
      }

      // Update state with active user data
      state.user = action.payload[0];
      state.active_permission = currentActivePermission;
      state.active_region_index = active_region_index;
      state.active_region = null;
      state.seva_regions = storedSevaRegions;
      state.group_locations = storedGroupLocations;
    },
    switchUser: (state: IState, action: SwitchUserAction) => {
      const discipleId = action.payload;

      // Set active user ID
      setActiveUserId(discipleId);

      // Get the switched user data
      const switchedUser = getActiveUser();
      if (switchedUser) {
        state.user = switchedUser.user;
        state.active_permission = switchedUser.active_permission;
        state.active_region_index = switchedUser.active_region_index;
        state.active_region = switchedUser.active_region;
        state.seva_regions = switchedUser.seva_regions ?? {};
        state.group_locations = switchedUser.group_locations ?? {};
        // Sync all_permission from switched user
        if (switchedUser.all_permission) {
          state.all_permission = switchedUser.all_permission;
        }
        state.seva_regions = migrateSevaRegionsToGroup(
          state.seva_regions,
          state.all_permission.group,
          getSevaRegionLevels(state.user, state.all_permission),
        );
        updateActiveUserSevaRegions(state.seva_regions);
        updateActiveUserGroupLocations(state.group_locations);
      }
    },
    removeUser: (state: IState, action: RemoveUserAction) => {
      const discipleId = action.payload;
      const wasRemoved = removeUserFromStorage(discipleId);

      if (wasRemoved) {
        // Get the new active user (if any)
        const activeUserData = getActiveUser();
        if (activeUserData) {
          state.user = activeUserData.user;
          state.active_permission = activeUserData.active_permission;
          state.active_region_index = activeUserData.active_region_index;
          state.active_region = activeUserData.active_region;
          state.seva_regions = activeUserData.seva_regions ?? {};
          state.group_locations = activeUserData.group_locations ?? {};
          // Sync all_permission from active user
          if (activeUserData.all_permission) {
            state.all_permission = activeUserData.all_permission;
          }
          state.seva_regions = migrateSevaRegionsToGroup(
            state.seva_regions,
            state.all_permission.group,
            getSevaRegionLevels(state.user, state.all_permission),
          );
          updateActiveUserSevaRegions(state.seva_regions);
          updateActiveUserGroupLocations(state.group_locations);
        } else {
          // No users left
          state.user = null;
          state.active_permission = null;
          state.active_region_index = 0;
          state.active_region = null;
          state.seva_regions = {};
          state.group_locations = {};
          state.all_permission = {
            group: "",
            permissions: [],
            roles: [],
          };
        }
      }
    },
    setActiveUser: (state: IState, action: SwitchUserAction) => {
      const discipleId = action.payload;
      setActiveUserId(discipleId);

      const activeUserData = getActiveUser();
      if (activeUserData) {
        state.user = activeUserData.user;
        state.active_permission = activeUserData.active_permission;
        state.active_region_index = activeUserData.active_region_index;
        state.active_region = activeUserData.active_region;
        state.seva_regions = activeUserData.seva_regions ?? {};
        state.group_locations = activeUserData.group_locations ?? {};
        if (activeUserData.all_permission) {
          state.all_permission = activeUserData.all_permission;
        }
      }
    },
    syncActiveUser: (state: IState) => {
      // Sync Redux state with active user from multi-user storage
      state.hydrated = true;
      const activeUserData = getActiveUser();
      if (activeUserData) {
        state.user = activeUserData.user;
        state.active_permission = activeUserData.active_permission;
        state.active_region_index = activeUserData.active_region_index;
        state.active_region = activeUserData.active_region;
        state.seva_regions = activeUserData.seva_regions ?? {};
        state.group_locations = activeUserData.group_locations ?? {};
        // Sync all_permission from active user
        if (activeUserData.all_permission) {
          state.all_permission = activeUserData.all_permission;
        } else {
          // Fallback to global localStorage for backward compatibility
          const allPermissionStr = localStorage.getItem("all_permission");
          if (allPermissionStr) {
            try {
              state.all_permission = JSON.parse(allPermissionStr);
            } catch (e) {
              // Keep existing
            }
          }
        }
        state.seva_regions = migrateSevaRegionsToGroup(
          state.seva_regions,
          state.all_permission.group,
          getSevaRegionLevels(state.user, state.all_permission),
        );
        updateActiveUserSevaRegions(state.seva_regions);

        state.group_locations = seedGroupLocation(
          state.group_locations,
          state.all_permission.group,
          state.all_permission.roles,
          state.active_permission,
          state.active_region,
        );
        updateActiveUserGroupLocations(state.group_locations);
      } else {
        // No active user, clear state
        state.user = null;
        state.active_permission = null;
        state.active_region_index = 0;
        state.active_region = null;
        state.seva_regions = {};
        state.group_locations = {};
      }
      return state;
    },
    updateAuthState: (
      state: IState,
      action: { payload: Partial<IState>; type: string },
    ) => {
      state = { ...state, ...action.payload };
      return state;
    },
    setActivePermission: (state: IState, action: SetPermissionAction) => {
      state.active_permission = action.payload;
      updateActiveUserPermission(action.payload);
      return state;
    },
    setActiveRegion: (
      state: IState,
      action: { payload: Region | null; type: string },
    ) => {
      state.active_region = action.payload;
      updateActiveUserRegion(action.payload);
      return state;
    },
    setActiveLocation: (state: IState, action: SetActiveLocationAction) => {
      const { permission, region, regionIndex, selections } = action.payload;

      state.active_permission = permission;
      state.active_region = region;
      state.active_region_index = regionIndex;

      for (const selection of selections) {
        state.seva_regions[
          getSevaRegionKey(
            state.all_permission.group,
            selection.seva,
            selection.roleRegion,
          )
        ] = selection.region;
      }

      // Remember the pick at group level as well. A location can only be
      // stored for the sevas that actually have it, so the per-seva records
      // alone are ambiguous when a group contains sevas with different
      // locations.
      const roleRegion = permission.role_region || selections[0]?.roleRegion;
      if (roleRegion) {
        state.group_locations = {
          ...state.group_locations,
          [state.all_permission.group ?? ""]: { roleRegion, region },
        };
      }

      updateActiveUserPermission(permission);
      updateActiveUserRegion(region);
      updateActiveUserRegionIndex(regionIndex);
      updateActiveUserSevaRegions(state.seva_regions);
      updateActiveUserGroupLocations(state.group_locations);

      return state;
    },
    setActiveRegionIndex: (
      state: IState,
      action: { payload: number; type: string },
    ) => {
      state.active_region_index = action.payload;
      updateActiveUserRegionIndex(action.payload);
      return state;
    },
    setUserPermission: (
      state: IState,
      action: { payload: Permission[]; type: string },
    ) => {
      if (state.user) {
        state.user = { ...state.user, permission: action.payload };
        updateActiveUserInStorage({ permission: action.payload });
      }
      return state;
    },

    updateRole: (state: IState, action: UpdateRoleAction) => {
      if (state.user !== null) {
        const permissions = state.user.permission
          .filter((p) => action.payload.roles?.includes(p.role_id))
          .map((p) => p.permissions);
        let permission1: string[] = [];
        for (let i = 0; i < permissions.length; i++) {
          permission1 = permission1.concat(permissions[i]);
        }

        const allPermission = {
          group: action.payload.group,
          roles: action.payload.roles,
          permissions: [...new Set(permission1)],
        };

        // Update in multi-user storage for active user
        updateActiveUserAllPermission(allPermission);

        // Also keep in global localStorage for backward compatibility
        localStorage.setItem("all_permission", JSON.stringify(allPermission));

        state.all_permission = {
          ...state.all_permission,
          ...action.payload,
          permissions: [...new Set(permission1)],
        };

        // Move legacy selections into the newly selected sidebar group and
        // drop only that group's seva levels that are no longer available.
        // Other groups keep their own location selections.
        const sevaLevels = getSevaRegionLevels(state.user, allPermission);
        state.seva_regions = migrateSevaRegionsToGroup(
          state.seva_regions,
          action.payload.group,
          sevaLevels,
        );

        const activeGroup = action.payload.group ?? "";

        state.seva_regions = Object.fromEntries(
          Object.entries(state.seva_regions).filter(([key]) => {
            const parsed = parseSevaRegionKey(key);

            if (!parsed || parsed.group !== activeGroup) return true;

            // Legacy keys are kept until a later auth sync can expand them.
            if (!parsed.seva) return true;

            return sevaLevels[parsed.seva]?.has(parsed.roleRegion) ?? false;
          }),
        );
        updateActiveUserSevaRegions(state.seva_regions);

        // A picker selection made before the sidebar group was resolved is
        // stored under the empty group. Move it to the resolved group, the
        // same way legacy seva selections are migrated above.
        const unresolvedLocation = state.group_locations[""];
        if (
          activeGroup &&
          unresolvedLocation &&
          !state.group_locations[activeGroup]
        ) {
          state.group_locations[activeGroup] = unresolvedLocation;
          delete state.group_locations[""];
          updateActiveUserGroupLocations(state.group_locations);
        }

        return state;
      }
    },
  },
});

export const {
  hydrateAuth,
  login,
  updateAuthState,
  setActivePermission,
  updateRole,
  setUserPermission,
  setActiveRegionIndex,
  switchUser,
  removeUser,
  setActiveUser,
  syncActiveUser,
  setActiveRegion,
  setActiveLocation,
} = authSlice.actions;
export default authSlice.reducer;
