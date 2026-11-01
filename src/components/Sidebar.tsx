import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import type React from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronRight, LogOut, MapPin, Phone, Video, X } from "lucide-react";

import apiClient from "@/http";
import { useAppSelector } from "@/redux/store";
import { cn } from "@/shared/functions/utils";
import { getUsersList } from "@/utils/multi-user-storage";

import Avatar from "./Avatar";
import Button from "./Button";
import LanguageSwitch from "./LanguageSwitch";
import { sidebarCardClass, SidebarIcon } from "./SidebarSection";
import SwichRoleComponent from "./SwitchRole";
import UserSwitcher from "./UserSwitcher";

interface SidebarProps {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const APP_VERSION = "2.0";

const backdrop = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

const Sidebar = (props: SidebarProps) => {
  const { t: tc } = useTranslation("common");
  const { show, setShow } = props;
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const disciple = user?.disciple;
  const address =
    disciple?.address ||
    [disciple?.tehsil?.name, disciple?.district?.name, disciple?.state?.name]
      .filter(Boolean)
      .join(", ");

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
            className="fixed cursor-pointer inset-0 z-40 bg-indigo-950/50 w-full h-screen"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{
              duration: 0.2,
            }}
            className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] overflow-hidden rounded-r-4xl bg-app-gradient shadow-xl"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-44 rounded-b-[50%_40px] bg-linear-to-br from-blue-200/70 via-violet-200/60 to-pink-200/70" />
            <div className="relative h-full w-full flex flex-col px-3 pt-4 pb-3">
              <div className="relative flex items-center justify-center pb-3">
                <p className="font-serif text-2xl font-bold text-brand-title">
                  Satlok Ashram
                </p>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setShow(false)}
                  className="absolute right-0 flex size-9 items-center justify-center rounded-full bg-white text-brand-ink shadow-[0_6px_16px_-6px_rgba(76,29,149,0.4)]"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className={cn(sidebarCardClass, "border-white")}>
                <div className="flex items-center gap-1 p-3">
                  <Avatar
                    showLabel={false}
                    label={disciple?.status}
                    containerSize="size-14"
                  />
                  <div className="min-w-0">
                    <p className="font-bold uppercase leading-tight text-blue-900">
                      {[
                        disciple?.name,
                        disciple?.relation,
                        disciple?.guardian_name,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    </p>
                    {address && (
                      <p className="mt-1 flex gap-1 text-sm leading-snug text-slate-600">
                        <MapPin className="mt-0.5 size-4 shrink-0 text-brand-ink" />
                        {address}
                      </p>
                    )}
                  </div>
                </div>
                {user?.mobile_no && (
                  <p className="flex items-center justify-center gap-2 border-t border-slate-200 py-2 text-slate-700">
                    <Phone className="size-4 text-brand-ink" />
                    {user.mobile_no}
                  </p>
                )}
              </div>

              <div className="flex-1 py-3 overflow-y-auto overflow-x-hidden space-y-2">
                <UserSwitcher setShow={setShow} />
                <SwichRoleComponent setShow={setShow} />
                <LanguageSwitch />
                <Link
                  href={"/tutorials"}
                  className={cn(
                    sidebarCardClass,
                    "border-white flex w-full items-center gap-3 px-3 py-2",
                  )}
                >
                  <SidebarIcon Icon={Video} />
                  <span className="flex-1 text-lg font-semibold text-brand-ink">
                    {tc("tutorial")}
                  </span>
                  <ChevronRight className="size-5 text-brand-ink" />
                </Link>
              </div>
              <Button
                type="button"
                variant="gradient"
                onClick={logout}
                className="w-full gap-3"
              >
                <LogOut className="size-5" />
                Logout
              </Button>
              <p className="pt-2 text-center text-sm text-slate-500">
                Version {APP_VERSION}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
