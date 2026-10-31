import type { GetStaticProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeftRight,
  BookOpen,
  Download,
  KeyRound,
  Languages,
  LogIn,
  Mail,
  MapPin,
  MessageSquareWarning,
  MessageSquareX,
  Phone,
  Presentation,
  Repeat,
  ScrollText,
  Share2,
  ShieldCheck,
  Tv,
  UserCog,
  UserPen,
  UserPlus,
  Users,
} from "lucide-react";
import SevaCard, {
  type SevaCardTheme,
  SevaCardWithMenu,
} from "@/components/card/SevaCard";
import Layout from "@/components/Layout";
import useAuthSync from "@/hooks/useAuthSync";
import apiClient from "@/http/index";
import { setUserPermission, updateRole } from "@/redux/features/authSlice";
import useLocalstorage from "@/hooks/useLocalstorage";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import type { NextApplicationPage } from "@/shared/interfaces/app";
import type { Region } from "@/shared/interfaces/user";

interface ISevaList {
  href: string;
  Icon: React.ReactNode;
  theme: SevaCardTheme;
  title: string;
  subtitle?: string;
  permission: string | string[];
  setPermission?: boolean;
  checkPermission?: boolean;
  regions?: Array<Region>;
}

const sevaList: ISevaList[] = [
  {
    href: "/v2/social-media",
    Icon: <Share2 />,
    theme: "violet",
    title: "seva.title.social_media",
    subtitle: "seva.subtitle.social_media",
    permission: ["social_media_seva", "book_order_seva"],
    setPermission: true,
    checkPermission: false,
  },
  {
    href: "/seva/delivery",
    Icon: <MessageSquareX />,
    theme: "rose",
    title: "seva.title.book_delivery_seva",
    subtitle: "seva.subtitle.book_delivery_seva",
    permission: "book_delivery_seva",
    setPermission: true,
    checkPermission: true,
  },
  {
    href: "/seva/calling",
    Icon: <Phone />,
    theme: "emerald",
    // subtitle: "",
    title: "seva.title.calling_seva",
    subtitle: "seva.subtitle.calling_seva",
    permission: "calling_seva",
    setPermission: false,
    checkPermission: false,
  },
  {
    href: "/seva/allotseva/allotRoles",
    Icon: <UserCog />,
    theme: "violet",
    title: "seva.title.allot_role",
    subtitle: "seva.subtitle.allot_role",
    permission: "allot_roles",
    setPermission: true,
    checkPermission: false,
  },
  {
    href: "/seva/transfer/list",
    Icon: <ArrowLeftRight />,
    theme: "sky",
    title: "seva.title.transfer",
    subtitle: "seva.subtitle.transfer",
    permission: "transfer_sevadar",
    setPermission: true,
    checkPermission: false,
  },
  {
    href: "/permission",
    Icon: <ShieldCheck />,
    theme: "fuchsia",
    title: "seva.title.permission",
    subtitle: "seva.subtitle.permission",
    permission: "allot_role_permissions",
    setPermission: true,
    checkPermission: false,
  },
  {
    href: "/assign-permission",
    Icon: <KeyRound />,
    theme: "violet",
    title: "seva.title.assign_permission",
    subtitle: "seva.subtitle.assign_permission",
    permission: "role_creation_permission",
    setPermission: true,
    checkPermission: false,
  },
  {
    href: "/seva/post",
    Icon: <Mail />,
    theme: "rose",
    title: "seva.title.post_order_seva",
    subtitle: "seva.subtitle.post_order_seva",
    permission: "post_order_seva",
    setPermission: true,
    checkPermission: false,
  },
  //TODO: Replace icon and add new permission to handle/manage channels
  {
    href: "/seva/channels",
    Icon: <Tv />,
    theme: "sky",
    title: "seva.title.channels_seva",
    subtitle: "seva.subtitle.channels_seva",
    permission: "add_satsang_channel",
    setPermission: true,
    checkPermission: false,
  },
  {
    href: "/users/disciplelist",
    Icon: <Download />,
    theme: "emerald",
    title: "seva.title.export_disciples",
    subtitle: "seva.subtitle.export_disciples",
    permission: "export_disciples",
    setPermission: true,
    checkPermission: false,
  },
  {
    href: "/admin/books",
    Icon: <BookOpen />,
    theme: "amber",
    title: "seva.title.manage_books",
    permission: "add_book",
    setPermission: true,
    checkPermission: false,
  },
  {
    href: "/admin/languages",
    Icon: <Languages />,
    theme: "sky",
    title: "seva.title.book_language",
    permission: "add_language",
    setPermission: true,
    checkPermission: false,
  },
  {
    href: "/admin/pincode/set",
    Icon: <MapPin />,
    theme: "emerald",
    title: "seva.title.set_pincode",
    permission: "add_pincode",
    setPermission: true,
    checkPermission: false,
  },
  {
    href: "/admin/sangat_list/list",
    Icon: <Users />,
    theme: "fuchsia",
    title: "seva.title.sangat_list",
    permission: "sangat_list",
    setPermission: true,
    checkPermission: true,
  },
  {
    href: "/disciple/list",
    Icon: <UserPen />,
    theme: "violet",
    title: "seva.title.edit_disciple",
    permission: "edit_disciple",
    setPermission: true,
    checkPermission: true,
  },
  {
    href: "/seva/complain",
    Icon: <MessageSquareWarning />,
    theme: "amber",
    title: "seva.title.book_order_complain_seva",
    subtitle: "seva.subtitle.book_order_complain_seva",
    permission: "book_complain_seva",
    setPermission: true,
    checkPermission: true,
  },
  {
    href: "/seva/ramaini",
    Icon: <ScrollText />,
    theme: "amber",
    title: "seva.title.ramaini_seva",
    subtitle: "seva.subtitle.ramaini_seva",
    permission: "ramaini_seva",
    setPermission: true,
    checkPermission: true,
  },
  {
    href: "/register",
    Icon: <UserPlus />,
    theme: "fuchsia",
    title: "seva.title.register_user",
    permission: "add_disciple",
    setPermission: true,
    checkPermission: true,
  },
  {
    href: "/seva-transfer",
    Icon: <Repeat />,
    theme: "emerald",
    title: "seva.title.seva_transfer",
    permission: "seva_transfer",
    setPermission: true,
    checkPermission: false,
  },
  {
    href: "/other-login",
    Icon: <LogIn />,
    theme: "sky",
    title: "seva.title.other_login",
    permission: "direct_login",
    setPermission: true,
    checkPermission: false,
  },
  {
    href: "/pradarshani_seva",
    Icon: <Presentation />,
    theme: "rose",
    title: "seva.title.pradarshani_seva",
    subtitle: "seva.subtitle.pradarshani_seva",
    permission: "pradarshani_seva",
    setPermission: true,
    checkPermission: false,
  },
];

