import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaUsers } from "react-icons/fa";
import { MdLogin } from "react-icons/md";

import { removeUser, switchUser } from "@/redux/features/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { cn } from "@/shared/functions/utils";
import {
  getActiveUserId,
  getUsersCount,
  getUsersList,
  MAX_USERS,
  type StoredUser,
} from "@/utils/multi-user-storage";

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
    <div>
      <motion.div
        onClick={() => users.length > 0 && setOpen((pre) => !pre)}
        className={`bg-gray-100 p-2 py-3 border border-gray-300 ${
          open ? "rounded-t-md" : "rounded-md"
        } flex w-full items-center space-between cursor-pointer`}
      >
        <FaUsers className="mr-4" />
        <span className="font-bold text-gray-700 cursor-pointer flex-1">
          Switch User ({usersCount})
        </span>
      </motion.div>
      <AnimatePresence initial={false}>
        {open && users.length > 0 && (
          <motion.div
            className="p-2 space-y-2 bg-gray-900 rounded-b-lg max-h-96 overflow-y-auto"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", maxHeight: "96", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {users.map((storedUser) => {
              const isActive = storedUser.disciple_id === activeUserId;
              return (
                <button
                  type="button"
                  key={storedUser.disciple_id}
                  onClick={() => handleSwitchUser(storedUser.disciple_id)}
                  className={`${
                    isActive ? "bg-white text-gray-800" : "text-white"
                  } rounded-md p-2 flex w-full items-center space-between cursor-pointer`}
                >
                  <div className="flex-1 min-w-0 font-bold truncate">
                    {storedUser.name || storedUser.mobile_no}
                  </div>
                  {isActive && (
                    <span
                      className={cn(
                        "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
                        "h-6 bg-blue-500 text-white",
                      )}
                    >
                      Active
                    </span>
                  )}
                </button>
              );
            })}
            {users.length < MAX_USERS && canDoMultiLogin && (
              <Link
                href={"/login"}
                onClick={() => setShow(false)}
                className={`bg-white text-gray-800 rounded-md p-2 flex w-full items-center space-between cursor-pointer`}
              >
                <MdLogin className="mr-4 w-5 h-5" />
                <span className="font-bold text-gray-700 cursor-pointer">
                  Login Another Account
                </span>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserSwitcher;
