import { GetStaticProps, GetStaticPaths, GetStaticPathsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, { useCallback, useEffect, useState } from "react";
import { satnamCallingPageList } from "..";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import Layout from "@/components/Layout";
import {
  CardWrapper,
  CardMessage,
  CardIcons,
  CardGridContainer,
  CardDateStatus,
  getStatusColor,
} from "@/components/card/CommonCard";
import dayjs from "dayjs";
import { Tab } from "@/shared/interfaces/app";
import ButtonTabs from "@/components/ButtonTabs";
import { cn } from "@/shared/functions/utils";
import apiClient from "@/http/index";
import { useInView } from "react-intersection-observer";
import LoadingSpinner from "@/components/LoadingSpinner";
import { StatusRings } from "@/components/calling/StatusRing";
import SatnamCallingHistroy from "@/components/calling/SatnamCallingHistory";

const SevaCardRecord: React.FC<{
  done: boolean;
  userData: Record<string, any>;
  count?: number;
  allottedTo?: string;
}> = ({ done, count = 0, userData, allottedTo }) => {
  const callingList = userData?.calling_list as Array<any>;
  const completedCallingList = callingList.filter(
    (call) => call.status != "pending"
  );
  const currentCallingItem = completedCallingList[count - 1];
  return (
    <CardWrapper className="w-[98%]">
      <CardMessage
        className="pr-10 min-h-min"
        message={{
          name: userData?.name,
          address: userData?.address,
          mobile_no: userData?.mobile_no,
          form_date: dayjs(userData?.form_date).format("DD-MM-YYYY"),
        }}
      />
      <CardIcons mobile_no={userData?.mobile_no} />
      <StatusRings count={count} />
      <CardGridContainer className="gap-0.5">
        {completedCallingList.map((item, i) => (
          <CardDateStatus
            key={`date-${i}`}
            title={`${satnamCallingPageList[i]?.title} ( ${satnamCallingPageList[i]?.subtitle} )`}
            date={dayjs(item?.responsed_at).toISOString()}
          />
        ))}
      </CardGridContainer>
      {done ? (
        <>
          {currentCallingItem?.remark && (
            <SatnamCallingHistroy
              historyMap={{
                "Sevadar Remark": currentCallingItem.remark,
                "District Sevadar Remark": currentCallingItem.d_remark,
              }}
            />
          )}
          <div
            className={cn(
              "overflow-hidden w-full capitalize",
              getStatusColor(currentCallingItem?.status)
            )}
          >
            <p className="m-0 text-center">{currentCallingItem?.status}</p>
            <p className="text-black m-0 text-center">
              Completed By {currentCallingItem?.response_by_user}
            </p>
          </div>
        </>
      ) : (
        <p className="w-full p-2 text-center font-semibold">
          Allotted to {callingList[count]?.allotted_to_user}
        </p>
      )}
    </CardWrapper>
  );
};

const SignleSatnamCallingRecords = () => {
  const router = useRouter();
  const callIndex = router.query.callIndex as string;
  const { t } = useTranslation("calling");
  const { t: tc } = useTranslation("common");
  let matches = callIndex.match(/(\d+)/);
  const [discipleList, setDiscipleList] = useState<any[]>([]);
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
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchList = useCallback(
    async (page: number, params: object) => {
      if (!loading) {
        setLoading(true);
        try {
          const { data } = await apiClient.get("satnam_calling", {
            params: {
              ...params,
              page,
              sequence: matches ? Number(matches[0]) : 1,
              to_date: dayjs().format("YYYY-MM-DD"),
              status: activeTab == 0 ? "pending" : "complete",
            },
          });
          setHasMore(data.data.total > 10 * page);
          const tempData =
            page == 1
              ? data.data.disciple
              : [...discipleList, ...data.data.disciple];
          setDiscipleList(tempData);
          setPage(page + 1);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    },
    [activeTab, loading]
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

  useEffect(() => {
    if (inView && page > 0 && hasMore) {
      fetchList(page, {});
    }
  }, [fetchList, inView, hasMore]);

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: `${callIndex} Satnam Calling Records`,
      }}
    >
      <div className="p-4 mx-auto w-full space-y-4 max-w-xl">
        <ButtonTabs
          handleClick={() => {}}
          items={[...tabs].map((t, i) => ({
            label: t.label,
            active: i === activeTab,
            handleClick: () => onTabClick(i),
          }))}
        />
        <div className="flex flex-col gap-2">
          {discipleList.map((userData) =>
            activeTab == 0 ? (
              <SevaCardRecord
                key={userData.id}
                userData={userData}
                done={false}
                count={matches ? Number(matches[0]) - 1 : 0}
              />
            ) : (
              <SevaCardRecord
                key={userData.id}
                userData={userData}
                done
                count={matches ? Number(matches[0]) : 0}
              />
            )
          )}
          <div ref={ref}>
            {loading && hasMore && (
              <LoadingSpinner className={"mx-auto w-8 h-8"} />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

SignleSatnamCallingRecords.requireAuth = true;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "calling"])),
    },
  };
};
export const getStaticPaths: GetStaticPaths = (
  context: GetStaticPathsContext
) => {
  const paths = satnamCallingPageList.map(({ title }) => ({
    params: { callIndex: title },
  }));
  return {
    paths,
    fallback: true,
  };
};

export default SignleSatnamCallingRecords;
