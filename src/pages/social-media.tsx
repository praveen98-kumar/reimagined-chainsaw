import SevaCard, { SevaCardWithMenu } from "@/components/card/SevaCard";
import Icon from "@/components/Icon";
import Layout from "@/components/Layout";
import apiClient from "@/http/index";
import { setUserPermission, updateRole } from "@/redux/features/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import type { Region } from "@/shared/interfaces/user";
import useAuthSync from "@/hooks/useAuthSync";
import type { GetStaticProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { type ReactNode, useEffect, useRef, useState } from "react";
import type { NextApplicationPage } from "@/shared/interfaces/app";

interface ISevaList {
  href: string;
  Icon: ReactNode;
  title: string;
  subtitle?: string;
  permission: string | string[];
  setPermission?: boolean;
  checkPermission?: boolean;
  regions?: Array<Region>;
}

const sevaList: ISevaList[] = [
  {
    href: "/seva/order",
    Icon: <Icon src="/assets/icons/edit3.png" />,
    title: "seva.title.book_order_seva",
    subtitle: "seva.subtitle.book_order_seva",
    permission: "book_order_seva",
    setPermission: true,
    checkPermission: true,
  },
  {
    href: "/seva/social",
    Icon: <Icon src="/assets/icons/social_media_platforms.png" />,
    title: "seva.title.social_media_inner",
    subtitle: "seva.subtitle.social_media_inner",
    permission: "social_media_seva",
    setPermission: true,
    checkPermission: true,
  },
];

const Home: NextApplicationPage = () => {
  const [list, setList] = useState<ISevaList[]>(sevaList);
  useAuthSync();
  const { user, all_permission, active_permission } = useAppSelector(
    (state) => state.auth,
  );
  const { t } = useTranslation("home");
  const mounted = useRef<boolean>(false);
  const dispatch = useAppDispatch();

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
          item.regions = permissions[0]?.region;
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
    <Layout headerProps={{ isBack: true, heading: "Social Media Seva" }}>
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {list.map((item) => {
          const title =
            item.title === "seva.title.social_media_inner"
              ? active_permission?.role === "social_media_sevadar"
                ? "SM Seva Form"
                : "SM Seva Report"
              : t(item.title)!;
          const subTitle =
            item.title === "seva.title.social_media_inner"
              ? active_permission?.role === "social_media_sevadar"
                ? "SM Seva Form"
                : "SM Seva Report"
              : item?.subtitle && t(item?.subtitle)!!;
          return item.regions && item.regions.length > 1 ? (
            <SevaCardWithMenu
              key={item.href}
              href={item.href}
              Icon={item.Icon}
              title={title}
              permission={item.permission}
              subtitle={subTitle}
              changePermission={item?.setPermission}
              regions={item.regions}
            />
          ) : (
            <SevaCard
              key={item.href}
              href={item.href}
              Icon={item.Icon}
              title={t(item.title)!}
              permission={item.permission}
              subtitle={item?.subtitle && t(item.subtitle)!}
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
