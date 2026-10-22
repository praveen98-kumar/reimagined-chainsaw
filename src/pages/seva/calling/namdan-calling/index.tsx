import Layout from "@/components/Layout";
import { NextApplicationPage } from "@/shared/interfaces/app";
import { GetStaticProps } from "next";
import ListItem, { IListItem } from "@/components/ListItem";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Icon from "@/components/Icon";
import AddSevadarButton from "@/components/AddSevadarButton";
import LinkButton, { LinkButtonContainer } from "@/components/LinkButton";
import { getCounts } from "@/redux/features/countSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import useLocalstorage from "@/hooks/useLocalstorage";
import CountCard, { CountCardBox } from "@/components/card/CountCard";

const sevaItems: Array<IListItem> = [
  {
    href: "/seva/calling/namdan-calling/list-in",
    Icon: (
      <Icon containerClass="w-9 h-9" src="/assets/icons/ruchiInCalling.png" />
    ),
    title: "namdan.seva.title.seva_in",
    subtitle: "namdan.seva.subtitle.seva_in",
    count: 22,
    permission: "namdan_calling_list",
  },
  {
    href: "/seva/calling/namdan-calling/list-in?type=1",
    Icon: (
      <Icon containerClass="w-9 h-9" src="/assets/icons/ruchiInCalling.png" />
    ),
    title: "namdan.seva.title.records_in",
    subtitle: "namdan.seva.subtitle.records_in",
    count: 22,
    permission: "namdan_calling_records",
  },
  {
    href: "/seva/calling/namdan-calling/list-out",
    Icon: (
      <Icon containerClass="w-9 h-9" src="/assets/icons/ruchiOutCalling.png" />
    ),
    title: "namdan.seva.title.seva_out",
    subtitle: "namdan.seva.subtitle.seva_out",
    count: 22,
    permission: "namdan_calling_list",
  },
  {
    href: "/seva/calling/namdan-calling/list-out?type=1",
    title: "namdan.seva.title.records_out",
    subtitle: "namdan.seva.subtitle.records_out",
    permission: "namdan_calling_records",
    Icon: (
      <Icon containerClass="w-9 h-9" src="/assets/icons/ruchiOutCalling.png" />
    ),
  },
];

const NamdanCallingPage: NextApplicationPage = () => {
  const { t } = useTranslation("calling");
  const { t: tc } = useTranslation("common");
  const dispatch = useAppDispatch();
  const [, , removeState] = useLocalstorage("searchSevadars");

  const { namdanCallCounts } = useAppSelector((state) => state.counts);

  useEffect(() => {
    removeState("searchSevadars");
    removeState("searchDisciples");
    dispatch(getCounts("namdan_calling_count", "namdanCallCounts"));
  }, []);

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: t("namdan.heading") ?? "Namdan Calling Seva",
      }}
    >
      <div className="p-4 mx-auto max-w-xl w-full space-y-4 ">
        <CountCard title={t("namdan.status") ?? "Namdan Calling Seva Status"}>
          <CountCardBox
            title={tc("pending_in")}
            count={namdanCallCounts?.pending_order_in ?? 0}
            statusColor={"red"}
          />
          <CountCardBox
            title={tc("pending_out")}
            count={namdanCallCounts?.pending_order}
            statusColor={"red"}
          />
          {/*<CountCardBox*/}
          {/*  title={tc("otd")}*/}
          {/*  count={namdanCallCounts?.otd}*/}
          {/*  statusColor={"yellow"}*/}
          {/*/>*/}
          {/*<CountCardBox*/}
          {/*  title={tc("otm")}*/}
          {/*  count={namdanCallCounts?.otm}*/}
          {/*  statusColor={"yellow"}*/}
          {/*/>*/}
          {/*<CountCardBox title={tc("ctd")} count={namdanCallCounts?.ctd} />*/}
          <CountCardBox
            title={tc("ctm")}
            count={namdanCallCounts?.ctm}
            className={"col-span-2"}
          />
        </CountCard>

        <div className="mt-4">
          {sevaItems.map((sevaItem) => (
            <ListItem item={sevaItem} key={sevaItem.href} />
          ))}
        </div>

        <AddSevadarButton
          permission="add_namdan_calling_sevadar"
          params={{
            type: "namdan_calling",
            role: "namdan_calling_sevadar",
          }}
        />
        <LinkButtonContainer>
          <LinkButton
            permission="namdan_calling_reports"
            href="/report?url=namdan_calling_reports"
            iconSrc="/assets/icons/reportYellow.png"
            title={tc("report")}
          />
          <LinkButton
            permission="namdan_calling_upload_list"
            href="/seva/calling/namdan-calling/upload"
            iconSrc="/assets/icons/reportYellow.png"
            title={t("book.upload")}
          />
          <LinkButton
            permission="namdan_calling_download_list"
            href="/download?url=download_namdan_calling"
            iconSrc="/assets/icons/reportYellow.png"
            title={t("book.download")}
          />
        </LinkButtonContainer>
      </div>
    </Layout>
  );
};

NamdanCallingPage.requireAuth = true;
export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "calling"])),
    },
  };
};
export default NamdanCallingPage;
