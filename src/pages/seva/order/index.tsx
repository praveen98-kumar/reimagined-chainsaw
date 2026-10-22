import useLocalstorage from "@/hooks/useLocalstorage";
import useLocalStorage from "@/hooks/useLocalstorage";
import type { GetStaticProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FaSearch, FaUsers } from "react-icons/fa";
import type { NextApplicationPage } from "@/shared/interfaces/app";
import AddSevadarButton from "@/components/AddSevadarButton";
import SevaCard from "@/components/card/SevaCard";
import UserCard from "@/components/card/UserCard";
import Icon from "@/components/Icon";
import Layout from "@/components/Layout";
import OtherLoginModal from "@/components/modal/OtherLoginModal";
import { OtherLoginPin } from "@/components/modal/OtherLoginPinModal";
import StatusCard, {
  StatusCardBox,
  StatusCardGrid,
  StatusCardTitle,
} from "@/components/StatusCard";
import apiClient from "@/http/index";
import { useAppSelector } from "@/redux/store";
import { isValidUser } from "@/shared/functions/utils";

interface ISevaList {
  href: string;
  Icon: React.ReactNode;
  title: string;
  subtitle?: string;
  permission: string;
}

const sevaList: ISevaList[] = [
  {
    href: "/seva/order/form?countryType=national",
    Icon: <Icon src="/assets/icons/edit2.png" />,
    title: "seva.title.order_form_national",
    subtitle: "Enter National Book order details here",
    permission: "create_book_order",
  },
  {
    href: "/seva/order/form?countryType=national&emergency=1",
    Icon: <Icon src="/assets/icons/timerRed.png" />,
    title: "seva.title.emergency_order_national",
    subtitle: "Enter National Book order details here",
    permission: "create_book_order",
  },
  {
    href: "/seva/order/form?countryType=international",
    Icon: <Icon src="/assets/icons/edit1.png" />,
    title: "seva.title.order_form_international",
    subtitle: "Enter International Book order details here",
    permission: "create_book_order",
  },
  {
    href: "/seva/order/upload?countryType=national",
    Icon: <Icon src="/assets/icons/edit5.png" />,
    title: "seva.title.upload_national",
    subtitle: "Upload Nation Book Order Details here.",
    permission: "upload_national_orders",
  },
  {
    href: "/seva/order/uploadOrder",
    Icon: <Icon src="/assets/icons/edit5.png" />,
    title: "seva.title.upload_national_sm",
    subtitle: "Upload Nation Book Order Details here.",
    permission: "sm_office_order_upload",
  },
  {
    href: "/download?url=download_national_orders",
    Icon: <Icon src="/assets/icons/edit4.png" />,
    title: "seva.title.download_national",
    subtitle: "Download National Book Order Details here.",
    permission: "download_national_order_list",
  },
  {
    href: "/download?url=download_international_orders",
    Icon: <Icon src="/assets/icons/edit4.png" />,
    title: "seva.title.download_international",
    subtitle: "Download International Book Order Details here.",
    permission: "download_international_order_list",
  },
];

