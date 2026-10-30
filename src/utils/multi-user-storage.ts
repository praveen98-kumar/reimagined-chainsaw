import type {
  GroupPermission,
  Permission,
  Region,
  User,
} from "@/shared/interfaces/user";

export interface StoredUser {
  id: number;
  disciple_id: number;
  user: User;
  token: string;
  active_permission: Permission | null;
  active_region_index: number;
  all_permission?: GroupPermission;
  active_region: Region | null;
  seva_regions?: Record<string, Region>;
  login_time: string;
  mobile_no: string;
  name: string;
}

export const MAX_USERS = 10;
const USERS_LIST_KEY = "users_list";
const ACTIVE_USER_ID_KEY = "active_user_id";

/**
 * Migrates old single-user localStorage structure to new multi-user structure
 */
export const migrateOldStorage = (): void => {
  if (typeof window === "undefined") return;

  // Check if migration already done
  if (localStorage.getItem(USERS_LIST_KEY)) return;

  // Check if old structure exists
  const oldUser = localStorage.getItem("user");
  const oldToken = localStorage.getItem("token");
  const oldActivePermission = localStorage.getItem("active_permission");
  const oldActiveRegionIndex = localStorage.getItem("active_region_index");

  if (oldUser && oldToken) {
    try {
      const parsedUser: User = JSON.parse(oldUser);
      const parsedPermission = oldActivePermission
        ? JSON.parse(oldActivePermission)
        : null;
      const regionIndex = oldActiveRegionIndex
        ? JSON.parse(oldActiveRegionIndex)
        : 0;

      // Get all_permission from old structure if exists
      let oldAllPermission: GroupPermission | undefined;
      const allPermissionStr = localStorage.getItem("all_permission");
      if (allPermissionStr) {
        try {
          oldAllPermission = JSON.parse(allPermissionStr);
        } catch (_e) {
          // Ignore parse errors
        }
      }

      const storedUser: StoredUser = {
        id: parsedUser.id,
        disciple_id: parsedUser.disciple_id,
        user: parsedUser,
        token: oldToken,
        active_permission: parsedPermission,
        active_region_index: regionIndex,
        all_permission: oldAllPermission,
        active_region: null,
        seva_regions: {},
        login_time: new Date().toISOString(),
        mobile_no: parsedUser.mobile_no,
        name: parsedUser.disciple?.name || parsedUser.mobile_no,
      };

      // Save to new structure
      localStorage.setItem(USERS_LIST_KEY, JSON.stringify([storedUser]));
      localStorage.setItem(
        ACTIVE_USER_ID_KEY,
        parsedUser.disciple_id.toString(),
      );

      // Clean up old keys (optional - keep for backward compatibility temporarily)
      // localStorage.removeItem("user");
      // localStorage.removeItem("token");
      // localStorage.removeItem("active_permission");
      // localStorage.removeItem("active_region_index");
    } catch (error) {
      console.error("Error migrating old storage:", error);
    }
  }
};

/**
 * Gets all stored users
 */
export const getUsersList = (): StoredUser[] => {
  if (typeof window === "undefined") return [];

  migrateOldStorage(); // Ensure migration on first access

  try {
    const usersListStr = localStorage.getItem(USERS_LIST_KEY);
    return usersListStr ? JSON.parse(usersListStr) : [];
  } catch (error) {
    console.error("Error reading users list:", error);
    return [];
  }
};

/**
 * Gets the active user ID
 */
export const getActiveUserId = (): number | null => {
  if (typeof window === "undefined") return null;

  migrateOldStorage(); // Ensure migration on first access

  try {
    const activeUserIdStr = localStorage.getItem(ACTIVE_USER_ID_KEY);
    if (activeUserIdStr) {
      return parseInt(activeUserIdStr, 10);
    }

    // If no active user ID, try to get from users list (first user)
    const users = getUsersList();
    if (users.length > 0) {
      return users[0].disciple_id;
    }

    return null;
  } catch (error) {
    console.error("Error reading active user ID:", error);
    return null;
  }
};

/**
 * Gets the active user
 */
export const getActiveUser = (): StoredUser | null => {
  const activeUserId = getActiveUserId();
  if (!activeUserId) return null;

  const users = getUsersList();
  return users.find((u) => u.disciple_id === activeUserId) || null;
};

/**
 * Adds or updates a user in the users list
 */
