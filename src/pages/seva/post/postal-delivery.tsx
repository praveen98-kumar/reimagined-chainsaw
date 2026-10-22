import Button from "@/components/Button";
import ButtonTabs from "@/components/ButtonTabs";
import ByPostPendingCard from "@/components/card/ByPostPending";
import TextInput from "@/components/input/TextInput";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import UserwiseDropdown from "@/components/UserwiseDropdown";
import apiClient from "@/http/index";
import { setOrders } from "@/redux/features/orderSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { getInitialValues, objectWithValues } from "@/shared/functions/utils";
import { NextApplicationPage, Tab } from "@/shared/interfaces/app";
import { Form, Formik } from "formik";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

const sevadartabs: Tab[] = [
  {
    label: "पेंडिंग सेवा",
    status: "pending",
    type: "pendingOrders",
    page: 1,
    hasNext: true,
    query: "post_orders",
  },
  {
    label: "Updated (History)",
    status: "updated",
    type: "completedOrders",
    page: 1,
    hasNext: true,
    query: "post_orders",
  },
];

const PostalDelivery: NextApplicationPage = () => {
  const { user, active_region_index, active_permission } = useAppSelector(
    (state) => state.auth
  );
  const [activeTab, setActiveTab] = useState(0);
  const [tabs, setTabs] = useState<any[]>(sevadartabs);
  const dispatch = useAppDispatch();

  const { pendingOrders, completedOrders } = useAppSelector(
    (state) => state.orders
  );
  const formRef = useRef<any>(null);
  const [orders, setLocalOrders] = useState<any>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const params = useMemo(
    () => ({
      status: tabs[activeTab]
        ? tabs[activeTab].status
        : activeTab == 1
        ? "updated"
        : "pending",
      response_by: user?.id,
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
          const { data } = await apiClient.get("post_orders", {
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
    [page, activeTab]
  );

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
    <Layout
      headerProps={{
        isBack: true,
        heading: "Postal Book Delivery",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <ButtonTabs
          handleClick={() => {}}
          items={[...tabs].map((t, i) => ({
            ...t,
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
            tracking_id: "",
          }}
          onSubmit={(values) => {
            const formValue = objectWithValues(values);
            fetchOrder(1, { ...params, ...formValue });
          }}
        >
          {() => (
            <Form>
              <UserwiseDropdown />
              <TextInput name="pincode" label="Pincode" />
              {activeTab == 1 && (
                <TextInput name="tracking_id" label="Tracking Id" />
              )}
              <Button type="submit" className="mx-auto" loading={loading}>
                खोजें
              </Button>
            </Form>
          )}
        </Formik>
        {activeTab === 0 ? (
          <div className="flex flex-col gap-2">
            {pendingOrders.map((order: any, index) => (
              <ByPostPendingCard post={order} pending={true} key={index} />
            ))}
            <div ref={ref}>
              {loading && hasMore && (
                <LoadingSpinner className={"mx-auto w-8 h-8"} />
              )}
            </div>
          </div>
        ) : null}
        {activeTab === 1 ? (
          <div className="flex flex-col gap-2">
            {completedOrders.map((order: any, index) => (
              <ByPostPendingCard post={order} pending={false} key={index} />
            ))}
            <div ref={ref2}>
              {loading && hasMore && (
                <LoadingSpinner className={"mx-auto w-8 h-8"} />
              )}
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
};

PostalDelivery.requireAuth = true;
export default PostalDelivery;
