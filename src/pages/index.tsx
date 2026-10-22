import type { GetStaticProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { ImBooks } from "react-icons/im";
import { IoLanguageSharp } from "react-icons/io5";
import { MdLocationOn } from "react-icons/md";
import SevaCard, { SevaCardWithMenu } from "@/components/card/SevaCard";
import Icon from "@/components/Icon";
import Layout from "@/components/Layout";
import useAuthSync from "@/hooks/useAuthSync";
import apiClient from "@/http/index";
import { setUserPermission, updateRole } from "@/redux/features/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import type { NextApplicationPage } from "@/shared/interfaces/app";
import type { Region } from "@/shared/interfaces/user";

interface ISevaList {
  href: string;
  Icon: React.ReactNode;
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
    Icon: <Icon src="/assets/icons/social_media_platforms.png" />,
    title: "Social Media New",
    subtitle: "seva.subtitle.social_media",
    permission: ["social_media_seva", "book_order_seva"],
    setPermission: true,
    checkPermission: true,
  },
  {
    href: "/social-media",
    Icon: <Icon src="/assets/icons/social_media_platforms.png" />,
    title: "seva.title.social_media",
    subtitle: "seva.subtitle.social_media",
    permission: ["social_media_seva", "book_order_seva"],
    setPermission: true,
    checkPermission: false,
  },
  {
    href: "/seva/delivery",
    Icon: <Icon src="/assets/icons/book.png" className="h-10 w-10" />,
    title: "seva.title.book_delivery_seva",
    subtitle: "seva.subtitle.book_delivery_seva",
    permission: "book_delivery_seva",
    setPermission: true,
    checkPermission: true,
  },
  {
    href: "/seva/calling",
    Icon: <Icon src="/assets/icons/calling.png" />,
    // subtitle: "",
    title: "seva.title.calling_seva",
    subtitle: "seva.subtitle.calling_seva",
    permission: "calling_seva",
    setPermission: false,
    checkPermission: false,
  },
  {
    href: "/seva/allotseva/allotRoles",
    Icon: (
      <Icon
        className="w-10 h-10"
        containerClass="w-10 h-7"
        src="/assets/icons/allotRoles.png"
      />
    ),
    title: "seva.title.allot_role",
    subtitle: "seva.subtitle.allot_role",
    permission: "allot_roles",
    setPermission: true,
    checkPermission: false,
  },
  {
    href: "/seva/transfer/list",
    Icon: <Icon src="/assets/icons/userTransfer.png" />,
    title: "seva.title.transfer",
    subtitle: "seva.subtitle.transfer",
    permission: "transfer_sevadar",
    setPermission: true,
    checkPermission: false,
  },
  {
    href: "/permission",
    Icon: (
      <Icon
        className="w-10 h-10"
        containerClass="w-10 h-7"
        src="/assets/icons/allotRoles.png"
      />
    ),
    title: "seva.title.permission",
    subtitle: "seva.subtitle.permission",
    permission: "allot_role_permissions",
    setPermission: true,
    checkPermission: false,
  },
  {
    href: "/assign-permission",
    Icon: (
      <Icon
        className="w-10 h-10"
        containerClass="w-10 h-7"
        src="/assets/icons/allotRoles.png"
      />
    ),
    title: "seva.title.assign_permission",
    subtitle: "seva.subtitle.assign_permission",
    permission: "role_creation_permission",
    setPermission: true,
    checkPermission: false,
  },
  {
    href: "/seva/post",
    Icon: (
      <Icon
        className="w-10 h-10"
        containerClass="w-10 h-7"
        src="/assets/icons/Postal-Book-Delivery-Seva.png"
      />
    ),
    title: "seva.title.post_order_seva",
    subtitle: "seva.subtitle.post_order_seva",
    permission: "post_order_seva",
    setPermission: true,
    checkPermission: false,
  },
  //TODO: Replace icon and add new permission to handle/manage channels
  {
    href: "/seva/channels",
    Icon: <Icon src="/assets/icons/calling.png" />,
    title: "seva.title.channels_seva",
    subtitle: "seva.subtitle.channels_seva",
    permission: "add_satsang_channel",
    setPermission: true,
    checkPermission: false,
  },
  {
    href: "/users/disciplelist",
    Icon: <Icon src="/assets/icons/Download Order list.png" />,
    title: "seva.title.export_disciples",
    subtitle: "seva.subtitle.export_disciples",
    permission: "export_disciples",
    setPermission: true,
    checkPermission: false,
  },
  {
    href: "/admin/books",
    Icon: <ImBooks className="text-orange-500 w-6 h-6" />,
    title: "seva.title.manage_books",
    permission: "add_book",
    setPermission: true,
    checkPermission: false,
  },
  {
    href: "/admin/languages",
    Icon: <IoLanguageSharp className="text-blue-500 w-6 h-6" />,
    title: "seva.title.book_language",
    permission: "add_language",
    setPermission: true,
    checkPermission: false,
  },
  {
    href: "/admin/pincode/set",
    Icon: <MdLocationOn className="text-cyan-500 w-6 h-6" />,
    title: "seva.title.set_pincode",
    permission: "add_pincode",
    setPermission: true,
    checkPermission: false,
  },
  {
    href: "/admin/sangat_list/list",
    Icon: (
      <Icon
        className="w-10 h-10"
        containerClass="w-10 h-7"
        src="/assets/icons/allotRoles.png"
      />
    ),
    title: "seva.title.sangat_list",
    permission: "sangat_list",
    setPermission: true,
    checkPermission: true,
  },
  {
    href: "/seva/complain",
    Icon: <Icon src="/assets/icons/Book Order complaint.png" />,
    title: "seva.title.book_order_complain_seva",
    subtitle: "seva.subtitle.book_order_complain_seva",
    permission: "book_complain_seva",
    setPermission: true,
    checkPermission: true,
  },
  {
    href: "/seva/ramaini",
    Icon: <Icon src="/assets/icons/Book Order complaint.png" />,
    title: "seva.title.ramaini_seva",
    subtitle: "seva.subtitle.ramaini_seva",
    permission: "ramaini_seva",
    setPermission: true,
    checkPermission: true,
  },
  {
    href: "/register",
    Icon: <Icon src="/assets/icons/allotUser.png" />,
    title: "seva.title.register_user",
    permission: "add_disciple",
    setPermission: true,
    checkPermission: true,
  },
  {
    href: "/other-login",
    Icon: <Icon src="/assets/icons/userTransfer.png" />,
    title: "seva.title.other_login",
    permission: "direct_login",
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
  useEffect(() => {
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
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

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
    <Layout>
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
