"use client";

import { IMAGES } from "@/constants/images";
import { MobileNav } from "@/components/v2/MobileNav";
import { useAppSelector } from "@/redux/store";
import { regionHirarchyMap, type RoleRegion } from "@/constants/app";
import { useMemo } from "react";
import useIsMounted from "@/hooks/useIsMounted";

const sevadarNavItems = [
  {
    href: "/v2/social-media",
    label: "Dash Board",
    image: IMAGES.bar,
  },
  {
    href: "/v2/social-media/seva",
    label: "Seva",
    image: IMAGES.hands,
  },
];

const navItems = [
  {
    href: "/v2/social-media",
    label: "Dash Board",
    image: IMAGES.bar,
  },
  {
    href: "/v2/social-media/seva",
    label: "Seva",
    image: IMAGES.hands,
  },
  {
    href: "/v2/social-media/report",
    label: "Report",
    image: IMAGES.dashboard,
  },
];

export function SocialMediaNav() {
    const isMounted = useIsMounted();
    const { active_permission } = useAppSelector((s) => s.auth);

    const activeRoleRegion = active_permission?.role_region as RoleRegion;
    const currentUserHierarchy = regionHirarchyMap[activeRoleRegion];
    const filtered = useMemo(() => {
      // The auth state lives in `localStorage`, so it only exists on the client.
      // Until the component is mounted we render the role independent subset of
      // items, which is exactly what the server renders. This keeps the server
      // HTML and the first client render identical (no hydration mismatch),
      // the role based list is applied right after mounting.
      if (!isMounted) return sevadarNavItems;

      return currentUserHierarchy < 5
        ? navItems
        : active_permission?.role === "social_media_sevadar"
          ? sevadarNavItems
          : navItems;
    }, [isMounted, currentUserHierarchy, active_permission?.role]);
  return <MobileNav items={filtered} />;
}
