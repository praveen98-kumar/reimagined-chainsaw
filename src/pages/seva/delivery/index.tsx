import React from "react";
import AddSevadarButton from "@/components/AddSevadarButton";
import Icon from "@/components/Icon";
import Layout from "@/components/Layout";
import { IListItem, DeliveryListItem as ListItem } from "@/components/ListItem";
import { useAppSelector } from "@/redux/store";
import {
  downloadFile,
  isValidUser,
  objectWithValues,
} from "@/shared/functions/utils";
import { NextApplicationPage } from "@/shared/interfaces/app";
import useLocalstorage from "@/hooks/useLocalstorage";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiFileTextLine } from "react-icons/ri";
import StatusCard, {
  StatusCardGrid,
  StatusCardTitle,
  StatusCardBox,
} from "@/components/StatusCard";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useCount } from "../../../hooks/useCount";
import LoadingSpinner from "@/components/LoadingSpinner";

dayjs.extend(timezone);
dayjs.extend(utc);

const sevalist: IListItem[] = [
  // {
  //   href: "/seva/delivery/emergency-in",
  //   Icon: <Icon containerClass="w-9 h-9" src="/assets/icons/timerRed.png" />,
  //   title: "emergency orders",
  //   subtitle:
  //     "Find emergency book delivery addresses that are accepted by you here.",
  //   permission: "delivery_seva_emergency_orders",
  //   // roles: ["book_distributor", "district_coordinator"],
  // },
  // {
  //   href: "/seva/delivery/emergency-out",
  //   Icon: <Icon containerClass="w-9 h-9" src="/assets/icons/timerRed.png" />,
  //   title: "emergency orders",
  //   subtitle:
  //     "Find emergency book delivery addresses that are accepted by you here.",
  //   permission: "book_delivery_seva_list",
  //   // roles: ["book_delivery_sevadar"],
  // },
  {
    href: "/seva/delivery/regular-in?type=0",
    Icon: <Icon containerClass="w-9 h-9" src="/assets/icons/orderIn.png" />,
    title: "seva.title.seva_in",
    subtitle: "seva.subtitle.seva_in",
    permission: "delivery_seva_regular_in",
    // roles: ["book_delivery_sevadar"],
  },
  {
    href: "/seva/delivery/regular-out?type=0",
    Icon: <Icon containerClass="w-9 h-9" src="/assets/icons/orderOut.png" />,
    title: "seva.title.seva_out",
    subtitle: "seva.subtitle.seva_out",
    permission: "delivery_seva_regular_out",
    // roles: ["book_delivery_sevadar"],
  },
  {
    href: "/seva/delivery/regular-in?type=1",
    Icon: <Icon containerClass="w-9 h-9" src="/assets/icons/orderIn.png" />,
    title: "seva.title.records_in",
    subtitle: "seva.subtitle.records_in",
    permission: "book_delivery_seva_records",
    // roles: ["book_distributor", "state_coordinator"],
  },
  {
    href: "/seva/delivery/regular-out?type=1",
    Icon: <Icon containerClass="w-9 h-9" src="/assets/icons/orderOut.png" />,
    title: "seva.title.records_out",
    subtitle: "seva.subtitle.records_out",
    permission: "book_delivery_seva_records",
    // roles: ["book_distributor", "state_coordinator"],
  },
  {
    href: "/seva/delivery/wrong-location",
    Icon: <Icon containerClass="w-9 h-9" src="/assets/icons/orderIn.png" />,
    title: "seva.title.wrong_location",
    subtitle: "seva.subtitle.wrong_location",
    permission: "update_location",
    // roles: ["book_delivery_sevadar"],
  },
  {
    href: "/seva/delivery/not-receive",
    Icon: <Icon containerClass="w-9 h-9" src="/assets/icons/orderIn.png" />,
    title: "seva.title.not_receive",
    subtitle: "seva.subtitle.not_receive",
    count: 22,
    permission: "book_not_receive_list",
  },
  {
    href: "/seva/delivery/wrong-location?type=1",
    Icon: <Icon containerClass="w-9 h-9" src="/assets/icons/orderIn.png" />,
    title: "seva.title.wrong_location_records",
    subtitle: "seva.subtitle.wrong_location_records",
    permission: "update_location_records",
    // roles: ["book_delivery_sevadar"],
  },
  {
    href: "/seva/delivery/not-receive?type=1",
    Icon: <Icon containerClass="w-9 h-9" src="/assets/icons/orderIn.png" />,
    title: "seva.title.not_receive_records",
    subtitle: "seva.subtitle.not_receive_records",
    count: 22,
    permission: "book_not_receive_records",
  },
];

