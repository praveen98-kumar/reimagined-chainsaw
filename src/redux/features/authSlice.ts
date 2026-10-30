import { createSlice } from "@reduxjs/toolkit";
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
  type LocationSelection,
} from "@/shared/functions/seva-region";

import {
  addOrUpdateUser,
  getActiveUser,
  removeUser as removeUserFromStorage,
  setActiveUserId,
  updateActiveUserAllPermission,
  updateActiveUser as updateActiveUserInStorage,
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
}

interface SetPermissionAction {
  payload: Permission | null;
  type: string;
}

interface SetActiveLocationAction {
  payload: LocationSelection;
  type: string;
}

// Initialize state from active user in multi-user storage
let user = null;
let active_permission = null;
let active_region_index = 0;
let active_region = null;
let seva_regions: Record<string, Region> = {};
let all_permission: GroupPermission = {
  group: "",
  permissions: [],
  roles: [],
};

if (typeof window !== "undefined") {
  const activeUserData = getActiveUser();
  if (activeUserData) {
    user = activeUserData.user;
    active_permission = activeUserData.active_permission;
    active_region_index = activeUserData.active_region_index;
    active_region = activeUserData.active_region;
    seva_regions = activeUserData.seva_regions ?? {};
    // Get all_permission from active user's stored data
    if (activeUserData.all_permission) {
      all_permission = activeUserData.all_permission;
    } else {
      // Fallback to global localStorage for backward compatibility
      const allPermissionStr = localStorage.getItem("all_permission");
      if (allPermissionStr) {
        try {
          all_permission = JSON.parse(allPermissionStr);
        } catch (e) {
          // Keep default
        }
      }
    }
  } else {
    // Fallback to global localStorage if no active user
    const allPermissionStr = localStorage.getItem("all_permission");
    if (allPermissionStr) {
      try {
        all_permission = JSON.parse(allPermissionStr);
      } catch (e) {
        // Keep default
      }
    }
  }
}

seva_regions = migrateSevaRegionsToGroup(
  seva_regions,
  all_permission.group,
  getSevaRegionLevels(user, all_permission),
);

const initialState: IState = {
  user,
  active_permission,
  all_permission,
  active_region_index,
  active_region,
  seva_regions,
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
        }
      }

      // Update state with active user data
      state.user = action.payload[0];
      state.active_permission = currentActivePermission;
      state.active_region_index = active_region_index;
      state.active_region = null;
      state.seva_regions = storedSevaRegions;
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
        } else {
          // No users left
          state.user = null;
          state.active_permission = null;
          state.active_region_index = 0;
          state.active_region = null;
          state.seva_regions = {};
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
        if (activeUserData.all_permission) {
          state.all_permission = activeUserData.all_permission;
        }
      }
    },
    syncActiveUser: (state: IState) => {
      // Sync Redux state with active user from multi-user storage
      const activeUserData = getActiveUser();
      if (activeUserData) {
        state.user = activeUserData.user;
        state.active_permission = activeUserData.active_permission;
        state.active_region_index = activeUserData.active_region_index;
        state.active_region = activeUserData.active_region;
        state.seva_regions = activeUserData.seva_regions ?? {};
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
      } else {
        // No active user, clear state
        state.user = null;
        state.active_permission = null;
        state.active_region_index = 0;
        state.active_region = null;
        state.seva_regions = {};
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

      updateActiveUserPermission(permission);
      updateActiveUserRegion(region);
      updateActiveUserRegionIndex(regionIndex);
      updateActiveUserSevaRegions(state.seva_regions);

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

        return state;
      }
    },
  },
});

export const {
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
