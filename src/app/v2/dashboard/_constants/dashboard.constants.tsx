import { BookOpen, Languages, MapPin } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface DashboardSeva {
  title: string;
  url: string;
  icon: ReactNode;
  permission: string | string[];
  subtitle?: string;
  gradient?: string;
  setPermission?: boolean;
}

const GRADIENTS = {
  social: "bg-linear-to-r from-[#000c45] to-[#0C3BE3]",
  order: "bg-linear-to-r from-[#1B0052] to-[#581FC8]",
  admin: "bg-linear-to-r from-[#06259B] via-[#3B1090] to-[#440251]",
} as const;

function imageIcon(src: string, className?: string) {
  return (
    <Image
      alt=""
      aria-hidden
      className={cn("size-10 object-contain", className)}
      height={40}
      src={src}
      width={40}
    />
  );
}

export const DASHBOARD_SEVAS: DashboardSeva[] = [
  {
    title: "SM Seva",
    subtitle: "SM Seva Update",
    url: "/v2/social-media",
    icon: imageIcon("/assets/icons/social_media_platforms.png"),
    permission: ["social_media_seva", "book_order_seva"],
    gradient: GRADIENTS.social,
    setPermission: true,
  },
  {
    title: "Book Delivery Seva",
    subtitle: "Find Book Delivery Seva Details here",
    url: "/seva/delivery",
    icon: imageIcon("/assets/icons/book.png"),
    permission: "book_delivery_seva",
    gradient: GRADIENTS.order,
    setPermission: true,
  },
  {
    title: "Calling Seva",
    subtitle: "Find Calling Seva Details here",
    url: "/seva/calling",
    icon: imageIcon("/assets/icons/calling.png"),
    permission: "calling_seva",
    gradient: GRADIENTS.order,
  },
  {
    title: "Allot Roles",
    subtitle: "Allot roles like team leaders & distributors",
    url: "/seva/allotseva/allotRoles",
    icon: imageIcon("/assets/icons/allotRoles.png"),
    permission: "allot_roles",
    gradient: GRADIENTS.admin,
    setPermission: true,
  },
  {
    title: "Transfer",
    subtitle: "Transfer state, district or tehsil",
    url: "/seva/transfer/list",
    icon: imageIcon("/assets/icons/userTransfer.png"),
    permission: "transfer_sevadar",
    gradient: GRADIENTS.admin,
    setPermission: true,
  },
  {
    title: "Permissions",
    subtitle: "Allot and Revoke permissions",
    url: "/permission",
    icon: imageIcon("/assets/icons/allotRoles.png"),
    permission: "allot_role_permissions",
    gradient: GRADIENTS.admin,
    setPermission: true,
  },
  {
    title: "Assign Permissions",
    subtitle: "Allot and Revoke permissions",
    url: "/assign-permission",
    icon: imageIcon("/assets/icons/allotRoles.png"),
    permission: "role_creation_permission",
    gradient: GRADIENTS.admin,
    setPermission: true,
  },
  {
    title: "Postal Order List",
    subtitle: "Find By Post Order Seva Details Here",
    url: "/seva/post",
    icon: imageIcon("/assets/icons/Postal-Book-Delivery-Seva.png"),
    permission: "post_order_seva",
    gradient: GRADIENTS.order,
    setPermission: true,
  },
  {
    title: "Channel Seva",
    subtitle: "Manage TV Channels",
    url: "/seva/channels",
    icon: imageIcon("/assets/icons/calling.png"),
    permission: "add_satsang_channel",
    gradient: GRADIENTS.social,
    setPermission: true,
  },
  {
    title: "Download Disciples List",
    subtitle: "Download Disciples Created From Forms",
    url: "/users/disciplelist",
    icon: imageIcon("/assets/icons/Download Order list.png"),
    permission: "export_disciples",
    gradient: GRADIENTS.admin,
    setPermission: true,
  },
  {
    title: "Manage Books",
    url: "/admin/books",
    icon: <BookOpen className="size-6 text-orange-500" />,
    permission: "add_book",
    gradient: GRADIENTS.admin,
    setPermission: true,
  },
  {
    title: "Manage Books Language",
    url: "/admin/languages",
    icon: <Languages className="size-6 text-blue-500" />,
    permission: "add_language",
    gradient: GRADIENTS.admin,
    setPermission: true,
  },
  {
    title: "Set Pincode",
    url: "/admin/pincode/set",
    icon: <MapPin className="size-6 text-cyan-500" />,
    permission: "add_pincode",
    gradient: GRADIENTS.admin,
    setPermission: true,
  },
  {
    title: "Sangat List",
    url: "/admin/sangat_list/list",
    icon: imageIcon("/assets/icons/allotRoles.png"),
    permission: "sangat_list",
    gradient: GRADIENTS.admin,
    setPermission: true,
  },
  {
    title: "Book Order Complain Seva",
    subtitle: "Find Book Order Complain Here",
    url: "/seva/complain",
    icon: imageIcon("/assets/icons/Book Order complaint.png"),
    permission: "book_complain_seva",
    gradient: GRADIENTS.order,
    setPermission: true,
  },
  {
    title: "Ramaini Seva",
    subtitle: "Ramaini Seva",
    url: "/seva/ramaini",
    icon: imageIcon("/assets/icons/Book Order complaint.png"),
    permission: "ramaini_seva",
    gradient: GRADIENTS.order,
    setPermission: true,
  },
  {
    title: "Register Sevadar",
    subtitle: "Register Sevadar",
    url: "/register",
    icon: imageIcon("/assets/icons/allotUser.png"),
    permission: "add_disciple",
    gradient: GRADIENTS.admin,
    setPermission: true,
  },
  {
    title: "Other Login",
    url: "/other-login",
    icon: imageIcon("/assets/icons/userTransfer.png"),
    permission: "direct_login",
    gradient: GRADIENTS.admin,
    setPermission: true,
  },
];
