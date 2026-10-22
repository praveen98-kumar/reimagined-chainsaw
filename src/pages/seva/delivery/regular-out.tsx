import Button from "@/components/Button";
import OrderCompleteCard from "@/components/card/OrderCompleteCard";
import OrderPendingCard, {
  RecordPendingCard,
} from "@/components/card/OrderPendingCard";
import TextInput from "@/components/input/TextInput";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import GurujiAshirwadModal from "@/components/modal/GurujiAshirwadModal";
import UserwiseDropdown from "@/components/UserwiseDropdown";
import apiClient from "@/http/index";
import { filterOrders, setOrders } from "@/redux/features/orderSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { getInitialValues, objectWithValues } from "@/shared/functions/utils";
import {
  BOOK_ORDER_STATUS,
  NextApplicationPage,
  Tab,
} from "@/shared/interfaces/app";
import { Form, Formik } from "formik";
import { useCount } from "@/hooks/useCount";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { MdClose } from "react-icons/md";
import InfiniteScroll from "react-infinite-scroll-component";
import dayjs from "dayjs";
import { useInView } from "react-intersection-observer";

const RegularDeliveryOut: NextApplicationPage = () => {
  const { t: tc } = useTranslation("common");
  const { t } = useTranslation("delivery");
  const sevadartabs: Tab[] = [
    {
      label: tc("pending_seva"),
      status: BOOK_ORDER_STATUS.ACCEPTED, // "accepted",
      type: "pendingOrders",
      page: 1,
      hasNext: false,
      query: "orders",
    },
    {
      label: tc("completed_seva")!,
      status: "complete",
      type: "completedOrders",
      page: 1,
      hasNext: false,
      query: "orders",
    },
  ];

  const coordinatortabs = [
    sevadartabs[0],
    {
      label: tc("pending_android_seva"),
      status: BOOK_ORDER_STATUS.ALLOTTED, //"allotted",
      type: "pendingNonAndroidOrders",
      page: 1,
      hasNext: false,
      query: "orders",
    },
    sevadartabs[1],
  ];
  const { user, active_region_index, active_permission } = useAppSelector(
    (state) => state.auth
  );
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [paramType, setParamType] = useState(Number(router.query.type));
  const [tabs, setTabs] = useState<any[]>(
    paramType == 0 ? sevadartabs : coordinatortabs
  );
  const { bookDeliveryCounts: counts } = useAppSelector(
    (state) => state.counts
  );
  const [bookDeliveryCounts, setBookDeliveryCounts] = useState(counts);
  const role_region = active_permission?.role_region ?? "ashram";
  const activeRole = active_permission?.role;
  const dispatch = useAppDispatch();
  const [showAshirwad, setAshirwadStatus] = useState<boolean>(false);
  const { pendingOrders, completedOrders, pendingNonAndroidOrders } =
    useAppSelector((state) => state.orders);
  const { update, getCount } = useCount();
  const activeTehsilId =
    active_permission?.region[active_region_index]?.tehsil_id;
  const formRef = useRef<any>(null);
  const params = useMemo(
    () => ({
      status: BOOK_ORDER_STATUS.ACCEPTED, // "accepted",
      send_for_delivery: 1,
      ...(activeRole === "book_delivery_sevadar" && { allocated_to: user?.id }),
      ...getInitialValues(active_permission, active_region_index),
    }),
    [active_permission, active_region_index, user?.id, activeRole]
  );

  const [orders, setLocalOrders] = useState<any>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [days, setDays] = useState(0);

  const tehsilId = active_permission?.region[active_region_index]?.tehsil_id;
  // const params = useMemo(
  //   () => ({
  //     status: tabs[activeTab]
  //       ? tabs[activeTab].status
  //       : activeTab == 1 && paramType != 1
  //       ? "accepted"
  //       : "allotted",
  //     non_android: activeTab == 1 && paramType == 1 ? 1 : 0,
  //     ...(active_permission &&
  //       active_permission?.role === "book_delivery_sevadar" && {
  //         allocated_to: user?.id,
  //       }),
  //     send_for_delivery: 1,
  //     ...getInitialValues(active_permission, active_region_index),
  //     ...objectWithValues(formRef?.current?.values ?? {}),
  //   }),
  //   [paramType, activeTab, active_permission, formRef?.current?.values]
  // );

  const fetchOrder = useCallback(
    async (page: number, params: Record<string, string | number | boolean>) => {
      if (!loading) {
        setLoading(true);
        try {
          const { data } = await apiClient.get("orders", {
            params: {
              ...params,
              ...objectWithValues(formRef?.current?.values ?? {}),
              page,
            },
          });
          const temphasMore = data.data.total > 10 * page;
          const temp =
            page == 1 ? data.data.result : [...orders, ...data.data.result];
          setLocalOrders((pre: any[]) =>
            page == 1 ? data.data.result : [...pre, ...data.data.result]
          );
          setPage((p) => (page == 1 ? 2 : p + 1));
          setHasMore(temphasMore);
          dispatch(setOrders({ type: tabs[activeTab].type, orders: temp }));
        } catch (error: any) {
          if (error?.response?.status === 423) {
            toast.error(error.response?.data?.error);
          }
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    },
    [activeTab, orders, loading]
  );

  const updateFirstOrderDate = useCallback(() => {
    if (activeRole === "book_delivery_sevadar" && tehsilId) {
      const countDetails = getCount(
        "bookDeliveryCounts",
        "tehsil_id",
        tehsilId,
        activeRole
      );
      if (countDetails.first_accepted_order_date) {
        const firstOrderDate = dayjs(countDetails.first_accepted_order_date)
          .utc(true)
          .add(5, "hour")
          .add(30, "minute");
        setDays(dayjs().diff(firstOrderDate, "days"));
      }
      if (
        countDetails.first_order_id &&
        countDetails.first_accepted_order_date
      ) {
        setBookDeliveryCounts({
          first_order_id: countDetails.first_order_id,
          first_accepted_order_date: countDetails.first_accepted_order_date,
          ...countDetails.counts,
        });
      } else {
        setBookDeliveryCounts({ ...countDetails.counts });
      }
    }
  }, [activeTab, tehsilId, getCount, setBookDeliveryCounts]);

  useEffect(() => {
    updateFirstOrderDate();
  }, [updateFirstOrderDate]);

  const onTabClick = useCallback(
    (index: number) => {
      let previousIndex = activeTab;
      let lastpage = page;
      let currPage = tabs[index].page;
      const temp = [...tabs].map((t, i) =>
        i == previousIndex ? { ...t, page: lastpage } : t
      );
      setPage(currPage);
      setTabs(temp);
      setActiveTab(index);
      setHasMore(tabs[index].hasNext);
    },
    [page, activeTab]
  );
  const { ref, inView } = useInView();
  useEffect(() => {
    if (inView && page > 0 && hasMore) {
      fetchOrder(page, params);
    }
  }, [fetchOrder, inView, params, hasMore]);
  useEffect(() => {
    if (router.query.type) {
      setParamType(Number(router.query.type));
      // setTabs(Number(router.query.type) == 0 ? sevadartabs : coordinatortabs);
    }
  }, [router.isReady]);

  const onConfirm = useCallback(
    async (e: any) => {
      try {
        const response = await apiClient.post("order_response", e.data);
        toast.success(response.data?.message);
        if (activeRole == "book_delivery_sevadar") {
          let needToChangeFirstOrder = false;
          if (
            bookDeliveryCounts &&
            bookDeliveryCounts.first_order_id &&
            bookDeliveryCounts.first_order_id == e.data.order_id
          ) {
            needToChangeFirstOrder = pendingOrders.length > 1;
          }
          const updatePayload = {
            role: active_permission?.role,
            tehsil_id: activeTehsilId,
            counts: {
              pending_out: -1,
              ctm: e.data.response_type == BOOK_ORDER_STATUS.DELIVERED ? 1 : 0,
              otm: 1,
              otd: 1,
            },
            ...(needToChangeFirstOrder && {
              first_accepted_order_date: pendingOrders?.[1]
                ?.order_allotted_at as string,
              first_order_id: pendingOrders?.[1]?.id as number,
            }),
            ...(!needToChangeFirstOrder &&
              pendingOrders.length === 1 && {
                first_accepted_order_date: new Date().toISOString(),
                first_order_id: 0,
              }),
          };
          update("bookDeliveryCounts", "tehsil_id", updatePayload);
          const firstOrderDate = dayjs(updatePayload.first_accepted_order_date)
            .utc(true)
            .add(5, "hour")
            .add(30, "minute");
          setDays(dayjs().diff(firstOrderDate, "days"));
        }
        if (e.data.response_type == BOOK_ORDER_STATUS.DELIVERED) {
          setAshirwadStatus(true);
        }
        dispatch(filterOrders({ type: "pendingOrders", id: e.data.order_id }));
      } catch (e: any) {
        console.error(e);
        toast.error(e?.response?.data?.error);
      }
    },
    [bookDeliveryCounts, pendingOrders]
  );
  return (
    <Layout
      headerProps={{
        isBack: true,
        heading:
          paramType == 0
            ? active_permission?.region[active_region_index]?.state_id != 27
              ? t("seva.title.not_receive_seva_out") || "Book Not Receive Out"
              : t("seva.title.seva_out") || "Book Delivery Seva Out"
            : t("seva.title.records_out") || "Book Delivery Seva Out Records",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        {/* <ButtonTabs */}
        {/*   handleClick={() => {}} */}
        {/*   items={[...tabs].map((t, i) => ({ */}
        {/*     ...t, */}
        {/*     active: i === activeTab, */}
        {/*     disabled: loading, */}
        {/*     handleClick: () => onTabClick(i), */}
        {/*   }))} */}
        {/* /> */}

        <Formik
          innerRef={formRef}
          initialValues={{
            country_id: 0,
            state_id: 0,
            district_id: 0,
            tehsil_id: 0,
            pincode: "",
          }}
          onSubmit={async (values) => {
            const payload: any = {
              ...params,
              ...objectWithValues(values),
            };
            setPage(1);
            fetchOrder(1, payload);
          }}
        >
          {({ values, setFieldValue }) => (
            <Form>
              <UserwiseDropdown
                showDivision={active_permission?.role_region == "division"}
              />
              <TextInput
                name="pincode"
                label="Pincode"
                inputMode="numeric"
                maxLength={6}
                prependEle={
                  <div className="flex absolute space-x-1 items-center -translate-y-1/2 top-1/2 right-4">
                    {values.pincode.length > 0 && (
                      <MdClose
                        onClick={() => setFieldValue("pincode", "")}
                        className="w-5 h-5 text-gray-500 cursor-pointer"
                      />
                    )}
                  </div>
                }
              />
              <Button
                type="submit"
                className="mx-auto w-1/2"
                loading={loading}
                disabled={loading}
              >
                {tc("search")}
              </Button>
            </Form>
          )}
        </Formik>
        {days > 9 && (
          <div className={"flex items-start justify-center"}>
            <div className={"bg-red-500 w-4 h-4 rounded-full mt-1 mr-1"}></div>
            <div className={"text-red-500 font-semibold"}>{t("alert_10")}</div>
          </div>
        )}
        {activeTab === 0 ? (
          <>
            {pendingOrders.map((order: any, index) => {
              return paramType == 0 ? (
                <OrderPendingCard
                  order={order}
                  key={index}
                  onConfirm={onConfirm}
                  emergency={false}
                  regularIn={false}
                />
              ) : (
                <RecordPendingCard order={order} key={index} showTimer={true} />
              );
            })}
          </>
        ) : null}
        {activeTab === 1 ? (
          paramType == 0 ? (
            <>
              {completedOrders.map((order: any, index) => (
                <OrderCompleteCard
                  showSevadarName={role_region !== "tehsil"}
                  order={order}
                  key={index}
                />
              ))}
            </>
          ) : (
            <>
              {pendingNonAndroidOrders.length > 0 ? (
                pendingNonAndroidOrders.map((order: any, index) => {
                  return (
                    <OrderPendingCard
                      order={order}
                      key={index}
                      nonAndroid={true}
                      onConfirm={onConfirm}
                      emergency={false}
                    />
                  );
                })
              ) : (
                <p style={{ textAlign: "center" }}>
                  <b>{t("no_order")}</b>
                </p>
              )}
            </>
          )
        ) : null}
        {activeTab == 2 ? (
          <>
            {completedOrders.length > 0 ? (
              completedOrders.map((order: any, index) => (
                <OrderCompleteCard
                  showSevadarName={role_region !== "tehsil"}
                  order={order}
                  key={index}
                />
              ))
            ) : (
              <p style={{ textAlign: "center" }}>
                <b>{t("no_order")}</b>
              </p>
            )}
          </>
        ) : null}
        <div ref={ref}>
          {loading && hasMore && (
            <LoadingSpinner className={"mx-auto w-8 h-8"} />
          )}
        </div>
      </div>
      <GurujiAshirwadModal
        show={showAshirwad}
        onClose={() => setAshirwadStatus(false)}
      />
    </Layout>
  );
};

RegularDeliveryOut.requireAuth = true;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "delivery",
        "status",
        "question",
      ])),
    },
  };
};

export default RegularDeliveryOut;
