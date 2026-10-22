import ButtonTabs from "@/components/ButtonTabs";
import DuplicateCompleted from "@/components/card/DuplicateCompleted";
import DuplicatePendingCard from "@/components/card/DuplicatePendingCard";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import apiClient from "@/http/index";
import { setOrders } from "@/redux/features/orderSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { getInitialValues } from "@/shared/functions/utils";
import { NextApplicationPage } from "@/shared/interfaces/app";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import InfiniteScroll from "react-infinite-scroll-component";

const DuplicateList: NextApplicationPage = () => {
  const { t } = useTranslation("calling");
  const { t: tc } = useTranslation("common");
  const [activeTab, setActiveTab] = useState(0);
  const [tabs, setTabs] = useState<any[]>([
    {
      label: tc("pending_seva")!,
      page: 1,
      hasNext: true,
      query: "duplicate_orders",
      type: "pendingDuplicateOrders",
    },
    {
      label: tc("completed_seva")!,
      page: 1,
      hasNext: true,
      query: "duplicate_orders",
      type: "completedDuplicateOrders",
    },
  ]);
  const dispatch = useAppDispatch();
  const { user, active_permission, active_region_index } = useAppSelector(
    (state) => state.auth
  );
  const { pendingDuplicateOrders, completedDuplicateOrders } = useAppSelector(
    (state) => state.orders
  );
  const activeCountryId =
    active_permission?.region[active_region_index]?.country_id;
  const formRef = useRef<any>(null);
  const [orders, setLocalOrders] = useState<any>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const params = useMemo(
    () => ({
      allocated_to: user?.id,
      status: activeTab == 0 ? "pending" : "complete",
      ...getInitialValues(active_permission, active_region_index),
    }),
    [activeTab, active_permission, formRef?.current?.values]
  );

  const fetchOrder = useCallback(
    async (page: number, params: Record<string, string | number | boolean>) => {
      if (!loading) {
        setLoading(true);
        try {
          const { data } = await apiClient.get("duplicate_orders", {
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

  useEffect(() => {
    fetchOrder(1, params);
  }, [activeTab]);
  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: t("duplicate.heading") ?? "Duplicate Order Seva",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <ButtonTabs
          handleClick={() => {}}
          items={[...tabs].map((t, i) => ({
            label: t.label,
            active: i === activeTab,
            handleClick: () => onTabClick(i),
          }))}
        />
        <div>
          {activeTab == 0 ? (
            <InfiniteScroll
              className="space-y-4"
              dataLength={pendingDuplicateOrders.length}
              next={() => fetchOrder(page, params)}
              hasMore={hasMore}
              loader={<LoadingSpinner className={"mx-auto w-8 h-8"} />}
            >
              {pendingDuplicateOrders.map((order: any) => (
                <DuplicatePendingCard order={order} key={order.id} type={0} />
              ))}
            </InfiniteScroll>
          ) : (
            <InfiniteScroll
              className="space-y-4"
              dataLength={completedDuplicateOrders.length}
              next={() => fetchOrder(page, params)}
              hasMore={hasMore}
              loader={<LoadingSpinner className={"mx-auto w-8 h-8"} />}
            >
              {completedDuplicateOrders.map((order: any) => (
                <DuplicateCompleted order={order} key={order.id} type={0} />
              ))}
            </InfiniteScroll>
          )}
        </div>
      </div>
    </Layout>
  );
};

DuplicateList.requireAuth = true;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "calling",
        "status",
        "question",
      ])),
    },
  };
};

export default DuplicateList;
