"use client";

import type { ComponentType, ReactNode } from "react";
import { useMemo } from "react";
import { sevaWiseRoleIds } from "@/constants/roles";
import type { SevaType } from "@/config/roles";
import { useAppSelector } from "@/redux/store";
import {
  findLocationMatch,
  getActiveLocation,
  getActivePermissions,
  permissionSatisfies,
} from "@/shared/functions/seva-region";
import type {
  GroupPermission,
  Permission,
  Region,
  User,
} from "@/shared/interfaces/user";

export interface AuthContext {
  user: User | null;
  active_region: Region | null;
  active_permission: Permission | null;
  active_region_index: number;
  all_permission: GroupPermission;
  seva_regions: Record<string, Region>;
}

export interface MatchResult {
  userRole: string;
  userRoleId: number;
  roleRegion: string;
  region: Region;
  permission: Permission;
}

interface CanParams {
  roleId?: number;
  sevaType?: SevaType;
  permissions: string | string[];
}

function toMatchResult(
  permission: Permission,
  region: Region,
  roleRegion: string,
): MatchResult {
  return {
    userRole: permission.role,
    userRoleId: region.user_role_id,
    roleRegion,
    region,
    permission,
  };
}

export function canCheck(
  auth: AuthContext,
  { roleId, sevaType, permissions }: CanParams,
): MatchResult | null {
  const {
    user,
    all_permission,
    active_region,
    active_permission,
    active_region_index,
  } = auth;

  if (!user) {
    return null;
  }

  const activePermissions = getActivePermissions(user, all_permission);
  const activeLocation = getActiveLocation(
    active_permission,
    active_region,
    active_region_index,
  );

  if (sevaType) {
    const roleIds = sevaWiseRoleIds[sevaType];
    if (!roleIds?.length) {
      return null;
    }

    const sevaPermissions = activePermissions.filter(
      (permission) =>
        roleIds.includes(permission.role_id) &&
        permissionSatisfies(permission, permissions),
    );
    const match = findLocationMatch(
      sevaPermissions,
      activeLocation,
      active_permission,
    );

    if (!match) {
      return null;
    }

    return toMatchResult(match.permission, match.region, match.roleRegion);
  }

  if (roleId === undefined) {
    return null;
  }

  const rolePermission = activePermissions.find(
    (permission) =>
      permission.role_id === roleId &&
      permissionSatisfies(permission, permissions),
  );

  if (!rolePermission) {
    return null;
  }

  const match = findLocationMatch(
    [rolePermission],
    activeLocation,
    active_permission,
  );

  if (!match) {
    return null;
  }

  return toMatchResult(match.permission, match.region, match.roleRegion);
}

interface CommonProps {
  permissions: string | string[];
  render?: (match: MatchResult) => React.ReactNode;
  children?: ReactNode;
  component?: ComponentType<MatchResult>;
}

type Props =
  | ({ roleId?: never; sevaType: SevaType } & CommonProps)
  | ({ roleId: number; sevaType?: never } & CommonProps);

export function Can({
  roleId,
  sevaType,
  permissions,
  render,
  component: Component,
  children,
}: Props) {
  const auth = useAppSelector((s) => s.auth);

  const match = useMemo(
    () => canCheck(auth, { roleId, sevaType, permissions }),
    [auth, permissions, roleId, sevaType],
  );

  if (!match) {
    return null;
  }
  if (Component) {
    return <Component {...match} />;
  }

  if (render) {
    return render(match);
  }

  return <>{children}</>;
}
