"use client";

import type { ComponentType, ReactNode } from "react";
import { useMemo } from "react";
import {
  type RegionLevel,
  ROLES,
  SEVA_TYPE_REGIONS,
  type SevaType,
} from "@/config/roles";
import { useAppSelector } from "@/redux/store";
import type { Permission, Region, User } from "@/shared/interfaces/user";

export interface AuthContext {
  user: User | null;
  active_region: Region | null;
  active_permission: Permission | null;
  active_region_index: number;
}

export interface MatchResult {
  userRole: string;
  userRoleId: number;
}

interface CanParams {
  roleId?: number;
  sevadarType?: SevaType;
  permissions: string | string[];
}

export function canCheck(
  auth: AuthContext,
  { roleId, sevadarType, permissions }: CanParams,
): MatchResult | null {
  const { user, active_region, active_permission, active_region_index } = auth;

  if (!user || !active_permission) {
    return null;
  }

  const roleRegion = active_permission.role_region as RegionLevel | undefined;

  let sevaRoleId: number;

  if (sevadarType) {
    const validRegion = SEVA_TYPE_REGIONS[sevadarType];

    if (!roleRegion || !validRegion.includes(roleRegion)) {
      return null;
    }

    const role = Object.values(ROLES).find((r) => {
      if (roleRegion !== "ashram") {
        return r.region === roleRegion && r.name.startsWith(sevadarType);
      }
      return r.region === roleRegion;
    });

    if (!role) {
      return null;
    }

    sevaRoleId = role.id;
  } else {
    if (roleId === undefined) {
      return null;
    }
    sevaRoleId = roleId;
  }

  const rolePermission = user.permission.find((r) => r.role_id === sevaRoleId);

  const roleRegionIdKey =
    `${rolePermission?.role_region === "ashram" ? "country" : rolePermission?.role_region}_id` as keyof Region;

  if (!rolePermission) {
    return null;
  }

  const permissionMatch = Array.isArray(permissions)
    ? rolePermission.permissions.some((p) => permissions.includes(p))
    : rolePermission.permissions.includes(permissions);

  if (!permissionMatch) {
    return null;
  }

  const regionMatch = rolePermission.region.find((r) => {
    if (active_region) {
      return (
        String(r[roleRegionIdKey]) === String(active_region[roleRegionIdKey])
      );
    }
    return (
      String(r[roleRegionIdKey]) ===
      String(active_permission.region?.[active_region_index][roleRegionIdKey])
    );
  });

  if (!regionMatch) {
    return null;
  }

  return {
    userRole: rolePermission.role,
    userRoleId: regionMatch.user_role_id,
  };
}

interface CommonProps {
  permissions: string | string[];
  render?: (match: MatchResult) => React.ReactNode;
  children?: ReactNode;
  component?: ComponentType<MatchResult>;
}

type Props =
  | ({ roleId?: never; sevadarType: SevaType } & CommonProps)
  | ({ roleId: number; sevadarType?: never } & CommonProps);

export function Can({
  roleId,
  sevadarType,
  permissions,
  render,
  component: Component,
  children,
}: Props) {
  const auth = useAppSelector((s) => s.auth);

  const match = useMemo(
    () => canCheck(auth, { roleId, sevadarType, permissions }),
    [auth, permissions, roleId, sevadarType],
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