const Order: NextApplicationPage = () => {
  const router = useRouter();
  const { t: tc } = useTranslation("common");
  const { t } = useTranslation("order");
  const { user, active_permission } = useAppSelector((s) => s.auth);
  const [otherUser, setOtherUser, removeOtherUser] = useLocalStorage<any>(
    "other_user",
    null
  );
  const [pin, setPin] = useState(undefined);
  const [loading, setLoading] = useState(false);

  const [, , removeState] = useLocalstorage("searchDisciples", null);
  function otherLogout() {
    removeOtherUser();
    localStorage.removeItem("seva_by");
    router.back();
  }
  async function getLoginPin() {
    try {
      setLoading(true);
      const response = await apiClient.get("other_login_pin");
      setPin(response.data.data.pin);
    } catch (e: any) {
      toast.error(e?.message);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    removeState();
    removeState("searchSevadars");
  }, [removeState]);

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: t("seva.heading.main") ?? "Book Order Seva",
      }}
    >
      <div className="p-4 flex flex-col mx-auto w-full max-w-xl h-full">
        <div className="space-y-4 flex-1">
          {(!otherUser && user?.id !== 11849) ||
          (user?.id === 11849 &&
            active_permission?.role !== "ashram_sevadar") ? (
            <StatusCard
              path="book_order_count"
              type="bookOrderCounts"
              sevadar_type="book_order_sevadar"
            >
              {({ values, isLoading }) => (
                <React.Fragment>
                  <StatusCardTitle>
                    {t("status.book_order_status") ?? "Book Order Status"}
                  </StatusCardTitle>
                  <StatusCardGrid>
                    <StatusCardBox
                      label={t("today_national")}
                      count={values?.tnc ?? 0}
                      status="yellow"
                      isLoading={isLoading}
                    />
                    <StatusCardBox
                      label={t("today_international")}
                      count={values?.tic ?? 0}
                      status="yellow"
                      isLoading={isLoading}
                    />
                    <StatusCardBox
                      label={t("month_national")}
                      count={values?.mnc ?? 0}
                      status={"green"}
                      isLoading={isLoading}
                    />
                    <StatusCardBox
                      label={t("month_international")}
                      count={values?.mic ?? 0}
                      status={"green"}
                      isLoading={isLoading}
                    />
                  </StatusCardGrid>
                </React.Fragment>
              )}
            </StatusCard>
          ) : null}
          {otherUser && (
            <UserCard
              user={{
                ...otherUser,
                location: [
                  otherUser.tehsil_name,
                  otherUser.district_name,
                  otherUser.state_name,
                ],
              }}
            />
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {sevaList.map((item) => {
              return (
                <SevaCard
                  key={item.href}
                  href={item.href}
                  Icon={item.Icon}
                  title={t(item.title)!}
                  subtitle={item.subtitle}
                  permission={item.permission}
                  showSubTitle={false}
                />
              );
            })}
          </div>
          {isValidUser("sevadar_list") && (
            <Link
              href={"/seva/order/sevadar-list?sevaType=book_order"}
              className="p-2 gap-2 cursor-pointer rounded-lg bg-white border border-gray-400 drop-shadow-lg flex items-center justify-center font-bold text-primary text-lg"
            >
              <FaUsers size={24} />
              Sevadar List
            </Link>
          )}
          <AddSevadarButton
            permission="add_book_order_sevadar"
            params={{
              type: "book_order",
              role: "book_order_sevadar",
            }}
          />
          <div className="grid w-full grid-cols-2 auto-cols-max gap-4">
            {isValidUser("order_seva_reports") && (
              <Link href={"/report?url=book_order_report"}>
                <button
                  type="button"
                  className="w-full bg-black text-white rounded-lg h-16 px-1 justify-center flex items-center gap-3"
                >
                  <Icon
                    src="/assets/icons/reportYellow.png"
                    containerClass="w-7 h-7"
                  />
                  <span>{tc("report")}</span>
                </button>
              </Link>
            )}
            {isValidUser("track_order") && (
              <Link href={"/seva/order/track-order?type=track-order"}>
                <button
                  type="button"
                  className="w-full bg-black text-white rounded-lg h-16 px-1 justify-center flex items-center gap-3"
                >
                  <Icon
                    src="/assets/icons/Track Orders.png"
                    containerClass="w-7 h-7"
                  />
                  <span>{t("track_order")}</span>
                </button>
              </Link>
            )}
            {isValidUser("create_book_order") && (
              <Link href={"/seva/order/list"}>
                <button
                  type="button"
                  className="w-full bg-black text-white rounded-lg h-16 px-1 justify-center flex items-center gap-3"
                >
                  <span>{t("order_list")}</span>
                </button>
              </Link>
            )}
            {isValidUser("search_book_order") && (
              <Link href={"/seva/order/search"}>
                <button
                  type="button"
                  className="w-full bg-black text-white rounded-lg h-16 px-1 justify-center flex items-center gap-3"
                >
                  <FaSearch className="w-5 h-5" />
                  <span>{tc("search")}</span>
                </button>
              </Link>
            )}
            {!otherUser && isValidUser("other_login") && (
              <>
                <OtherLoginModal onSuccess={setOtherUser} />
                <button
                  type="button"
                  onClick={getLoginPin}
                  disabled={loading}
                  className="w-full bg-black text-white rounded-lg h-16 px-1 justify-center flex items-center gap-3"
                >
                  <span>{t("Share Login")}</span>
                </button>
              </>
            )}
          </div>
        </div>
        {otherUser && isValidUser("other_login") && (
          <button
            type="button"
            onClick={otherLogout}
            className="my-auto w-1/2 mx-auto bg-black text-white rounded-lg h-16 px-1 justify-center flex items-center gap-3"
          >
            Logout
          </button>
        )}
      </div>
      <OtherLoginPin
        show={pin != undefined}
        title={pin + ""}
        onClose={() => setPin(undefined)}
      />
    </Layout>
  );
};

Order.requireAuth = true;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "order"])),
    },
  };
};

export default Order;
