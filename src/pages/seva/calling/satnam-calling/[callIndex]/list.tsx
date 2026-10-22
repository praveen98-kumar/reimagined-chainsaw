import { GetStaticProps, GetStaticPaths, GetStaticPathsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { satnamCallingPageList } from "..";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import Layout from "@/components/Layout";
import CardButton from "@/components/card/CardButton";
import {
  CardWrapper,
  CardMessage,
  CardIcons,
  CardGridContainer,
  CardDateStatus,
  getStatusColor,
  removeSymbols,
} from "@/components/card/CommonCard";
import dayjs from "dayjs";
import { Tab } from "@/shared/interfaces/app";
import Modal from "@/components/modal/Modal";
import { FaQuestionCircle } from "react-icons/fa";
import apiClient from "@/http/index";
import { useInView } from "react-intersection-observer";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAppSelector } from "@/redux/store";
import toast from "react-hot-toast";
import FormLabel from "@/components/input/FormLabel";
import { cn } from "@/shared/functions/utils";
import SatnamCallingHistroy from "@/components/calling/SatnamCallingHistory";
import { StatusRings } from "@/components/calling/StatusRing";
import { SatnamCallingStatus } from "../../../../../constants/satnam-calling-status";

type SevaResponse =
  | "out_of_reach"
  | "not_interested"
  | "ok"
  | "awaited_from_namdan";

const SevaCardCompleted: React.FC<{
  count: number;
  userData: Record<string, any>;
}> = ({ count, userData }) => {
  const callingList = userData?.calling_list as Array<any>;
  const currentCallingItem = callingList[count - 1];
  const completedCallingList = callingList.filter(
    (call) => call.status != SatnamCallingStatus.pending
  );
  const { t: ts } = useTranslation("status");

  return (
    <CardWrapper className="w-[98%]">
      <CardMessage
        className="pr-10"
        message={{
          name: userData.name,
          address: userData.address,
          mobile_no: userData.mobile_no,
          form_date: dayjs(userData.form_date).format("DD-MM-YYYY"),
        }}
      />
      <CardIcons mobile_no={userData.mobile_no} />
      <StatusRings count={count} />
      <CardGridContainer className="gap-0.5">
        {completedCallingList.map((item, i) => (
          <CardDateStatus
            key={`date-${item.id}`}
            title={`${satnamCallingPageList[i].title} ( ${satnamCallingPageList[i].subtitle} )`}
            date={dayjs(item.responsed_at).toISOString()}
          />
        ))}
      </CardGridContainer>
      <div
        className={cn(
          "overflow-hidden w-full capitalize font-sm",
          getStatusColor(currentCallingItem?.status)
        )}
      >
        {currentCallingItem?.remark && (
          <SatnamCallingHistroy
            historyMap={{
              "Sevadar Remark": currentCallingItem.remark,
              "District Sevadar Remark": currentCallingItem.d_remark,
            }}
          />
        )}

        <p className="capitalize text-center">
          {removeSymbols(currentCallingItem?.status || "")}
        </p>
        <p className="text-center">
          {ts("completed_by", { name: currentCallingItem?.response_by_user })}
        </p>
      </div>
    </CardWrapper>
  );
};

