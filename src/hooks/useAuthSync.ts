import { useEffect } from "react";
import { useAppDispatch } from "@/redux/store";
import { syncActiveUser } from "@/redux/features/authSlice";

/**
 * Hook to ensure Redux auth state is synced with active user from multi-user storage
 * Call this hook in components that access auth state to ensure data freshness
 */
const useAuthSync = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Sync Redux state with active user from multi-user storage
    dispatch(syncActiveUser());
  }, [dispatch]);
};

export default useAuthSync;
