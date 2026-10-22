import Layout from "@/components/Layout";
import { GetStaticProps } from "next";
import ListItem, { IListItem } from "@/components/ListItem";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React from "react";
import Icon from "@/components/Icon";
import { useTranslation } from "react-i18next";
import AddSevadarButton from "@/components/AddSevadarButton";

const sevaItems: Array<IListItem> = [
  {
    href: "allot",
    title: "old.seva.title.allot",
    subtitle: "old.seva.subtitle.allot",
    permission: "old_calling_seva_allot",
    Icon: <Icon containerClass="w-9 h-9" src="/assets/icons/allotUser.png" />,
  },
  {
    href: "list",
    title: "old.seva.title.list",
    subtitle: "old.seva.subtitle.list",
    permission: "old_calling_seva_list",
    Icon: <Icon containerClass="w-9 h-9" src="/assets/icons/calling.png" />,
  },
  {
    href: "records",
    title: "old.seva.title.records",
    subtitle: "old.seva.title.records",
    permission: "old_calling_seva_records",
    Icon: <Icon containerClass="w-9 h-9" src="/assets/icons/calling.png" />,
  },
];

const OldCallingPage = () => {
  const { t } = useTranslation("calling");
  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: t("old.heading") ?? "Old Calling Seva",
      }}
    >
      <div className="p-4 mx-auto max-w-xl w-full space-y-4 ">
        {sevaItems.map((sevaItem) => (
          <ListItem
            item={{ ...sevaItem, href: `old-calling/${sevaItem.href}` }}
            key={sevaItem.href}
          />
        ))}
        <AddSevadarButton
          permission="add_namdan_calling_sevadar"
          params={{
            type: "namdan_calling",
            role: "namdan_calling_sevadar",
          }}
        />
      </div>
    </Layout>
  );
};

export default OldCallingPage;

OldCallingPage.requireAuth = true;
export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "calling"])),
    },
  };
};
