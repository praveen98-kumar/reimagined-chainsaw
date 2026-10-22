import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import type React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ImCancelCircle } from "react-icons/im";
import { MdVideoSettings } from "react-icons/md";

import { removeUser } from "@/redux/features/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import type { Disciple } from "@/shared/interfaces/user";
import { getActiveUserId, getUsersList } from "@/utils/multi-user-storage";

import DiscipleCard from "./card/DiscipleCard";
import LanguageSwitch from "./LanguageSwitch";
import SwichRoleComponent from "./SwitchRole";
import UserSwitcher from "./UserSwitcher";

interface SidebarProps {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}
const backdrop = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

const Sidebar = (props: SidebarProps) => {
  const { t: tc } = useTranslation("common");
  const { show, setShow } = props;
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [usersCount, setUsersCount] = useState(() => {
    const userList = getUsersList();
    return userList.length;
  });

  const logout = () => {
    const activeUserId = getActiveUserId();
    const users = getUsersList();

    if (activeUserId && users.length > 1) {
      dispatch(removeUser(activeUserId));
      setUsersCount((prev) => prev - 1);
    } else {
      localStorage.clear();
    }
    router.reload();
    setShow(false);
  };
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [show]);
  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            onClick={() => setShow(false)}
            variants={backdrop}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed cursor-pointer inset-0 z-40 bg-slate-800/50 w-full h-screen"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{
              duration: 0.2,
            }}
            className="fixed inset-y-0 z-50 w-80 bg-white shadow-xl p-2"
          >
            <button
              type="button"
              onClick={() => setShow(false)}
              className="absolute z-50 flex items-center justify-center rounded-lg top-4 right-4 size-8 text-gray-700 hover:text-gray-800 bg-white"
            >
              <ImCancelCircle className="size-6" />
            </button>
            <div className="h-full w-full flex flex-col px-1 bg-white">
              <DiscipleCard
                showLevel={false}
                disciple={
                  {
                    ...user?.disciple,
                    mobile_no: user?.mobile_no,
                  } as Disciple & Record<string, Record<string, unknown>>
                }
              />
              <div className="flex-1 py-2 rounded-b-md  overflow-y-visible overflow-x-hidden space-y-2">
                <UserSwitcher setShow={setShow} />
                <SwichRoleComponent setShow={setShow} />
                <LanguageSwitch />
                <Link
                  href={"/tutorials"}
                  className={`bg-gray-100 p-2 py-3 border border-gray-300 flex w-full items-center space-between rounded-md`}
                >
                  <MdVideoSettings className="mr-4 w-5 h-5" />
                  <span className="font-bold text-gray-700 cursor-pointer">
                    {tc("tutorial")}
                  </span>
                </Link>
              </div>
              <button
                type="button"
                onClick={logout}
                className="w-full px-3 py-2 justify-items-end rounded-lg font-bold text-gray-100 bg-gray-800"
              >
                Logout{" "}
                {usersCount > 1 ? `(${user?.disciple?.name || "Current"})` : ""}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
