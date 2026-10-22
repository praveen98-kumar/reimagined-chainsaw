import Button from "@/components/Button";
import { WrongLocationCard } from "@/components/card/OrderPendingCard";
import TextInput from "@/components/input/TextInput";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import GurujiAshirwadModal from "@/components/modal/GurujiAshirwadModal";
import UserwiseDropdown from "@/components/UserwiseDropdown";
import apiClient from "@/http/index";
import { updateCounts } from "@/redux/features/countSlice";
import { filterOrders, setOrders } from "@/redux/features/orderSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { getInitialValues, objectWithValues } from "@/shared/functions/utils";
import {
  BOOK_ORDER_STATUS,
  NextApplicationPage,
  Tab,
} from "@/shared/interfaces/app";
import { Form, Formik } from "formik";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import InfiniteScroll from "react-infinite-scroll-component";

const WrongLocationDelivery: NextApplicationPage = () => {
  const { t: tc } = useTranslation("common");
  const { t } = useTranslation("delivery");

  const { user, active_region_index, active_permission } = useAppSelector(
    (state) => state.auth
  );
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [paramType, setParamType] = useState(0);
  const role_region = active_permission?.role_region ?? "ashram";
  const dispatch = useAppDispatch();
  const [showAshirwad, setAshirwadStatus] = useState<boolean>(false);
  const { pendingOrders } = useAppSelector((state) => state.orders);
  const formRef = useRef<any>(null);
  const activeRole = active_permission?.role;
  const [orders, setLocalOrders] = useState<any>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const params = useMemo(
    () => ({
      status: BOOK_ORDER_STATUS.DIFFERENT_AREA,
      send_for_delivery: 1,
      ...getInitialValues(active_permission, active_region_index),
    }),
    [paramType, activeTab, active_permission]
  );

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
          dispatch(setOrders({ type: "pendingOrders", orders: temp }));
        } catch (error: any) {
          if (error.response.status === 423) {
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

  useEffect(() => {
    if (activeRole == "book_delivery_district_sevadar") {
      fetchOrder(1, params);
    }
  }, [activeTab]);

  useEffect(() => {
    if (router?.query?.type) {
      setActiveTab(Number(router?.query?.type));
      setParamType(Number(router?.query?.type));
    }
  }, [router.isReady]);

  const onConfim = useCallback(async (e: any) => {
    try {
      const response = await apiClient.post("order_response", e.data);
      dispatch(
        updateCounts({
          type: "bookDeliveryCounts",
          values: [
            { key: "ctd" },
            { key: "ctm" },
            { key: "pending_order", value: -1 },
          ],
        })
      );
      toast.success(response.data?.message);
      if (e.status == "deliver") {
        setAshirwadStatus(true);
      }
      dispatch(filterOrders({ type: "pendingOrders", id: e.data.order_id }));
    } catch (e: any) {
      toast.error(e?.response.data.error);
      console.error(e);
    }
  }, []);
  return (
    <Layout
      headerProps={{
        isBack: true,
        heading:
          paramType == 0
            ? t("seva.title.wrong_location") ||
              "Book Delivery Update Wrong Location"
            : t("seva.title.wrong_location_records") ||
              "Book Delivery Update Wrong Location Records",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
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
            const payload = {
              ...params,
              ...objectWithValues(values),
            };
            fetchOrder(1, payload);
          }}
        >
          {() => (
            <Form>
              <UserwiseDropdown
                showDivision={active_permission?.role_region == "division"}
              />
              <TextInput
                name="pincode"
                label="Pincode"
                inputMode="numeric"
                maxLength={6}
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
        <InfiniteScroll
          className="space-y-4"
          dataLength={pendingOrders.length}
          next={() => fetchOrder(page, params)}
          hasMore={hasMore}
          loader={loading && <LoadingSpinner className={"mx-auto w-8 h-8"} />}
        >
          {pendingOrders.map((order: any, index) => {
            return (
              <WrongLocationCard
                order={order}
                key={index}
                onConfirm={onConfim}
                emergency={false}
                regularIn={false}
              />
            );
          })}
        </InfiniteScroll>
      </div>
      <GurujiAshirwadModal
        show={showAshirwad}
        onClose={() => setAshirwadStatus(false)}
      />
    </Layout>
  );
};

WrongLocationDelivery.requireAuth = true;

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

export default WrongLocationDelivery;
