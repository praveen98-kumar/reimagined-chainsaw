import AddSevadarButton from "@/components/AddSevadarButton";
import Icon from "@/components/Icon";
import Layout from "@/components/Layout";
import LinkButton from "@/components/LinkButton";
import ListItem, { IListItem } from "@/components/ListItem";
import StatusCard, {
  StatusCardBox,
  StatusCardGrid,
  StatusCardTitle,
} from "@/components/StatusCard";
import { isValidUser } from "@/shared/functions/utils";
import { NextApplicationPage } from "@/shared/interfaces/app";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React from "react";
import { useTranslation } from "react-i18next";

const sevaItem: IListItem[] = [
  {
    href: "/pradarshani_seva/form",
    Icon: <Icon src="/assets/icons/userTransfer.png" />,
    title: "list.submit",
    permission: "feedback_form",
  },
  {
    href: "/pradarshani_seva/list",
    Icon: <Icon src="/assets/icons/userTransfer.png" />,
    title: "list.view",
    permission: ["feedback_list", "feedback_export"],
  },
];

const PradarshaniSevaPage: NextApplicationPage = () => {
  const { t } = useTranslation("pradarshani");
  const { t: tc } = useTranslation("common");

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: t("title"),
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        {isValidUser("feedback_count") && (
          <StatusCard
            path="pradarshani_seva_count"
            type="pradarshaniCounts"
            sevadar_type=""
          >
            {({ values, isLoading }) => (
              <React.Fragment>
                <StatusCardTitle>{t("count.title")}</StatusCardTitle>
                <StatusCardGrid className="grid-cols-1">
                  <StatusCardBox
                    label={t("count.total")}
                    count={Number(values?.total_count || 0)}
                    status={"green"}
                    isLoading={isLoading}
                  />
                </StatusCardGrid>
              </React.Fragment>
            )}
          </StatusCard>
        )}
        <div>
          {sevaItem.map((item) => (
            <ListItem item={item} key={item.href} t={t} />
          ))}
        </div>
        <AddSevadarButton
          permission="add_pradarshani_sevadar"
          params={{
            type: "pradarshani_seva",
            role: "pradarshani_sevadar",
          }}
        />
        <LinkButton
          permission="feedback_list"
          href="/pradarshani_seva/report"
          iconSrc="/assets/icons/reportYellow.png"
          title={tc("report")}
          className="w-full"
        />
      </div>
    </Layout>
  );
};

export default PradarshaniSevaPage;

PradarshaniSevaPage.requireAuth = true;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "pradarshani"])),
    },
  };
};