const SevaCard: React.FC<{
  count: number;
  userData: Record<string, any>;
  callingResponse: (payload: any) => void;
}> = ({ count, userData, callingResponse }) => {
  const [show, setShow] = useState<SevaResponse | null>(null);
  const { t: ts } = useTranslation("status");
  const { t: tc } = useTranslation("common");
  const [remark, setRemark] = useState("");
  const callingList = userData?.calling_list as Array<any>;
  const pendingCallingList = callingList.filter(
    (call) => call.status == SatnamCallingStatus.pending
  );
  const completedCallingList = callingList.filter(
    (call) => call.status != SatnamCallingStatus.pending
  );
  const currentCallingItem = pendingCallingList[count - 1];
  const remarkRef = useRef<HTMLInputElement>(null);
  return (
    <CardWrapper className={cn("w-[98%] overflow-hidden relative")}>
      <CardMessage
        className="pr-10 min-h-min"
        message={{
          name: userData.name,
          address: userData.address,
          mobile_no: userData.mobile_no,
          form_date: dayjs(userData.form_date).format("DD-MM-YYYY"),
        }}
      />
      <CardIcons mobile_no={userData.mobile_no} />
      <StatusRings count={completedCallingList.length} />
      {completedCallingList.length > 0 && (
        <CardGridContainer className="gap-0.5">
          {completedCallingList.map((item, i) => (
            <CardDateStatus
              key={`date-${item.id}`}
              title={`${satnamCallingPageList[i].title} ( ${satnamCallingPageList[i].subtitle} )`}
              date={dayjs(item.responsed_at).toISOString()}
            />
          ))}
        </CardGridContainer>
      )}

      {pendingCallingList.length ? (
        <CardGridContainer>
          {currentCallingItem?.status ===
          SatnamCallingStatus.awaited_from_namdan ? (
            <CardButton
              label={ts("not_interested_ruchi")}
              onClick={() => setShow("not_interested")}
              className="text-red-500 font-semibold border border-gray-400"
            />
          ) : (
            <>
              <CardButton
                label={ts("mobile_no_issue")}
                onClick={() => setShow("out_of_reach")}
                className={cn(
                  "font-semibold border border-gray-400",
                  "text-orange-500"
                )}
              />
              <CardButton
                label={ts("not_interested_ruchi")}
                onClick={() => setShow("not_interested")}
                className="text-red-500 font-semibold border border-gray-400"
              />
              <CardButton
                label={ts("discussed")}
                onClick={() => setShow("ok")}
                className="text-emerald-500 col-span-2 font-semibold border border-gray-400"
              />
            </>
          )}
        </CardGridContainer>
      ) : null}

      {completedCallingList[count - 1]?.status == 2 && (
        <div className={"text-center py-1"}>Awaited From Namdan</div>
      )}

      {currentCallingItem?.status ===
        SatnamCallingStatus.awaited_from_namdan && (
        <div className="overflow-hidden w-full capitalize font-sm">
          <p className="capitalize text-center">
            {removeSymbols(currentCallingItem.status)}
          </p>
        </div>
      )}
      <Modal
        show={show != null}
        onConfirm={() => {
          if (remarkRef.current?.checkValidity() == false) {
            remarkRef.current.focus();
            return;
          }
          callingResponse({
            disciple_id: userData.id,
            // @ts-ignore
            response_type: SatnamCallingStatus[show],
            remark: remark,
          });
          setShow(null);
        }}
        onClose={() => setShow(null)}
      >
        <div className="space-y-4 mb-8">
          <FaQuestionCircle className=" mx-auto w-20 h-20 text-primary" />
          <p className="font-normal text-2xl text-center">
            {show == "out_of_reach" && ts("mobile_no_issue")}
            {show == "not_interested" && ts("not_interested_ruchi")}
            {show == "ok" && ts("discussed")}
          </p>
          {show === "not_interested" && (
            <form className="w-full flex flex-col gap-y-2">
              <FormLabel htmlFor="remark" required label={tc("remark")} />
              <input
                ref={remarkRef}
                required
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="w-full px-4 py-2 border text-gray-700 placeholder-gray-500 bg-white rounded-md  focus:border-gray-800  focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-gray-300 disabled:bg-gray-100 disabled:border-gray-100"
              />
            </form>
          )}
        </div>
      </Modal>
    </CardWrapper>
  );
};

const SingleSatnamCallingList = () => {
  const router = useRouter();
  const callIndex = router.query.callIndex as string;
  const { t: tc } = useTranslation("common");
  let matches = callIndex?.match(/(\d+)/);
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

  const { user } = useAppSelector((state) => state.auth);
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
              allotted_to: user?.id,
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
  const callingResponse = async (payload: any) => {
    try {
      const { data } = await apiClient.post("satnam_calling_response", {
        ...payload,
        sequence: matches ? Number(matches[0]) : 1,
      });
      const updatedList = discipleList.filter(
        (disciple) => disciple.id != payload.disciple_id
      );
      setDiscipleList(updatedList);
      toast.success(data?.message);
    } catch (error) {
      console.error(error);
    }
  };
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
        heading: `${callIndex} Satnam Calling`,
      }}
    >
      <div className="p-4 mx-auto w-full space-y-4 max-w-xl">
        {/* <ButtonTabs */}
        {/*   handleClick={() => { }} */}
        {/*   items={[...tabs].map((t, i) => ({ */}
        {/*     label: t.label, */}
        {/*     active: i === activeTab, */}
        {/*     handleClick: () => onTabClick(i), */}
        {/*   }))} */}
        {/* /> */}

        <div className="flex flex-col gap-2">
          {discipleList.map((userData) =>
            activeTab == 0 ? (
              <SevaCard
                key={userData.id}
                userData={userData}
                callingResponse={callingResponse}
                count={matches ? Number(matches[0]) : 0}
              />
            ) : (
              <SevaCardCompleted
                key={userData.id}
                userData={userData}
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

SingleSatnamCallingList.requireAuth = true;

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

export const getStaticPaths: GetStaticPaths = (_: GetStaticPathsContext) => {
  const paths = satnamCallingPageList.map(({ title }) => ({
    params: { callIndex: title },
  }));
  return {
    paths,
    fallback: true,
  };
};

export default SingleSatnamCallingList;
