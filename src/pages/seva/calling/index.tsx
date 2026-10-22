import React, { useEffect, useRef, useState } from "react";
import Layout from "@/components/Layout";
import SevaCard, { SevaCardWithMenu } from "@/components/card/SevaCard";
import { NextApplicationPage } from "@/shared/interfaces/app";
import Icon from "@/components/Icon";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/redux/store";
import { Region } from "@/shared/interfaces/user";

interface ISevaList {
  href: string;
  Icon: React.ReactNode;
  title: string;
  subtitle?: string;
  permission: string;
  setPermission?: boolean;
  checkPermission?: boolean;
  regions?: Array<Region>;
}

const sevaList: ISevaList[] = [
  {
    href: "/seva/calling/book-calling",
    Icon: <Icon src="/assets/icons/calling.png" />,
    title: "book.heading",
    permission: "book_calling_seva",
    setPermission: true,
    checkPermission: true,
  },
  {
    href: "/seva/calling/ruchi-calling",
    Icon: <Icon src="/assets/icons/ruchiCalling.png" />,
    title: "ruchi.heading",
    permission: "jyada_ruchi_calling",
    setPermission: true,
    checkPermission: true,
  },
  {
    href: "/seva/calling/missed-calling",
    Icon: <Icon src="/assets/icons/missCalling.png" />,
    title: "miss.heading",
    permission: "missed_call_seva",
    setPermission: true,
    checkPermission: true,
  },
  {
    href: "/seva/calling/incorrect-message",
    Icon: <Icon src="/assets/icons/callingIncorrect.png" />,
    title: "incomplete.heading",
    permission: "incorrect_message_seva",
    setPermission: true,
    checkPermission: true,
  },
  {
    href: "/seva/calling/duplicate-orders",
    Icon: <Icon src="/assets/icons/Duplicate Orders Seva.png" />,
    title: "duplicate.heading",
    permission: "duplicate_order_seva",
    setPermission: true,
    checkPermission: true,
  },
  //*NOTE: Change permission for satnam-calling, old-calling and namdan-calling
  {
    href: "/seva/calling/satnam-calling",
    Icon: <Icon src="/assets/icons/callingIncorrect.png" />,
    title: "satnam.heading",
    permission: "satnam_calling",
    setPermission: true,
    checkPermission: true,
  },
  {
    href: "/seva/calling/namdan-calling",
    Icon: <Icon src="/assets/icons/Duplicate Orders Seva.png" />,
    title: "namdan.heading",
    permission: "namdan_calling",
    setPermission: true,
    checkPermission: true,
  },
  {
    href: "/seva/calling/old-calling",
    Icon: <Icon src="/assets/icons/Duplicate Orders Seva.png" />,
    title: "old.heading",
    permission: "old_calling_seva",
    setPermission: true,
    checkPermission: true,
  },
  {
    href: "/seva/calling/s-incomplete",
    Icon: <Icon src="/assets/icons/Duplicate Orders Seva.png" />,
    title: "sincomplete.heading",
    permission: "s_incomplete_calling_seva",
    setPermission: true,
    checkPermission: true,
  },
];
const Calling: NextApplicationPage = () => {
  const { t } = useTranslation("calling");
  const [list, setList] = useState<ISevaList[]>(sevaList);
  const { user, all_permission } = useAppSelector((state) => state.auth);
  const mounted = useRef<boolean>(false);

  useEffect(() => {
    const updateList = () => {
      const updatedList = list.map((item) => {
        const permissions = user?.permission.filter(
          (p) =>
            all_permission.roles.includes(p.role_id) &&
            p.permissions.includes(item.permission)
        );
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
    <Layout
      headerProps={{
        isBack: true,
        heading: t("heading") ?? "Calling Seva",
      }}
    >
      <div className="p-4 w-full mx-auto max-w-xl grid grid-cols-2 sm:grid-cols-3 gap-4">
        {list.map((item) => {
          return item.regions && item.regions.length > 1 ? (
            <SevaCardWithMenu
              key={item.href}
              href={item.href}
              Icon={item.Icon}
              title={t(item.title)!}
              permission={item.permission}
              subtitle={item.subtitle && t(item.subtitle)!}
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
              subtitle={item.subtitle && t(item.subtitle)!}
              changePermission={item?.setPermission}
            />
          );
        })}
      </div>
    </Layout>
  );
};

Calling.requireAuth = true;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "calling"])),
    },
  };
};

export default Calling;