const Delivery: NextApplicationPage = () => {
  const { t: tc } = useTranslation("common");
  const { t } = useTranslation("delivery");
  const [showRegular, setShowRegular] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [days, setDays] = useState<number>(0);
  const { bookDeliveryEmergencyCounts, bookDeliveryCounts } = useAppSelector(
    (state) => state.counts
  );
  const [, , removeState] = useLocalstorage("searchSevadars");
  const { getCount } = useCount();
  const { active_permission, active_region_index } = useAppSelector(
    (state) => state.auth
  );
  const activeRole = active_permission?.role;
  useEffect(() => {
    removeState("searchSevadars");
    removeState("searchDisciples");
    if (activeRole == "book_delivery_sevadar") {
      const { first_accepted_order_date } = getCount(
        "bookDeliveryCounts",
        "tehsil_id",
        Number(active_permission?.region[active_region_index]?.tehsil_id),
        activeRole + ""
      );
      if (first_accepted_order_date) {
        const firstOrderDate = dayjs(first_accepted_order_date)
          .utc(true)
          .add(330, "minute");
        setDays(dayjs().diff(firstOrderDate, "days"));
      }
    }
  }, [bookDeliveryCounts]);

  const bottomButtonClass = `w-full bg-black text-white rounded-lg h-16 px-1 justify-center flex items-center gap-3`;
  const downloadComplainOrder = async () => {
    setLoading(true);
    try {
      await downloadFile({
        endPoint: "download_complain_orders",
        fileName: "complain_orders",
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Layout
      headerProps={{
        isBack: true,
        heading:
          active_permission?.region[active_region_index]?.state_id != 27
            ? t("seva.title.not_receive_main") || "Book Not Receive Seva"
            : t("seva.title.main") || "Book Delivery Seva",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <StatusCard
          path="book_delivery_count"
          sevadar_type="book_delivery_sevadar"
          type="bookDeliveryCounts"
          className={
            days > 14
              ? "border-4 border-red-600"
              : days > 9
              ? "border-4 border-red-400"
              : ""
          }
        >
          {({ values, isLoading }) => (
            <React.Fragment>
              <StatusCardTitle>
                {t("status") || "Book Delivery Status"}
              </StatusCardTitle>
              <StatusCardGrid>
                {!showRegular &&
                active_permission?.role_id != 55 &&
                active_permission != null &&
                active_permission?.role_region == "tehsil" ? (
                  <StatusCardBox
                    className="border-gray-700 gap-1 min-h-fit"
                    label={tc("pending")}
                    count={+bookDeliveryEmergencyCounts.pending_out}
                    status={"red"}
                    isLoading={isLoading}
                  />
                ) : null}
                {active_permission &&
                  active_permission?.role_id != 55 &&
                  (showRegular ||
                    (active_permission &&
                      active_permission?.role_id != 55 &&
                      active_permission?.role_region != "tehsil")) && (
                    <>
                      <StatusCardBox
                        className="border-gray-700 gap-1 min-h-fit"
                        label={tc("pending_in")}
                        count={values?.pending_in}
                        status={"red"}
                        isLoading={isLoading}
                      />
                      <StatusCardBox
                        className="border-gray-700 gap-1 min-h-fit"
                        label={tc("pending_out")}
                        count={values?.pending_out}
                        isLoading={isLoading}
                        status={"red"}
                      />
                    </>
                  )}

                {/*<StatusCardBox*/}
                {/*  className="border-r border-b border-t border-gray-700"*/}
                {/*  label="Order Till Date"*/}
                {/*  count={values.otd}*/}
                {/*  statusColor={"yellow"}*/}
                {/*/>*/}
                {/*<StatusCardBox*/}
                {/*  className="border-l border-b border-t border-gray-700"*/}
                {/*  label="Order This Month"*/}
                {/*  count={values.otm}*/}
                {/*  statusColor={"yellow"}*/}
                {/*/>*/}
                {active_permission?.role_id != 18 &&
                  active_permission?.role_id != 55 &&
                  active_permission?.role_id != 26 && (
                    <StatusCardBox
                      className="border-gray-700 gap-1 min-h-fit"
                      label={tc("update_address")}
                      count={values?.wao}
                      isLoading={isLoading}
                      status={"red"}
                    />
                  )}
                {active_permission?.role_id != 18 &&
                  active_permission?.role_id != 26 && (
                    <StatusCardBox
                      className={`border-gray-700 gap-1 min-h-fit ${
                        active_permission?.role_id == 55 ? "col-span-2" : ""
                      }`}
                      label={tc("book_compliant")}
                      count={values?.bnro}
                      isLoading={isLoading}
                      status={"red"}
                    />
                  )}

                {active_permission?.role_id != 55 && (
                  <StatusCardBox
                    className={`border-gray-700 gap-1 min-h-fit col-span-2`}
                    status={"green"}
                    label={tc("delivered_this_month")}
                    isLoading={isLoading}
                    count={values?.ctm}
                  />
                )}
              </StatusCardGrid>
              {days > 9 && (
                <div className={"flex items-start justify-center"}>
                  <div
                    className={"bg-red-500 w-4 h-4 rounded-full mt-1 mr-1"}
                  ></div>
                  <div className={"text-red-500 font-semibold"}>
                    {days > 14 ? t("alert_15") : t("alert_10")}
                  </div>
                </div>
              )}
            </React.Fragment>
          )}
        </StatusCard>
        {/* <div className="flex items-center justify-around">
          <button
            disabled={showRegular}
            onClick={() => setShowRegular(true)}
            className={`p-1 rounded-lg mx-6 ${
              showRegular
                ? "bg-primary text-white"
                : "bg-white text-primary border border-gray-400"
            } font-semibold text-lg shadow-md w-full outline-none`}
          >
            Regular
          </button>
          <button
            disabled={!showRegular}
            onClick={() => setShowRegular(false)}
            className={`p-1 rounded-lg mx-6 ${
              !showRegular
                ? "bg-primary text-white"
                : "bg-white text-primary border border-gray-400"
            } font-semibold text-lg shadow-md w-full outline-none`}
          >
            Emergency
          </button>
        </div> */}
        <div className="border-t border-gray-300">
          {sevalist.map((item) => {
            if (typeof item.permission === "string") {
              return (
                isValidUser(item.permission, item.roles && item.roles) && (
                  <ListItem key={item.href} item={item} batchColor={"green"} />
                )
              );
            }
          })}
        </div>
        <AddSevadarButton
          permission="add_book_delivery_sevadar"
          params={{
            type: "delivery",
            role: "book_delivery_sevadar",
          }}
        />
        <div className="grid w-full grid-cols-2 auto-cols-max gap-4">
          {isValidUser("delivery_seva_regular_reports") && (
            <Link href={"/report?url=book_order_delivery_report"}>
              <button className={bottomButtonClass}>
                <RiFileTextLine className="w-7 h-7 text-yellow-500" />
                <span className="ml-1 text-sm leading-none">
                  {tc("report")}
                </span>
              </button>
            </Link>
          )}
          {isValidUser("book_delivery_whatsapp_report") && (
            <Link href={"/seva/delivery/whatsapp-report"}>
              <button className={bottomButtonClass}>
                <RiFileTextLine className="w-7 h-7 text-yellow-500" />
                <span className="ml-1 text-sm leading-none">
                  {tc("whatsapp_reports")}
                </span>
              </button>
            </Link>
          )}
          {isValidUser("update_location_status") && (
            <Link href={"/seva/delivery/update-location-state"}>
              <button className={bottomButtonClass}>
                <Icon
                  containerClass="w-7 h-7"
                  src="/assets/icons/Update Postal Locations.png"
                />
                <span className="ml-1 text-sm leading-none">
                  {t("update_location_status")}
                </span>
              </button>
            </Link>
          )}
          {isValidUser("update_postal_locations") && (
            <Link href={"/seva/delivery/update-postal-location-state"}>
              <button className={bottomButtonClass}>
                <Icon
                  containerClass="w-7 h-7"
                  src="/assets/icons/Update Postal Locations.png"
                />
                <span className="ml-1 text-sm leading-none">
                  {t("update_postal_location")}
                </span>
              </button>
            </Link>
          )}
          {isValidUser("download_order_list") && (
            <Link href={"/download?url=download_national_orders"}>
              <button className={bottomButtonClass}>
                <Icon
                  containerClass="w-7 h-7"
                  src="/assets/icons/Download Order list.png"
                />
                <span className="ml-1 text-sm leading-none">
                  {t("download_order_list")}
                </span>
              </button>
            </Link>
          )}
          {isValidUser("download_book_complain_list") && (
            <button
              className={bottomButtonClass}
              onClick={downloadComplainOrder}
              disabled={loading}
            >
              {loading ? (
                <LoadingSpinner className={"w-6 h-6 fill-white"} />
              ) : (
                <Icon
                  containerClass="w-7 h-7"
                  src="/assets/icons/Download Order list.png"
                />
              )}
              <span className="ml-1 text-sm leading-none">
                {t("download_order_list")}
              </span>
            </button>
          )}
          {isValidUser("download_postal_order_list") && (
            <Link href={"/download?url=download_postal_orders"}>
              <button className={bottomButtonClass}>
                <Icon
                  containerClass="w-7 h-7"
                  src="/assets/icons/Download Postal Order List.png"
                />
                <span className="ml-1 text-sm leading-none">
                  {t("download_postal_order_list")}
                </span>
              </button>
            </Link>
          )}
          {isValidUser("download_incomplete_order_list") && (
            <Link href={"/download?url=download_incomplete_orders"}>
              <button className={bottomButtonClass}>
                <Icon
                  containerClass="w-7 h-7"
                  src="/assets/icons/Download Incomplete orders.png"
                />
                <span className="ml-1 text-sm leading-none">
                  {t("download_incomplete_order")}
                </span>
              </button>
            </Link>
          )}
        </div>
      </div>
    </Layout>
  );
};

Delivery.requireAuth = true;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "delivery"])),
    },
  };
};

export default Delivery;
