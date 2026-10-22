import { NextApplicationPage } from "@/shared/interfaces/app";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React from "react";
import Icon from "@/components/Icon";
import Layout from "@/components/Layout";
import SevaCard from "@/components/card/SevaCard";
import { useTranslation } from "react-i18next";

interface ISevaList {
  href: string;
  Icon: React.ReactNode;
  title: string;
  subtitle?: string;
  permission: string;
  setPermission?: boolean;
}

const sevaList: Array<ISevaList> = [
  {
    href: "/permission/role-permission",
    Icon: (
      <Icon
        className="w-10 h-10"
        containerClass="w-10 h-7"
        src="/assets/icons/allotRoles.png"
      />
    ),
    title: "seva.title.role_permission",
    subtitle: "seva.subtitle.role_permission",
    permission: "allot_roles_update_roles",
    setPermission: true,
  },
  {
    href: "/permission/user-permission",
    Icon: (
      <Icon
        className="w-10 h-10"
        containerClass="w-10 h-7"
        src="/assets/icons/allotRoles.png"
      />
    ),
    title: "seva.title.user_permission",
    subtitle: "seva.subtitle.user_permission",
    permission: "allot_roles_update_roles",
    setPermission: true,
  },
];

const PermissionPage: NextApplicationPage = () => {
  const { t } = useTranslation("home");
  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: t("seva.title.permission") ?? "Permissions",
      }}
    >
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {sevaList.map((item) => {
          return (
            <SevaCard
              key={item.href}
              href={item.href}
              Icon={item.Icon}
              title={t(item.title)!}
              permission={item.permission}
              subtitle={item.subtitle && t(item.subtitle)!}
              changePermission={item?.setPermission}
            />
          );
        })}
      </div>
    </Layout>
  );
};

PermissionPage.requireAuth = true;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "home"])),
    },
  };
};

export default PermissionPage;
