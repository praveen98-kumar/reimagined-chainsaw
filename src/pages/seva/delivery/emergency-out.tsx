import Button from "@/components/Button";
import ButtonTabs from "@/components/ButtonTabs";
import OrderCompleteCard from "@/components/card/OrderCompleteCard";
import OrderPendingCard from "@/components/card/OrderPendingCard";
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
import { Form, Formik } from "formik";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useInView } from "react-intersection-observer";
import { NextApplicationPage } from "@/shared/interfaces/app";

const EmergencyDeliveryOut: NextApplicationPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [tabs, setTabs] = useState<any[]>([
    {
      label: "पेंडिंग सेवा",
      type: "emergencyPendingOrder",
      page: 1,
      hasNext: true,
      query: "orders",
    },
    {
      label: "पूर्ण सेवा",
      type: "emergencyCompletedOrder",
      page: 1,
      hasNext: true,
      query: "orders",
    },
  ]);
  const { user, active_permission, active_region_index } = useAppSelector(
    (state) => state.auth
  );
  const dispatch = useAppDispatch();
  const formRef = useRef<any>(null);
  const [showAshirwad, setAshirwadStatus] = useState<boolean>(false);
  const { emergencyPendingOrder, emergencyCompletedOrder } = useAppSelector(
    (state) => state.orders
  );
  const [orders, setLocalOrders] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const params = useMemo(
    () => ({
      status: activeTab == 0 ? "allotted" : "complete",
      emergency: "1",
      send_for_delivery: 1,
      allocated_to: user?.id,
      ...getInitialValues(active_permission, active_region_index),
      ...objectWithValues(formRef?.current?.values ?? {}),
    }),
    [activeTab, active_permission, formRef?.current?.values]
  );
  const fetchOrder = useCallback(
    async (page: number, params: Record<string, string | number | boolean>) => {
      if (!loading) {
        setLoading(true);
        try {
          const { data } = await apiClient.get("orders", {
            params: {
              ...params,
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
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    },
    [activeTab, orders, loading]
  );

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
    },
    [activeTab]
  );

  const onConfirm = useCallback(async (e: any) => {
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
      dispatch(
        filterOrders({ type: "emergencyPendingOrder", id: e.data.order_id })
      );
    } catch (e: any) {
      toast.error(e?.response.data.error);
      console.error(e);
    }
  }, []);

  const { ref, inView } = useInView();
  const { ref: ref2, inView: inView2 } = useInView();

  useEffect(() => {
    if (inView && page > 0 && hasMore) {
      fetchOrder(page, params);
    }
  }, [fetchOrder, inView, params, hasMore]);
  useEffect(() => {
    if (inView2 && page > 0 && hasMore) {
      fetchOrder(page, params);
    }
  }, [fetchOrder, inView2, params, hasMore]);

  return (
    <Layout headerProps={{ isBack: true, heading: "EMERGENCY ORDERS" }}>
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <ButtonTabs
          handleClick={() => {}}
          items={[...tabs].map((t, i) => ({
            label: t.label,
            active: i === activeTab,
            handleClick: () => onTabClick(i),
          }))}
        />
        <Formik
          innerRef={formRef}
          initialValues={{
            country_id: 0,
            state_id: 0,
            district_id: 0,
            tehsil_id: 0,
            pincode: "",
          }}
          onSubmit={(values) => {
            const formValue = objectWithValues(values);
            fetchOrder(1, { ...params, ...formValue });
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
                className="mx-auto w-1/2 mb-2"
                loading={loading}
              >
                खोजें
              </Button>
            </Form>
          )}
        </Formik>
        {((activeTab == 0 && emergencyPendingOrder.length == 0) ||
          (activeTab == 1 && emergencyCompletedOrder.length == 0)) && (
          <p className={"text-center"}>Order not found.</p>
        )}
        {activeTab == 0 ? (
          <div className="flex flex-col gap-2">
            {emergencyPendingOrder.map((order: any, index) => (
              <OrderPendingCard
                order={order}
                key={index}
                timerValue={5}
                onConfirm={onConfirm}
                emergency={true}
              />
            ))}
            <div ref={ref}>
              {loading && hasMore && (
                <LoadingSpinner className={"mx-auto w-8 h-8"} />
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {emergencyCompletedOrder.map((order: any, index) => (
              <OrderCompleteCard order={order} key={index} />
            ))}
            <div ref={ref2}>
              {loading && hasMore && (
                <LoadingSpinner className={"mx-auto w-8 h-8"} />
              )}
            </div>
          </div>
        )}
      </div>
      <GurujiAshirwadModal
        show={showAshirwad}
        onClose={() => setAshirwadStatus(false)}
      />
    </Layout>
  );
};

EmergencyDeliveryOut.requireAuth = true;

export default EmergencyDeliveryOut;
