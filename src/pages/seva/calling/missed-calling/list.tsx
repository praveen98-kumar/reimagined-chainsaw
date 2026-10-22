import ButtonTabs from "@/components/ButtonTabs";
import MissCallCompleted from "@/components/card/MissCallCompleted";
import MissCallPendingCard from "@/components/card/MissCallPendingCard";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import apiClient from "@/http/index";
import { setCalls } from "@/redux/features/callingSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import InfiniteScroll from "react-infinite-scroll-component";
import { NextApplicationPage } from "@/shared/interfaces/app";

const MissedCallingList: NextApplicationPage = () => {
  const { t: tc } = useTranslation("common");
  const { t } = useTranslation("calling");
  const [activeTab, setActiveTab] = useState(0);
  const [tabs, setTabs] = useState<any[]>([
    {
      label: tc("pending_seva"),
      page: 1,
      hasNext: true,
      query: "miss_call",
      type: "missPendingCalls",
    },
    {
      label: tc("completed_seva"),
      page: 1,
      hasNext: true,
      query: "miss_call",
      type: "missCompleteCalls",
    },
  ]);
  const router = useRouter();
  const [type, setType] = useState<number>(0);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { missPendingCalls, missCompleteCalls } = useAppSelector(
    (state) => state.calling
  );
  const [calls, setLocalCalls] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const params: any = useMemo(
    () => ({
      status: activeTab == 0 ? "pending" : "complete",
      allocated_to: type == 0 ? user?.id : null,
    }),
    [activeTab]
  );
  const fetchCalls = useCallback(
    async (page: number, params: Record<string, string | number | boolean>) => {
      if (!loading) {
        setLoading(true);
        try {
          const { data } = await apiClient.get("miss_call", {
            params: {
              ...params,
              page,
            },
          });
          const temphasMore = data.data.total > 10 * page;
          const temp =
            page == 1 ? data.data.result : [...calls, ...data.data.result];
          setLocalCalls((pre: any[]) =>
            page == 1 ? data.data.result : [...pre, ...data.data.result]
          );
          setPage((p) => (page == 1 ? 2 : p + 1));
          setHasMore(temphasMore);
          dispatch(setCalls({ type: tabs[activeTab].type, calls: temp }));
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    },
    [activeTab, calls, loading]
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
    fetchCalls(1, params);
  }, [activeTab]);

  useEffect(() => {
    if (router.query.type) {
      setType(Number(router.query.type));
    }
  }, [router.query]);
  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: t("miss.heading") ?? "Missed Call Calling Seva",
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
        {activeTab == 0 ? (
          <InfiniteScroll
            className="space-y-4"
            dataLength={missPendingCalls.length}
            next={() => fetchCalls(page, params)}
            hasMore={hasMore}
            loader={<LoadingSpinner className={"mx-auto w-8 h-8"} />}
          >
            {missPendingCalls.map((call) => (
              <MissCallPendingCard call={call} key={call.id} type={type} />
            ))}
          </InfiniteScroll>
        ) : (
          <InfiniteScroll
            className="space-y-4"
            dataLength={missCompleteCalls.length}
            next={() => fetchCalls(page, params)}
            hasMore={hasMore}
            loader={<LoadingSpinner className={"mx-auto w-8 h-8"} />}
          >
            {missCompleteCalls.map((call) => (
              <MissCallCompleted call={call} key={call.id} type={type} />
            ))}
          </InfiniteScroll>
        )}
      </div>
    </Layout>
  );
};

MissedCallingList.requireAuth = true;

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

export default MissedCallingList;
