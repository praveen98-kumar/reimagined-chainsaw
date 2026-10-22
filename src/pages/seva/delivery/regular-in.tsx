import Button from "@/components/Button";
import OrderInCard, { RecordInCard } from "@/components/card/OrderInCard";
import TextInput from "@/components/input/TextInput";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import UserwiseDropdown from "@/components/UserwiseDropdown";
import apiClient from "@/http/index";
import { getInitialValues, objectWithValues } from "@/shared/functions/utils";
import { Form, Formik, FormikProps } from "formik";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { setOrders } from "@/redux/features/orderSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { BOOK_ORDER_STATUS, NextApplicationPage } from "@/shared/interfaces/app";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { allLangPincodeRegex } from "@/shared/functions/get-pincode";
import { ImForward } from "react-icons/im";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "react-i18next";
import { MdClose } from "react-icons/md";
import { useCount } from "../../../hooks/useCount";
import dayjs from "dayjs";

const schema = Yup.object({
  tehsil_id: Yup.string(),
  pincode: Yup.string().matches(allLangPincodeRegex, "Invalid pincode format"),
});

const RegularDeliveryIn: NextApplicationPage = () => {
  const { t: tc } = useTranslation("common");
  const { t } = useTranslation("delivery");
  const router = useRouter();
  const [paramType, setParamType] = useState<number>(0);
  const formRef = useRef<FormikProps<any>>(null);
  const { active_permission, active_region_index } = useAppSelector(
    (state) => state.auth
  );
  const { ordersIn: orders } = useAppSelector((state) => state.orders);
  const dispatch = useAppDispatch();
  const activeRole = active_permission?.role;
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isAPICallDone, setIsAPICallDone] = useState(false);
  const [days, setDays] = useState(0);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [firstOrderDate, setFirstOrderDate] = useState<string>("");
  const [params] = useState<Record<string, any>>({
    status: BOOK_ORDER_STATUS.RECEIVED, // "received",
    send_for_delivery: 1,
    ...getInitialValues(active_permission, active_region_index),
  });
  const { update, getCount } = useCount();
  const { bookDeliveryCounts: counts } = useAppSelector(
    (state) => state.counts
  );
  const [bookDeliveryCounts, setBookDeliveryCounts] = useState(counts);
  const activeTehsilId =
    active_permission?.region[active_region_index]?.tehsil_id;
  const { first_accepted_order_date } = getCount(
    "bookDeliveryCounts",
    "tehsil_id",
    Number(active_permission?.region[active_region_index]?.tehsil_id),
    activeRole + ""
  );
  const setAbleToAcceptOrderFunc = () => {
    setFirstOrderDate(first_accepted_order_date + "");
    const firstOrderDate1 = dayjs(first_accepted_order_date)
      .utc(true)
      .add(5, "hour")
      .add(30, "minute");
    setDays(dayjs().diff(firstOrderDate1, "days"));
  };
  const fetchOrder = async (
    page: number,
    params: Record<string, string | number | boolean>
  ) => {
    if (!loading) {
      setLoading(true);
      try {
        const { data } = await apiClient.get(
          activeRole == "book_delivery_sevadar" ? "orders_in" : "orders",
          {
            params: {
              ...params,
              ...objectWithValues(formRef?.current?.values ?? {}),
              page,
            },
          }
        );
        const temp =
          page == 1 ? data.data.result : [...orders, ...data.data.result];
        const temphasMore = data.data.total > 10 * page;
        if (activeRole == "book_delivery_sevadar") {
          update("bookDeliveryCounts", "tehsil_id", {
            role: active_permission?.role,
            tehsil_id: activeTehsilId,
            counts: {
              pending_in:
                data.data.total - Number(bookDeliveryCounts.pending_in),
            },
          });
        }
        setPage((p) => (page == 1 ? 2 : p + 1));
        setHasMore(temphasMore);
        setIsAPICallDone(true);
        dispatch(setOrders({ type: "ordersIn", orders: temp }));
      } catch (error: any) {
        if (error?.response?.status === 423) {
          toast.error(error.response?.data?.error);
        }
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const addOrder = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    if (e.target.checked) {
      setSelectedOrders((pre) => [...pre, id]);
    } else {
      setSelectedOrders(selectedOrders.filter((i: any) => i !== id));
    }
  };
  const { ref, inView } = useInView();

  useEffect(() => {
    if (router.query.type) {
      setParamType(Number(router.query.type));
    }
  }, [router.isReady]);

  useEffect(() => {
    if (activeRole == "book_delivery_sevadar") {
      setAbleToAcceptOrderFunc();
      const { counts: storedCounts } = getCount(
        "bookDeliveryCounts",
        "tehsil_id",
        Number(active_permission?.region[active_region_index]?.tehsil_id),
        activeRole
      );
      setBookDeliveryCounts({ ...storedCounts });
    }
  }, []);
  useEffect(() => {
    if (inView && page > 0 && hasMore) {
      fetchOrder(page, params);
    }
  }, [fetchOrder, inView, params, hasMore]);

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading:
          paramType == 0
            ? active_permission?.region[active_region_index]?.state_id != 27
              ? t("seva.title.not_receive_seva_in") || "Book Not Receive In"
              : t("seva.title.seva_in") || "Book Delivery Seva In"
            : t("seva.title.records_in") || "Book Delivery Seva In Records",
        rightIcon: selectedOrders.length ? (
          <ImForward
            onClick={() => {
              localStorage.setItem(
                "selectedOrders",
                JSON.stringify(selectedOrders)
              );
              router.push("/seva/delivery/allot-non-android");
            }}
            className="w-6 h-6 text-white absolute right-5"
            style={{ transform: "scale(1,-1)" }}
          />
        ) : null,
      }}
    >
      <div className="p-4 w-full max-w-xl mx-auto space-y-4">
        <Formik
          innerRef={formRef}
          initialValues={{
            country_id: 0,
            state_id: 0,
            district_id: 0,
            tehsil_id: 0,
            pincode: "",
          }}
          validationSchema={schema}
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
                label={tc("pin") || "Pincode"}
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
              <Button className="mx-auto w-1/2" type="submit" loading={loading}>
                {tc("search")}
              </Button>
            </Form>
          )}
        </Formik>
        {days > 9 && (
          <div className={"flex items-start justify-center"}>
            <div className={"bg-red-500 w-4 h-4 rounded-full mt-1 mr-1"}></div>
            <div className={"text-red-500 font-semibold"}>
              {days > 14 ? t("alert_15") : t("alert_10")}
            </div>
          </div>
        )}
        {orders.length > 0 ? (
          <div className="flex flex-col gap-2">
            {orders.map((order: any, index: number) => {
              return paramType == 0 ? (
                <OrderInCard
                  order={order}
                  key={index}
                  ableToAcceptOrder={days < 16}
                  firstOrderDate={firstOrderDate}
                />
              ) : (
                <RecordInCard order={order} key={index} />
                // <label
                //   htmlFor={order.id.toString()}
                //   key={order.id}
                //   className="relative"
                // >
                //   {(active_permission?.role === "district_book_distributor" ||
                //     active_permission?.role === "tehsil_book_distributor") && (
                //     <input
                //       className="absolute top-2 left-3 rounded text-black focus:ring-black"
                //       type={"checkbox"}
                //       style={{ zIndex: 1 }}
                //       name={order.id.toString()}
                //       id={order.id.toString()}
                //       onChange={(e) => addOrder(e, order.id)}
                //     />
                //   )}
                //   <RecordInCard order={order} key={index} />
                // </label>
              );
            })}
            <div ref={ref}>
              {loading && hasMore && (
                <LoadingSpinner className={"mx-auto w-8 h-8"} />
              )}
            </div>
          </div>
        ) : !loading && isAPICallDone ? (
          <span className={"text-center text-bold text-lg"}>
            {t("no_order")}
          </span>
        ) : null}
      </div>
    </Layout>
  );
};

RegularDeliveryIn.requireAuth = true;

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

export default RegularDeliveryIn;
