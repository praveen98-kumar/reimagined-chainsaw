import AddSevadarButton from "@/components/AddSevadarButton";
import Icon from "@/components/Icon";
import Layout from "@/components/Layout";
import ListItem, { IListItem } from "@/components/ListItem";
import { useAppSelector } from "@/redux/store";
import React from "react";
import { NextApplicationPage } from "@/shared/interfaces/app";
import LinkButton, { LinkButtonContainer } from "@/components/LinkButton";
import { GetStaticProps } from "next/types";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "react-i18next";
import StatusCard, {
  StatusCardBox,
  StatusCardGrid,
  StatusCardTitle,
} from "@/components/StatusCard";
import { cn } from "@/shared/functions/utils";

const sevaItem: IListItem[] = [
  {
    href: "/users/allot?seva_type=s_incomplete_calling",
    Icon: <Icon containerClass="w-9 h-9" src="/assets/icons/allotUser.png" />,
    title: "Allot Seva",
    subtitle: "Find the number allotted to you for calling seva here.",
    count: 22,
    permission: "s_incomplete_calling_seva_allot_seva",
  },
  {
    href: "/seva/calling/s-incomplete/list",
    Icon: (
      <Icon containerClass="w-9 h-9" src="/assets/icons/callingIncorrect.png" />
    ),
    title: "S-Incomplete Calling Seva",
    subtitle:
      "Find the number allotted to sevadar for incorrect messages calling seva here",
    count: 22,
    permission: "s_incomplete_calling_seva_list",
  },
  {
    href: "/seva/calling/s-incomplete/list?type=1",
    Icon: (
      <Icon containerClass="w-9 h-9" src="/assets/icons/callingIncorrect.png" />
    ),
    title: "S-Incomplete Calling Records",
    subtitle:
      "Find the number allotted to sevadar for incorrect messages calling seva here",
    count: 22,
    permission: "s_incomplete_calling_seva_records",
  },
];

const IncorrectMsg: NextApplicationPage = () => {
  const { t } = useTranslation("calling");
  const { t: tc } = useTranslation("common");
  const { active_permission } = useAppSelector((state) => state.auth);
  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: t("sincomplete.heading") ?? "S-Incomplete Calling Seva",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <StatusCard
          path="incorrect_orders_count"
          type="sincorrectCounts"
          sevadar_type="s_incomplete_calling_sevadar"
        >
          {({ values, isLoading }) => (
            <React.Fragment>
              <StatusCardTitle>
                {t("sincomplete.status") ?? "S-Incomplete Calling Seva Status"}
              </StatusCardTitle>
              <StatusCardGrid>
                <StatusCardBox
                  label={tc("allot_pending")}
                  count={values?.allot_pending ?? 0}
                  status={"red"}
                  isLoading={isLoading}
                  className={cn("min-h-[60px]", {
                    hidden:
                      active_permission?.role == "s_incomplete_calling_sevadar",
                  })}
                />
                <StatusCardBox
                  label={
                    active_permission?.role === "s_incomplete_calling_sevadar"
                      ? tc("pending_seva")
                      : tc("sevadar_pending")
                  }
                  count={values?.pending_order ?? 0}
                  isLoading={isLoading}
                  status={"red"}
                  className="min-h-[60px]"
                />
                <StatusCardBox
                  isLoading={isLoading}
                  label={t("sincomplete.not_interested")}
                  count={values?.not_interested ?? 0}
                  className={cn("min-h-[60px]")}
                  status={"red"}
                />
                <StatusCardBox
                  isLoading={isLoading}
                  label={tc("ctm")}
                  count={values?.ctm ?? 0}
                  className={cn("min-h-[60px]", {
                    "col-span-2":
                      active_permission?.role == "s_incomplete_calling_sevadar",
                  })}
                  status={"green"}
                />
              </StatusCardGrid>
            </React.Fragment>
          )}
        </StatusCard>
        <div>
          {sevaItem.map((item) => (
            <ListItem item={item} key={item.href} />
          ))}
        </div>
        <AddSevadarButton
          permission="add_s_incomplete_calling_sevadar"
          params={{
            type: "s_incomplete_calling",
            role: "s_incomplete_calling_sevadar",
          }}
        />
        <LinkButtonContainer className="grid-cols-1">
          <LinkButton
            permission="s_incomplete_calling_seva_reports"
            href="/report?url=s_incomplete_calling_report"
            iconSrc="/assets/icons/reportYellow.png"
            title={tc("report")}
          />
        </LinkButtonContainer>
      </div>
    </Layout>
  );
};
IncorrectMsg.requireAuth = true;
export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "calling"])),
    },
  };
};

export default IncorrectMsg;
