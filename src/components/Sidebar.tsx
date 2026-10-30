import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import type React from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaChevronRight } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { MdLogout, MdVideoSettings } from "react-icons/md";

import apiClient from "@/http";
import { useAppSelector } from "@/redux/store";
import type { Disciple } from "@/shared/interfaces/user";
import { getUsersList } from "@/utils/multi-user-storage";

import SidebarUserCard from "./SidebarUserCard";
import LanguageSwitch from "./LanguageSwitch";
import {
  iconChip,
  logoutButton,
  menuRowClosed,
  rowLabel,
  sidebarPanelBackground,
} from "./sidebarTheme";
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
  const router = useRouter();

  const logout = async () => {
    const endpoint = getUsersList().length > 1 ? "logout_all" : "logout";
    try {
      await apiClient.post(endpoint, {});
    } catch (error) {
      console.log(error);
    } finally {
      localStorage.clear();
      setShow(false);
      router.reload();
    }
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
            className="fixed cursor-pointer inset-0 z-40 bg-[#431407]/40 w-full h-screen"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{
              duration: 0.2,
            }}
            className="fixed inset-y-0 z-50 w-80 overflow-hidden rounded-r-3xl shadow-[8px_0_30px_rgba(67,20,7,0.35)]"
            style={{ background: sidebarPanelBackground }}
          >
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setShow(false)}
              className="absolute z-50 flex items-center justify-center rounded-full top-6 right-6 size-8 bg-white text-[#9a3412] shadow hover:bg-orange-50"
            >
              <IoClose className="size-5" />
            </button>
            <div className="h-full w-full flex flex-col px-3 pt-3 pb-4">
              <SidebarUserCard
                disciple={
                  {
                    ...user?.disciple,
                    mobile_no: user?.mobile_no,
                  } as Disciple
                }
              />
              <div className="flex-1 py-3 overflow-y-auto overflow-x-hidden space-y-1">
                <UserSwitcher setShow={setShow} />
                <SwichRoleComponent setShow={setShow} />
                <LanguageSwitch />
                <Link href={"/tutorials"} className={menuRowClosed}>
                  <span className={iconChip}>
                    <MdVideoSettings className="size-5" />
                  </span>
                  <span className={rowLabel}>{tc("tutorial")}</span>
                  <FaChevronRight className="size-3.5 text-[#9a3412]" />
                </Link>
              </div>
              <button type="button" onClick={logout} className={logoutButton}>
                <MdLogout className="size-5" />
                Logout
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
