import useAuthSync from "@/hooks/useAuthSync";
import { useAppSelector } from "@/redux/store";

const useValidUser = (permission: string | string[]) => {
  useAuthSync();
  const { all_permission } = useAppSelector((state) => state.auth);
  let hasPermission = false;

  if (all_permission !== undefined) {
    if (Array.isArray(permission)) {
      hasPermission = permission.some((p) =>
        all_permission.permissions.includes(p),
      );
    } else {
      hasPermission = all_permission.permissions.includes(permission);
    }
  }

  return hasPermission;
};

export default useValidUser;
