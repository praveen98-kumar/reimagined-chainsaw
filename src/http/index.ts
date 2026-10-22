import axios from "axios";
import {
  getActiveUser,
  getActiveUserId,
  getUsersList,
  removeUser,
} from "@/utils/multi-user-storage";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
    "x-functions-key": process.env.NEXT_PUBLIC_FUNCTION_KEY as string,
    key: process.env.NEXT_PUBLIC_KEY as string,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
});

apiClient.interceptors.request.use(
  (config) => {
    let token = null;
    let user_role_id = null;
    let seva_by = null;
    let headers = config.headers;
    if (typeof window !== "undefined") {
      // Get active user from multi-user storage
      const activeUserData = getActiveUser();

      if (activeUserData) {
        token = activeUserData.token;
        const activePermission = activeUserData.active_permission;
        const active_region_index = activeUserData.active_region_index;

        if (activePermission != null) {
          user_role_id =
            activePermission?.region[active_region_index]?.user_role_id;
        }
      } else {
        // Fallback to old structure for backward compatibility
        token = localStorage.getItem("token")
          ? (localStorage.getItem("token") as string)
          : null;
        const activeParmission = localStorage.getItem("active_permission")
          ? JSON.parse(localStorage.getItem("active_permission") as string)
          : null;
        const active_region_index =
          localStorage.getItem("active_region_index") ?? 0;

        if (activeParmission != null) {
          user_role_id =
            activeParmission?.region[active_region_index]?.user_role_id;
        }
      }

      seva_by = localStorage.getItem("seva_by")
        ? JSON.parse(localStorage.getItem("seva_by") as string)
        : null;

      if (seva_by) {
        const other_user = JSON.parse(
          localStorage.getItem("other_user") as string,
        );
        user_role_id = other_user.user_role_id;
      }
    }

    headers = {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(user_role_id && { user_role_id }),
      ...(seva_by && { seva_by }),
      ...headers,
    };

    config.headers = headers;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (config) => {
    return config;
  },
  async (error) => {
    if (
      error?.response?.status === 401 &&
      error?.response?.data?.error !== "Access denied" &&
      !error?.config?.url.includes("login")
    ) {
      if (typeof window !== "undefined") {
        // Remove only the active user instead of clearing all
        const activeUserId = getActiveUserId();
        if (activeUserId !== null) {
          removeUser(activeUserId);

          // Check if there are other users
          const remainingUsers = getUsersList();

          if (remainingUsers.length === 0) {
            // No users left, redirect to login
            localStorage.clear();
            window.location.replace("/login");
          } else {
            // Switch to another user or reload to trigger switch
            window.location.reload();
          }
        } else {
          // Fallback: clear all if no active user
          localStorage.clear();
          window.location.replace("/login");
        }
      }
    }
    throw error;
  },
);

export default apiClient;
