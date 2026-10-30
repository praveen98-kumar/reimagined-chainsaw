"use client";

import {
  Check,
  ChevronDown,
  LogIn,
  LogOut,
  UserCog,
  Users,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/v2/ui/avatar";
import { Badge } from "@/components/v2/ui/badge";
import { Button } from "@/components/v2/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from "@/components/v2/ui/sidebar";
import useIsMounted from "@/hooks/useIsMounted";
import { removeUser, switchUser, updateRole } from "@/redux/features/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { capitalizeWords } from "@/shared/functions/utils";
import { cn } from "@/utils/cn";
import {
  getActiveUserId,
  getUsersCount,
  getUsersList,
  MAX_USERS,
  type StoredUser,
} from "@/utils/multi-user-storage";

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);

function ProfileHeader() {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return null;
  }

  return (
    <SidebarHeader className="gap-3 bg-linear-to-r from-[#1B0052] to-[#581FC8] p-4 text-white">
      <div className="flex items-center gap-3">
        <Avatar className="size-12 ring-2 ring-white/60">
          <AvatarImage alt={user.disciple.name} src={user.disciple.avatar} />
          <AvatarFallback>{getInitials(user.disciple.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold">
            {user.disciple.name}
          </p>
          <p className="truncate text-xs text-white/70">
            {[user.disciple.relation, user.disciple.guardian_name]
              .filter(Boolean)
              .join(" ")}
          </p>
          <p className="truncate text-xs text-white/70">{user.mobile_no}</p>
        </div>
      </div>
    </SidebarHeader>
  );
}

function SwitchAccountSection({ onNavigate }: { onNavigate: () => void }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const activeGroup = useAppSelector(
    (state) => state.auth.all_permission.group,
  );
  const [open, setOpen] = useState(false);

  const groups = (user?.role_level ?? []).filter((roleLevel) =>
    user?.permission.some((permission) =>
      roleLevel.roles.includes(permission.role_id),
    ),
  );

  if (groups.length === 0) {
    return null;
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton onClick={() => setOpen((previous) => !previous)}>
        <UserCog />
        <span className="flex-1 truncate">Switch Account</span>
        <ChevronDown
          className={cn("transition-transform", open && "rotate-180")}
        />
      </SidebarMenuButton>
      {open && (
        <SidebarMenuSub>
          {groups.map((roleLevel) => {
            const isActive = roleLevel.group === activeGroup;

            return (
              <SidebarMenuSubButton
                isActive={isActive}
                key={roleLevel.group}
                onClick={() => {
                  dispatch(updateRole(roleLevel));
                  onNavigate();
                }}
                render={<button type="button" />}
              >
                <span className="flex-1 truncate">
                  {capitalizeWords(roleLevel.group)}
                </span>
                {isActive && <Check />}
              </SidebarMenuSubButton>
            );
          })}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
}

function SwitchUserSection({ onNavigate }: { onNavigate: () => void }) {
  const dispatch = useAppDispatch();
  const canMultiLogin = useAppSelector((state) =>
    state.auth.all_permission.permissions.includes("multi_login"),
  );
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [activeUserId, setActiveUserId] = useState<number | null>(null);

  const loadUsers = useCallback(() => {
    setUsers(getUsersList());
    setActiveUserId(getActiveUserId());
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  if (users.length <= 1) {
    return null;
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton onClick={() => setOpen((previous) => !previous)}>
        <Users />
        <span className="flex-1 truncate">Switch User ({users.length})</span>
        <ChevronDown
          className={cn("transition-transform", open && "rotate-180")}
        />
      </SidebarMenuButton>
      {open && (
        <SidebarMenuSub>
          {users.map((storedUser) => {
            const isActive = storedUser.disciple_id === activeUserId;

            return (
              <SidebarMenuSubButton
                isActive={isActive}
                key={storedUser.disciple_id}
                onClick={() => {
                  if (isActive) {
                    return;
                  }
                  dispatch(switchUser(storedUser.disciple_id));
                  onNavigate();
                }}
                render={<button type="button" />}
              >
                <span className="flex-1 truncate">
                  {storedUser.name || storedUser.mobile_no}
                </span>
                {isActive && <Badge variant="success">Active</Badge>}
              </SidebarMenuSubButton>
            );
          })}
          {users.length < MAX_USERS && canMultiLogin && (
            <SidebarMenuSubButton
              onClick={onNavigate}
              render={<Link href="/login" />}
            >
              <LogIn />
              <span className="flex-1 truncate">Login Another Account</span>
            </SidebarMenuSubButton>
          )}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
}

export function DashboardSidebar() {
  const isMounted = useIsMounted();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [usersCount, setUsersCount] = useState(0);

  useEffect(() => {
    setUsersCount(getUsersCount());
  }, [isMounted]);

  const reload = () => {
    window.location.reload();
  };

  const logout = () => {
    const activeUserId = getActiveUserId();
    const users = getUsersList();

    if (activeUserId && users.length > 1) {
      dispatch(removeUser(activeUserId));
    } else {
      localStorage.clear();
    }

    reload();
  };

  return (
    <Sidebar collapsible="offcanvas" side="left">
      {isMounted && (
        <>
          <ProfileHeader />
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                <SwitchAccountSection onNavigate={reload} />
                <SwitchUserSection onNavigate={reload} />
                <SidebarMenuItem>
                  <SidebarMenuButton render={<Link href="/tutorials" />}>
                    <Video />
                    <span className="flex-1 truncate">Tutorials</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <Button className="w-full" onClick={logout} variant="destructive">
              <LogOut data-icon="inline-start" />
              Logout
              {usersCount > 1 ? ` (${user?.disciple?.name ?? "Current"})` : ""}
            </Button>
          </SidebarFooter>
        </>
      )}
    </Sidebar>
  );
}
