import Layout from "@/components/Layout";
import ListItem, { IListItem } from "@/components/ListItem";
import React, { useEffect } from "react";
import { NextApplicationPage } from "@/shared/interfaces/app";
import useLocalstorage from "@/hooks/useLocalstorage";
import Icon from "@/components/Icon";
import { useAppSelector } from "@/redux/store";
import AddSevadarButton from "@/components/AddSevadarButton";
import LinkButton, { LinkButtonContainer } from "@/components/LinkButton";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "react-i18next";
import StatusCard, {
  StatusCardBox,
  StatusCardGrid,
  StatusCardTitle,
} from "@/components/StatusCard";

const sevaItem: IListItem[] = [
  {
    href: "/users/allot?seva_type=miss_call",
    Icon: <Icon containerClass="w-9 h-9" src="/assets/icons/allotUser.png" />,
    title: "miss.seva.title.allot",
    subtitle: "miss.seva.subtitle.allot",
    count: 22,
    permission: "missed_call_seva_allot_seva",
  },
  {
    href: "/seva/calling/missed-calling/list",
    Icon: <Icon containerClass="w-9 h-9" src="/assets/icons/missCalling.png" />,
    title: "miss.seva.title.list",
    subtitle: "miss.seva.subtitle.list",
    count: 22,
    permission: "missed_call_seva_list",
  },
  {
    href: "/seva/calling/missed-calling/list?type=1",
    Icon: <Icon containerClass="w-9 h-9" src="/assets/icons/missCalling.png" />,
    title: "miss.seva.title.records",
    subtitle: "miss.seva.subtitle.records",
    count: 22,
    permission: "missed_call_seva_records",
    roles: ["miss_call_team_leader"],
  },
];

const MissedCalling: NextApplicationPage = () => {
  const { t } = useTranslation("calling");
  const { t: tc } = useTranslation("common");
  const { active_permission } = useAppSelector((state) => state.auth);
  const [, , removeState] = useLocalstorage("searchSevadars");
  useEffect(() => {
    removeState("searchSevadars");
    removeState("searchDisciples");
  }, []);
  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: t("miss.heading") ?? "Missed Call Calling seva",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <StatusCard
          path="miss_call_count"
          type="missCallCounts"
          sevadar_type="miss_call_sevadar"
        >
          {({ values, isLoading }) => (
            <React.Fragment>
              <StatusCardTitle>
                {t("miss.status") ?? "Missed Call - Calling Seva"}
              </StatusCardTitle>
              <StatusCardGrid>
                <StatusCardBox
                  label={tc("allot_pending")}
                  count={values?.pending_in ?? 0}
                  status={"red"}
                  isLoading={isLoading}
                  className="min-h-[60px]"
                />
                <StatusCardBox
                  label={
                    active_permission?.role === "miss_call_sevadar"
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
                  label={tc("ctm")}
                  count={values?.ctm ?? 0}
                  className="col-span-2 min-h-[60px]"
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
          permission="add_miss_call_sevadar"
          params={{
            type: "miss_call",
            role: "miss_call_sevadar",
          }}
        />
        <LinkButtonContainer>
          <LinkButton
            permission="missed_call_seva_reports"
            href="/report?url=miss_calling_report"
            iconSrc="/assets/icons/reportYellow.png"
            title={tc("report")}
          />
          <LinkButton
            permission="missed_call_seva_upload_list"
            href="/seva/calling/missed-calling/upload"
            iconSrc="/assets/icons/reportYellow.png"
            title={t("miss.upload")}
          />
          <LinkButton
            permission="missed_call_seva_download_list"
            href="/download?url=download_missedcall_list"
            iconSrc="/assets/icons/reportYellow.png"
            title={t("miss.download")}
          />
        </LinkButtonContainer>
      </div>
    </Layout>
  );
};
MissedCalling.requireAuth = true;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "calling"])),
    },
  };
};

export default MissedCalling;
