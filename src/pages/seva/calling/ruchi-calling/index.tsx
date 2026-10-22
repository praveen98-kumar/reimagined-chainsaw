import Layout from "@/components/Layout";
import ListItem, { IListItem } from "@/components/ListItem";
import React, { useEffect } from "react";
import { NextApplicationPage } from "@/shared/interfaces/app";
import Link from "next/link";
import useLocalstorage from "@/hooks/useLocalstorage";
import Icon from "@/components/Icon";
import { isValidUser } from "@/shared/functions/utils";
import AddSevadarButton from "@/components/AddSevadarButton";
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
    href: "/seva/calling/ruchi-calling/list-in",
    Icon: (
      <Icon containerClass="w-9 h-9" src="/assets/icons/ruchiInCalling.png" />
    ),
    title: "ruchi.seva.title.seva_in",
    subtitle: "ruchi.seva.subtitle.seva_in",
    count: 22,
    permission: "jyada_ruchi_seva_list",
  },
  {
    href: "/seva/calling/ruchi-calling/list-in",
    Icon: (
      <Icon containerClass="w-9 h-9" src="/assets/icons/ruchiInCalling.png" />
    ),
    title: "ruchi.seva.title.record_in",
    subtitle: "ruchi.seva.subtitle.record_in",
    count: 22,
    permission: "jyada_ruchi_seva_records",
  },
  {
    href: "/seva/calling/ruchi-calling/list-out",
    Icon: (
      <Icon containerClass="w-9 h-9" src="/assets/icons/ruchiOutCalling.png" />
    ),
    title: "ruchi.seva.title.seva_out",
    subtitle: "ruchi.seva.subtitle.seva_out",
    count: 22,
    permission: "jyada_ruchi_seva_list",
  },
  {
    href: "/seva/calling/ruchi-calling/list-out?type=1",
    Icon: (
      <Icon containerClass="w-9 h-9" src="/assets/icons/ruchiOutCalling.png" />
    ),
    title: "ruchi.seva.title.record_out",
    subtitle: "ruchi.seva.subtitle.record_out",
    count: 22,
    permission: "jyada_ruchi_seva_records",
  },
];

const RuchiCalling: NextApplicationPage = () => {
  const { t: tc } = useTranslation("common");
  const { t } = useTranslation("calling");
  const [, , removeState] = useLocalstorage("searchSevadars");
  const bottomButtonClass = `w-full space-x-2 text-white bg-black font-bold px-2 h-14 rounded-lg flex items-center justify-center`;
  useEffect(() => {
    removeState("searchSevadars");
    removeState("searchDisciples");
  }, []);
  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: t("ruchi.heading") ?? "Jyada Ruchi Calling seva",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <StatusCard
          path="jyada_ruchi_count"
          type="jyadaRuchiCounts"
          sevadar_type="jyada_ruchi_sevadar"
        >
          {({ values, isLoading }) => (
            <React.Fragment>
              <StatusCardTitle>{"Seva Status"}</StatusCardTitle>
              <StatusCardGrid>
                <StatusCardBox
                  label={tc("pending_in")}
                  count={values?.pending_order_in}
                  status="red"
                  className="min-h-[80px]"
                  isLoading={isLoading}
                />
                <StatusCardBox
                  label={tc("pending_out")}
                  count={values?.pending_order}
                  status={"red"}
                  className="min-h-[80px]"
                  isLoading={isLoading}
                />
                <StatusCardBox
                  label={tc("ctm")}
                  count={values?.ctm}
                  status={"green"}
                  className="col-span-2 min-h-[80px]"
                  isLoading={isLoading}
                />
              </StatusCardGrid>
            </React.Fragment>
          )}
        </StatusCard>
        <div>
          {sevaItem.map((item, index) => (
            <ListItem item={item} key={index} />
          ))}
        </div>
        <AddSevadarButton
          permission="add_jyada_ruchi_sevadar"
          params={{
            type: "jyada_ruchi",
            role: "jyada_ruchi_sevadar",
          }}
        />
        <div className="grid w-full grid-cols-2 auto-cols-max gap-4">
          {isValidUser("jyada_ruchi_seva_reports") && (
            <Link href={"/report?url=jyada_ruchi_calling_report"}>
              <button className={bottomButtonClass}>
                <Icon
                  src="/assets/icons/reportYellow.png"
                  containerClass="w-5 h-5"
                />
                <span>{tc("report")}</span>
              </button>
            </Link>
          )}
          {isValidUser("jyada_ruchi_seva_upload_list") && (
            <Link href={"/seva/calling/ruchi-calling/upload"}>
              <button className={bottomButtonClass}>
                <Icon
                  src="/assets/icons/reportYellow.png"
                  containerClass="w-5 h-5"
                />
                <span>{t("ruchi.upload")}</span>
              </button>
            </Link>
          )}
          {isValidUser("jyada_ruchi_seva_download_list") && (
            <Link href={"/download?url=download_jyada_ruchi_list"}>
              <button className={bottomButtonClass}>
                <Icon
                  src="/assets/icons/reportYellow.png"
                  containerClass="w-5 h-5"
                />
                <span>{t("ruchi.download")}</span>
              </button>
            </Link>
          )}
        </div>
      </div>
    </Layout>
  );
};

RuchiCalling.requireAuth = true;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "calling"])),
    },
  };
};

export default RuchiCalling;
