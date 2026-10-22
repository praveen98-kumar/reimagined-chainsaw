import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/Layout";
import CardButton from "@/components/card/CardButton";
import {
  CardWrapper,
  CardMessage,
  CardIcons,
  CardGridContainer,
  CardDateStatus,
  removeSymbols,
} from "@/components/card/CommonCard";
import dayjs from "dayjs";
import { Tab } from "@/shared/interfaces/app";
import ButtonTabs from "@/components/ButtonTabs";
import Modal from "@/components/modal/Modal";
import { FaQuestionCircle } from "react-icons/fa";
import apiClient from "@/http/index";
import { useInView } from "react-intersection-observer";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast from "react-hot-toast";
import FormLabel from "@/components/input/FormLabel";
import { cn } from "@/shared/functions/utils";
import SatnamCallingHistroy from "@/components/calling/SatnamCallingHistory";
import { satnamCallingPageList } from ".";
import { StatusRings } from "@/components/calling/StatusRing";

type SevaResponse = "out_of_reach" | "not_interested" | "ok" | "interested";

const CardCompleted: React.FC<{
  userData: Record<string, any>;
}> = ({ userData }) => {
  const callingList = userData?.calling_list as Array<any>;
  const completedCallingList = callingList.filter(
    (call) => call.status != "pending"
  );
  const currentCallingItem =
    completedCallingList[completedCallingList.length - 1];
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
      <StatusRings count={completedCallingList.length} />

      <CardGridContainer className="gap-0.5">
        {completedCallingList.map((item, index) => (
          <CardDateStatus
            key={`${index}_completed`}
            title={`${satnamCallingPageList[index].title} ( ${satnamCallingPageList[index].subtitle} )`}
            date={item?.d_responsed_at}
          />
        ))}
      </CardGridContainer>

      <div className={cn("overflow-hidden w-full capitalize font-sm")}>
        {currentCallingItem?.d_remark && (
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
  userData: Record<string, any>;
  callingResponse: (payload: any) => void;
}> = ({ userData, callingResponse }) => {
  const [show, setShow] = useState<SevaResponse | null>(null);
  const { t: ts } = useTranslation("status");
  const { t: tc } = useTranslation("common");
  const [remark, setRemark] = useState("");
  const callingList = userData?.calling_list as Array<any>;
  const completedCallingList = callingList.filter(
    (call) => call.status != "pending"
  );
  const currentCallingItem =
    completedCallingList[completedCallingList.length - 1];
  const remarkRef = useRef<HTMLInputElement>(null);

  return (
    <CardWrapper className={cn("w-[98%] overflow-hidden relative")}>
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
      <StatusRings count={completedCallingList.length} />
      {currentCallingItem?.remark && (
        <>
          <CardGridContainer className="gap-0.5">
            {completedCallingList.map((item, index) => (
              <CardDateStatus
                key={`${index}_completed`}
                title={`${satnamCallingPageList[index].title} ( ${satnamCallingPageList[index].subtitle} )`}
                date={item?.d_responsed_at}
              />
            ))}
          </CardGridContainer>
          <SatnamCallingHistroy
            historyMap={{
              "Sevadar Remark": currentCallingItem?.remark,
              "District Sevadar Remark": currentCallingItem.d_remark,
            }}
          />
        </>
      )}
      <CardGridContainer>
        {currentCallingItem?.status === "awaited_from_namdan" ? (
          <CardButton
            label={ts("not_interested_ruchi")}
            onClick={() => setShow("not_interested")}
            className="text-red-500 font-semibold border border-gray-400"
          />
        ) : (
          <>
            <CardButton
              label={ts("interested_ruchi")}
              onClick={() => setShow("interested")}
              className={cn(
                "font-semibold border border-gray-400",
                "text-green-600 "
              )}
            />
            <CardButton
              label={ts("not_interested_ruchi")}
              onClick={() => setShow("not_interested")}
              className="text-red-500 font-semibold border border-gray-400"
            />
          </>
        )}
      </CardGridContainer>

      {currentCallingItem?.status === "awaited_from_namdan" && (
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
            response_type: show,
            remark: remark,
          });
          setShow(null);
        }}
        onClose={() => setShow(null)}
      >
        <div className="space-y-4 mb-8">
          <FaQuestionCircle className=" mx-auto w-20 h-20 text-primary" />
          <p className="font-normal text-2xl text-center">
            {show == "interested" && ts("interested_ruchi")}
            {show == "not_interested" && ts("not_interested_ruchi")}
          </p>
          {show === "not_interested" && (
            <div className="w-full flex flex-col gap-y-2">
              <FormLabel htmlFor="remark" label={tc("remark")} />
              <input
                ref={remarkRef}
                required
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="w-full px-4 py-2 border text-gray-700 placeholder-gray-500 bg-white rounded-md  focus:border-gray-800  focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-gray-300 disabled:bg-gray-100 disabled:border-gray-100"
              />
            </div>
          )}
        </div>
      </Modal>
    </CardWrapper>
  );
};

const NotInterestedList = () => {
  const { t: tc } = useTranslation("common");
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
              sequence: 9,
              to_date: dayjs().format("YYYY-MM-DD"),
              status: activeTab == 0 ? "pending" : "complete",
              not_interested: 1,
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
        sequence: 9,
        not_interested: 1,
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
        heading: "Not Interested Satnam Calling",
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
              <SevaCard
                key={userData.id}
                userData={userData}
                callingResponse={callingResponse}
              />
            ) : (
              <CardCompleted key={userData.id} userData={userData} />
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

NotInterestedList.requireAuth = true;

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

export default NotInterestedList;
