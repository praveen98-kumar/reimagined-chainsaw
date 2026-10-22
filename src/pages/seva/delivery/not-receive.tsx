import Button from "@/components/Button";
import { NotRecievePendingCard } from "@/components/card/CallingPendingCard";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import UserwiseDropdown from "@/components/UserwiseDropdown";
import apiClient from "@/http/index";
import { useAppSelector } from "@/redux/store";
import { getInitialValues, objectWithValues } from "@/shared/functions/utils";
import {
  BOOK_ORDER_STATUS,
  NextApplicationPage,
  Tab,
} from "@/shared/interfaces/app";
import { Form, Formik, FormikProps, FormikValues } from "formik";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { useTranslation } from "react-i18next";
import InfiniteScroll from "react-infinite-scroll-component";

const NotReceiveList: NextApplicationPage = () => {
  const router = useRouter();
  const { t } = useTranslation("delivery");
  const { t: tc } = useTranslation("common");
  const [activeTab, setActiveTab] = useState(0);
  const [tabs, setTabs] = useState<Tab[]>([
    { label: tc("pending_seva")!, page: 1, hasNext: true, query: "calling" },
    {
      label: tc("completed_seva")!,
      page: 1,
      hasNext: true,
      query: "calling",
    },
  ]);
  const [calls, setLocalCalls] = useState<any[]>([]);
  const { active_permission, active_region_index, user } = useAppSelector(
    (state) => state.auth
  );
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const formRef = useRef<FormikProps<FormikValues>>(null);
  const activeRole = active_permission?.role;
  const params = useMemo(
    () => ({
      status: BOOK_ORDER_STATUS.BOOK_NOT_RECEIVE,
      send_for_delivery: 1,
      ...getInitialValues(active_permission, active_region_index),
    }),
    [activeTab]
  );

  const fetchData = useCallback(
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
          setHasMore(temphasMore);

          setLocalCalls((pre: any[]) =>
            page == 1 ? data.data.result : [...pre, ...data.data.result]
          );
          setPage((p) => (page == 1 ? 2 : p + 1));
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    },
    [activeTab, calls, loading]
  );

  function onSuccess(id: number) {
    setLocalCalls((pre) => [...pre].filter((c) => c.id !== id));
  }

  useEffect(() => {
    if (activeRole == "book_delivery_district_sevadar") {
      fetchData(1, params);
    }
  }, [activeTab]);

  useEffect(() => {
    if (router?.query?.type) {
      setActiveTab(Number(router?.query?.type));
    }
  }, [router.isReady]);

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

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading:
          activeTab == 0
            ? t("seva.title.not_receive") ?? "Book Delivery Not Receive Seva"
            : t("seva.title.not_receive_records") ??
              "Book Delivery Not Receive Seva Records",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        {/* <ButtonTabs */}
        {/*   handleClick={() => {}} */}
        {/*   items={[...tabs].map((t, i) => ({ */}
        {/*     label: t.label, */}
        {/*     active: i === activeTab, */}
        {/*     handleClick: () => onTabClick(i), */}
        {/*   }))} */}
        {/* /> */}
        {active_permission && active_permission?.role_region !== "tehsil" && (
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
              fetchData(1, { ...params, ...formValue });
            }}
          >
            {() => (
              <Form>
                <UserwiseDropdown
                  showDivision={active_permission?.role_region == "division"}
                />
                <Button
                  type="submit"
                  className="mx-auto w-1/2"
                  loading={loading}
                >
                  {tc("search")}
                </Button>
              </Form>
            )}
          </Formik>
        )}
        <div>
          <InfiniteScroll
            className="space-y-4"
            dataLength={calls.length}
            next={() => fetchData(page, params)}
            hasMore={hasMore}
            loader={loading && <LoadingSpinner className={"mx-auto w-8 h-8"} />}
          >
            {calls.map((call) => (
              <NotRecievePendingCard
                type={activeTab == 0 ? 0 : 1}
                call={call}
                key={call.id}
                onSuccess={onSuccess}
              />
            ))}
          </InfiniteScroll>
        </div>
      </div>
    </Layout>
  );
};

NotReceiveList.requireAuth = true;
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

export default NotReceiveList;
