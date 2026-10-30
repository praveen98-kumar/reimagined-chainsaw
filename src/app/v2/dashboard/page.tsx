"use client";

import { Menu } from "lucide-react";
import { useMemo } from "react";
import useAuthSync from "@/hooks/useAuthSync";
import useIsMounted from "@/hooks/useIsMounted";
import {
  setActivePermission,
  setActiveRegion,
  setActiveRegionIndex,
} from "@/redux/features/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { cn } from "@/utils/cn";
import { SevaCard } from "./_components/seva-card";
import {
  DASHBOARD_SEVAS,
  type DashboardSeva,
} from "./_constants/dashboard.constants";
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/v2/ui/sidebar";
import { Button } from "@/components/v2/ui/button";
import { DashboardSidebar } from "./_components/dashboard-sidebar";

function Header() {
  const { toggleSidebar } = useSidebar();
  return (
    <header className="sticky h-19 top-0 z-100 inset-x-0 p-4 bg-white">
      <div className="flex w-full h-full items-center justify-between">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={toggleSidebar}
        >
          <Menu className="size-5" />
        </Button>
        <div className="text-center flex-1">
          <p className={cn("text-xl font-medium leading-6.5")}>Dashboard</p>
        </div>
      </div>
    </header>
  );
}

export default function DashboardPage() {
  const isMounted = useIsMounted();
  const dispatch = useAppDispatch();
  const { user, all_permission } = useAppSelector((state) => state.auth);

  useAuthSync();

  const visibleSevas = useMemo(() => {
    if (!isMounted) {
      return [];
    }

    return DASHBOARD_SEVAS.filter((seva) => {
      const required = Array.isArray(seva.permission)
        ? seva.permission
        : [seva.permission];

      return required.some((permission) =>
        all_permission.permissions.includes(permission),
      );
    });
  }, [isMounted, all_permission.permissions]);

  const handleSelect = (seva: DashboardSeva) => {
    if (!seva.setPermission || !user) {
      return;
    }

    const required = Array.isArray(seva.permission)
      ? seva.permission
      : [seva.permission];

    const match =
      user.permission.find(
        (permission) =>
          all_permission.roles.includes(permission.role_id) &&
          permission.permissions.some((current) => required.includes(current)),
      ) ?? null;

    dispatch(setActiveRegionIndex(0));
    dispatch(setActivePermission(match));
    dispatch(setActiveRegion(match?.region?.[0] ?? null));
  };

  return (
    <div className="relative flex flex-col h-full bg-white/60 backdrop-blur-sm overflow-y-auto">
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset className="bg-transparent">
          <Header />
          <div className="flex-1">
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-x-auto">
              {visibleSevas.map((seva) => (
                <SevaCard
                  key={seva.url}
                  gradient={seva.gradient}
                  icon={seva.icon}
                  onClick={() => handleSelect(seva)}
                  subtitle={seva.subtitle}
                  title={seva.title}
                  url={seva.url}
                />
              ))}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