export const addOrUpdateUser = (
  user: User,
  active_permission: Permission | null,
  active_region_index: number = 0,
  all_permission?: GroupPermission,
): StoredUser => {
  const users = getUsersList();
  const userIndex = users.findIndex(
    (u) => u.mobile_no === user.mobile_no && u.id === user.id,
  );

  const storedUser: StoredUser = {
    id: user.id,
    disciple_id: user.disciple_id,
    user,
    token: user.token,
    active_permission,
    active_region_index,
    active_region: null,
    all_permission: all_permission,
    seva_regions: userIndex >= 0 ? (users[userIndex].seva_regions ?? {}) : {},
    login_time: new Date().toISOString(),
    mobile_no: user.mobile_no,
    name: user.disciple?.name || user.mobile_no,
  };

  if (userIndex >= 0) {
    // Update existing user, preserve existing all_permission if not provided
    if (!all_permission && users[userIndex].all_permission) {
      storedUser.all_permission = users[userIndex].all_permission;
    }
    users[userIndex] = storedUser;
  } else {
    // Add new user
    if (users.length >= MAX_USERS) {
      // Remove oldest user (FIFO)
      users.shift();
    }
    users.push(storedUser);
  }

  localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
  setActiveUserId(user.disciple_id);

  return storedUser;
};

/**
 * Sets the active user ID
 */
export const setActiveUserId = (userId: number): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_USER_ID_KEY, userId.toString());
};

/**
 * Removes a user from the users list
 */
export const removeUser = (userId: number): boolean => {
  const users = getUsersList();
  const initialLength = users.length;
  const filteredUsers = users.filter((u) => u.disciple_id !== userId);

  if (filteredUsers.length < initialLength) {
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(filteredUsers));

    // If removed user was active, switch to another user or clear
    const activeUserId = getActiveUserId();
    if (activeUserId === userId) {
      if (filteredUsers.length > 0) {
        // Switch to most recent user
        const mostRecent = filteredUsers.reduce((latest, current) => {
          return new Date(current.login_time) > new Date(latest.login_time)
            ? current
            : latest;
        });
        setActiveUserId(mostRecent.disciple_id);
      } else {
        // No users left
        localStorage.removeItem(ACTIVE_USER_ID_KEY);
      }
    }

    return true;
  }

  return false;
};

/**
 * Updates active permission for the active user
 */
export const updateActiveUserPermission = (
  permission: Permission | null,
): void => {
  const activeUser = getActiveUser();
  if (!activeUser) return;

  const users = getUsersList();
  const userIndex = users.findIndex(
    (u) => u.disciple_id === activeUser.disciple_id,
  );

  if (userIndex >= 0) {
    users[userIndex].active_permission = permission;
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
  }
};

/**
 * Updates active region index for the active user
 */
export const updateActiveUserRegion = (region: Region | null): void => {
  const activeUser = getActiveUser();
  if (!activeUser) return;

  const users = getUsersList();
  const userIndex = users.findIndex(
    (u) => u.disciple_id === activeUser.disciple_id,
  );

  if (userIndex >= 0) {
    users[userIndex].active_region = region;
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
  }
};

/**
 * Updates the per-level region selections for the active user
 */
export const updateActiveUserSevaRegions = (
  sevaRegions: Record<string, Region>,
): void => {
  const activeUser = getActiveUser();
  if (!activeUser) return;

  const users = getUsersList();
  const userIndex = users.findIndex(
    (u) => u.disciple_id === activeUser.disciple_id,
  );

  if (userIndex >= 0) {
    users[userIndex].seva_regions = sevaRegions;
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
  }
};

/**
 * Updates active region index for the active user
 */
export const updateActiveUserRegionIndex = (regionIndex: number): void => {
  const activeUser = getActiveUser();
  if (!activeUser) return;

  const users = getUsersList();
  const userIndex = users.findIndex(
    (u) => u.disciple_id === activeUser.disciple_id,
  );

  if (userIndex >= 0) {
    users[userIndex].active_region_index = regionIndex;
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
  }
};

/**
 * Updates user data for the active user
 */
export const updateActiveUser = (user: Partial<User>): void => {
  const activeUser = getActiveUser();
  if (!activeUser) return;

  const users = getUsersList();
  const userIndex = users.findIndex(
    (u) => u.disciple_id === activeUser.disciple_id,
  );

  if (userIndex >= 0) {
    users[userIndex].user = { ...users[userIndex].user, ...user };
    if (user.token) {
      users[userIndex].token = user.token;
    }
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
  }
};

/**
 * Updates all_permission for the active user
 */
export const updateActiveUserAllPermission = (
  all_permission: GroupPermission,
): void => {
  const activeUser = getActiveUser();
  if (!activeUser) return;

  const users = getUsersList();
  const userIndex = users.findIndex(
    (u) => u.disciple_id === activeUser.disciple_id,
  );

  if (userIndex >= 0) {
    users[userIndex].all_permission = all_permission;
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
  }
};

/**
 * Clears all users (used for complete logout)
 */
export const clearAllUsers = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USERS_LIST_KEY);
  localStorage.removeItem(ACTIVE_USER_ID_KEY);
};

/**
 * Gets the count of logged-in users
 */
export const getUsersCount = (): number => {
  return getUsersList().length;
};

/**
 * Checks if user exists in the list
 */
export const userExists = (
  mobileNo: string | number,
  userId?: number,
): boolean => {
  const users = getUsersList();
  return users.some(
    (u) =>
      u.mobile_no === mobileNo.toString() ||
      u.id === userId ||
      u.disciple_id === userId,
  );
};