const Home: NextApplicationPage = () => {
  const [list, setList] = useState<ISevaList[]>(sevaList);
  const { user, all_permission, active_permission, active_region_index } =
    useAppSelector((state) => state.auth);
  const { t } = useTranslation("home");
  const mounted = useRef<boolean>(false);
  const dispatch = useAppDispatch();

  useAuthSync();
  const [permissionsFetchedAt, setPermissionsFetchedAt] = useLocalstorage(
    "permissions_fetched_at",
    0,
  );

  useEffect(() => {
    const ONE_MINUTE = 60 * 1000;
    if (
      permissionsFetchedAt &&
      Date.now() - permissionsFetchedAt < ONE_MINUTE
    ) {
      return;
    }
    (async () => {
      try {
        const { data } = await apiClient.get(
          `user_roles_permissions?user_id=${user?.id}`,
        );
        dispatch(setUserPermission(data.data));
        dispatch(
          updateRole({
            group: all_permission.group,
            roles: all_permission.roles,
          }),
        );
        setPermissionsFetchedAt(Date.now());
      } catch (error) {
        console.log(error);
      }
    })();
  }, [permissionsFetchedAt]);

  useEffect(() => {
    const updateList = () => {
      const updatedList = list.map((item) => {
        const permissions = user?.permission.filter((p) => {
          if (Array.isArray(item.permission)) {
            return (
              all_permission.roles.includes(p.role_id) &&
              p.permissions.some((p1) => item.permission.includes(p1))
            );
          } else {
            return (
              all_permission.roles.includes(p.role_id) &&
              p.permissions.includes(item.permission)
            );
          }
        });

        if (item.checkPermission && permissions) {
          if (Array.isArray(item.permission)) {
            item.regions = permissions.reduce((a: Region[], c) => {
              const checkPermission = c.permissions.some((p) =>
                item.permission.includes(p),
              );
              return checkPermission ? a.concat(c.region) : a;
            }, []);
          } else {
            item.regions = permissions[0]?.region;
          }
        }

        return item;
      });
      setList(updatedList);
    };
    updateList();

    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  return (
    <Layout headerProps={{ variant: "new" }}>
      <div className="fixed inset-0 -z-10 bg-app-gradient" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 rounded-b-[50%_48px] bg-linear-to-br from-blue-200/70 via-violet-200/60 to-pink-200/70" />
      <div className="relative p-4 pt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {list.map((item) => {
          let title = item.title;
          let subtitle = item.subtitle;

          if (
            active_permission?.region[active_region_index]?.state_id !== 27 &&
            item.permission === "book_delivery_seva"
          ) {
            title = "seva.title.book_not_receive";
            subtitle = "seva.subtitle.book_not_receive";
          }
          return item.regions && item.regions.length > 1 ? (
            <SevaCardWithMenu
              key={item.href}
              variant="new"
              theme={item.theme}
              href={item.href}
              Icon={item.Icon}
              title={t(title)!}
              permission={item.permission}
              subtitle={subtitle && t(subtitle)!}
              changePermission={item?.setPermission}
              regions={item.regions}
            />
          ) : (
            <SevaCard
              key={item.href}
              variant="new"
              theme={item.theme}
              href={item.href}
              Icon={item.Icon}
              title={t(title)!}
              permission={item.permission}
              subtitle={subtitle && t(subtitle)!}
              changePermission={item?.setPermission}
            />
          );
        })}
      </div>
    </Layout>
  );
};

Home.requireAuth = true;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "home"])),
    },
  };
};

export default Home;
