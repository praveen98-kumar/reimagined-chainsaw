import { LogIn, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { removeUser, switchUser, updateRole } from "@/redux/features/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  getActiveUserId,
  getUsersCount,
  getUsersList,
  MAX_USERS,
  type StoredUser,
} from "@/utils/multi-user-storage";
import { cn } from "@/shared/functions/utils";
import { RoleLevel } from "@/shared/interfaces/user";

import SidebarSection, {
  ActiveCheck,
  sidebarOptionClass,
} from "./SidebarSection";

const UserSwitcher = ({
  setShow,
}: {
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { all_permission } = useAppSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [activeUserId, setActiveUserIdState] = useState<number | null>(null);

  const loadUsers = useCallback(() => {
    const usersList = getUsersList();
    const activeId = getActiveUserId();
    setUsers(usersList);
    setActiveUserIdState(activeId);
  }, []);

  useEffect(() => {
    loadUsers();
    // Refresh users list when sidebar opens
    const interval = setInterval(() => {
      if (open) {
        loadUsers();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [open, loadUsers]);

  const handleSwitchUser = (discipleId: number) => {
    if (discipleId === activeUserId) {
      setOpen(false);
      return;
    }

    dispatch(switchUser(discipleId));
    setOpen(false);
    const selectedUser = users.find((user) => user.disciple_id === discipleId);
    if (selectedUser) {
      const rolesList: RoleLevel[] = [];
      for (let i = 0; i < selectedUser.user.role_level.length; i++) {
        const item = selectedUser.user.permission.some((p) =>
          selectedUser.user.role_level[i].roles.includes(p.role_id),
        );
        if (item) {
          rolesList.push({
            group: selectedUser.user.role_level[i].group,
            roles: selectedUser.user.role_level[i].roles,
          });
        }
      }
      dispatch(updateRole(rolesList[0]));
    }
    setTimeout(() => {
      setShow(false);
      router.reload();
    }, 300);
  };

  const _handleRemoveUser = (
    e: React.MouseEvent,
    discipleId: number,
    userName: string,
  ) => {
    e.stopPropagation();

    if (users.length <= 1) {
      toast.error("Cannot remove the last user. Please logout instead.");
      return;
    }

    if (discipleId === activeUserId && users.length > 1) {
      // If removing active user, switch to another first
      const otherUser = users.find((u) => u.disciple_id !== discipleId);
      if (otherUser) {
        dispatch(switchUser(otherUser.disciple_id));
      }
    }

    dispatch(removeUser(discipleId));
    toast.success(`${userName} removed`);
    loadUsers();

    // If we removed the active user, reload to switch to new active user
    if (discipleId === activeUserId) {
      setTimeout(() => {
        router.reload();
      }, 500);
    }
  };

  const usersCount = getUsersCount();

  const canDoMultiLogin = all_permission.permissions.includes("multi_login");

  if (users.length <= 1) {
    return null;
  }

  return (
    <SidebarSection
      Icon={Users}
      title="Switch User"
      open={open}
      onToggle={() => users.length > 0 && setOpen((pre) => !pre)}
      contentClassName="max-h-96 overflow-y-auto"
      badge={
        <span className="flex size-7 items-center justify-center rounded-full bg-brand-900 text-sm font-bold text-white">
          {usersCount}
        </span>
      }
    >
      {users.map((storedUser) => {
        const isActive = storedUser.disciple_id === activeUserId;
        return (
          <button
            type="button"
            key={storedUser.disciple_id}
            onClick={() => handleSwitchUser(storedUser.disciple_id)}
            className={sidebarOptionClass(isActive)}
          >
            <span className="flex-1 min-w-0 truncate">
              {storedUser.name || storedUser.mobile_no}
            </span>
            {isActive && <ActiveCheck />}
          </button>
        );
      })}
      {users.length < MAX_USERS && canDoMultiLogin && (
        <Link
          href={"/login"}
          onClick={() => setShow(false)}
          className={cn(sidebarOptionClass(false), "justify-start gap-3")}
        >
          <LogIn className="size-5" />
          Login Another Account
        </Link>
      )}
    </SidebarSection>
  );
};

export default UserSwitcher;
