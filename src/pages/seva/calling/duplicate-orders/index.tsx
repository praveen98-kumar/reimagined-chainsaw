import AddSevadarButton from "@/components/AddSevadarButton";
import CountCard, { CountCardBox } from "@/components/card/CountCard";
import Icon from "@/components/Icon";
import Layout from "@/components/Layout";
import ListItem, { IListItem } from "@/components/ListItem";
import { useAppSelector } from "@/redux/store";
import useLocalstorage from "@/hooks/useLocalstorage";
import { useEffect } from "react";
import { NextApplicationPage } from "@/shared/interfaces/app";
import LinkButton, { LinkButtonContainer } from "@/components/LinkButton";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "react-i18next";
import StatusCard, {
  StatusCardTitle,
  StatusCardGrid,
  StatusCardBox,
} from "@/components/StatusCard";
import React from "react";
import { cn } from "@/shared/functions/utils";

const sevalist: IListItem[] = [
  {
    href: "/users/allot?seva_type=duplicate_order",
    Icon: (
      <Icon
        containerClass="w-9 h-full mt-2"
        src="/assets/icons/allotUser.png"
        className="w-10 h-10"
      />
    ),
    title: "Allot Seva",
    subtitle: "Find the number alloted to you for book calling seva here.",
    count: 22,
    permission: "duplicate_order_seva_allot_seva",
  },
  {
    href: "/seva/calling/duplicate-orders/records",
    Icon: <Icon containerClass="w-9 h-9" src="/assets/icons/calling.png" />,
    title: "Duplicate Seva Records",
    subtitle: "Find records of previously done seva here.",
    count: 22,
    permission: "duplicate_order_seva_records",
  },
  {
    href: "/seva/calling/duplicate-orders/list",
    Icon: <Icon containerClass="w-9 h-9" src="/assets/icons/calling.png" />,
    title: "Duplicate Seva",
    subtitle: "Find the number alloted to you for book calling seva here.",
    count: 22,
    permission: "duplicate_order_seva_list",
    // roles: ["duplicate_order_sevadar"],
  },
];

const DuplicateOrder: NextApplicationPage = () => {
  const { t } = useTranslation("calling");
  const { t: tc } = useTranslation("common");
  const [, , removeState] = useLocalstorage("searchSevadars");
  const { active_permission } = useAppSelector((state) => state.auth);
  useEffect(() => {
    removeState("searchSevadars");
    removeState("searchDisciples");
    // dispatch(getCounts("duplicate_order_counts", "duplicateCounts"));
  }, []);
  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: t("duplicate.heading") ?? "Duplicate Seva",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <StatusCard
          path="duplicate_order_counts"
          type="duplicateCounts"
          sevadar_type="duplicate_order_sevadar"
        >
          {({ values, isLoading }) => (
            <React.Fragment>
              <StatusCardTitle>
                {t("duplicate.status") ?? "Duplicate Seva Status"}
              </StatusCardTitle>
              <StatusCardGrid>
                <StatusCardBox
                  label={tc("allot_pending")}
                  count={values?.pending_in ?? 0}
                  status={"red"}
                  isLoading={isLoading}
                  className={cn("min-h-[60px]", {
                    hidden:
                      active_permission?.role == "duplicate_order_sevadar",
                  })}
                />
                <StatusCardBox
                  label={
                    active_permission?.role === "duplicate_order_sevadar"
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
                  className={cn("min-h-[60px]", {
                    "col-span-2":
                      active_permission?.role != "duplicate_order_sevadar",
                  })}
                  status={"green"}
                />
              </StatusCardGrid>
            </React.Fragment>
          )}
        </StatusCard>
        {/* <CountCard
          title={"Duplicate Seva Status"}
          pendingCount={duplicateCounts?.pending_in}
          showPending={
            active_permission != undefined &&
            active_permission?.role !== "duplicate_order_sevadar"
          }
        >
          <CountCardBox
            title="Order Till Date"
            count={duplicateCounts?.otd}
            statusColor={"yellow"}
          />
          <CountCardBox
            title="Order This Month"
            count={duplicateCounts?.otm}
            statusColor={"yellow"}
          />
          <CountCardBox
            title="Completed Till Date"
            count={duplicateCounts?.ctd}
          />
          <CountCardBox
            title="Completed This Month"
            count={duplicateCounts?.ctm}
          />
        </CountCard> */}
        <div>
          {sevalist.map((item) => (
            <ListItem key={item.href} item={item} />
          ))}
        </div>
        <AddSevadarButton
          permission="add_duplicate_order_sevadar"
          params={{
            type: "duplicate_order",
            role: "duplicate_order_sevadar",
          }}
        />
        <LinkButtonContainer>
          <LinkButton
            permission="duplicate_order_seva_reports"
            href="/report?url=duplicate_order_report"
            iconSrc="/assets/icons/reportYellow.png"
            title={tc("report")}
          />
          <LinkButton
            permission="duplicate_order_seva_download_list"
            href="/download?url=download_duplicate_orders"
            iconSrc="/assets/icons/reportYellow.png"
            title={t("duplicate.download")}
          />
        </LinkButtonContainer>
      </div>
    </Layout>
  );
};

DuplicateOrder.requireAuth = true;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "calling"])),
    },
  };
};

export default DuplicateOrder;
