import ButtonTabs from "@/components/ButtonTabs";
import Layout from "@/components/Layout";
import CardButton from "@/components/card/CardButton";
import {
  CardGridContainer,
  CardIcons,
  CardMessage,
  CardWrapper,
  getStatusColor,
} from "@/components/card/CommonCard";
import { NextApplicationPage, Tab } from "@/shared/interfaces/app";
import dayjs from "dayjs";
import { Option } from "@/shared/interfaces/option";
import { GetStaticProps } from "next";
import Modal from "@/components/modal/Modal";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { setCalls, filterCalls } from "@/redux/features/callingSlice";
import { FaQuestionCircle } from "react-icons/fa";
import { Form, Formik, FormikProps, FormikValues } from "formik";
import Radio from "@/components/input/Radio";
import { cn } from "@/shared/functions/utils";
import apiClient from "@/http/index";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { useInView } from "react-intersection-observer";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast from "react-hot-toast";

const otherOptions: Option[] = [
  { label: "Again", value: "again" },
  { label: "Later", value: "will_think" },
  { label: "Not Interested", value: "not_interested" },
];

const joinOptions: Option[] = [
  { label: "Already joined in whatsapp group", value: "joined" },
  { label: "Want to join in whatsapp group", value: "want_to_join" },
];

const FirstStep = () => {
  return (
    <div className="space-y-8 mb-8">
      <FaQuestionCircle className=" mx-auto w-20 h-20 text-primary" />
      <p className="font-normal text-xl text-center">Wrong Number</p>
    </div>
  );
};

const SecondStep = (props: any) => {
  return (
    <Formik
      innerRef={props.formRef}
      initialValues={{ remark: "" }}
      onSubmit={(v) => {
        props.onConfirm(v);
      }}
    >
      {({ handleChange }) => (
        <Form className="mb-16 space-y-4">
          <Radio
            options={otherOptions}
            name="remark"
            label="Remark"
            onChange={handleChange}
            inputClassName="rounded-full text-green-600 checked:bg-green-600 focus:ring-green-400 focus:border-green-400"
          />
        </Form>
      )}
    </Formik>
  );
};

const ThirdStep = (props: any) => {
  return (
    <Formik
      innerRef={props.formRef}
      initialValues={{
        hasAndroid: undefined,
        remark: "",
      }}
      onSubmit={(v) => props.onConfirm(v)}
    >
      {({ values, setFieldValue, handleChange }) => (
        <Form className="mb-16 space-y-4">
          <Radio
            options={[
              { label: "Yes", value: 1 },
              { label: "No", value: 0 },
            ]}
            name="hasAndroid"
            label="Do you use android phone?"
            required
            onChange={(e) => {
              if (e.target.value == "0") {
                setFieldValue("remark", "");
              }
              handleChange(e);
            }}
            inputClassName="rounded-full text-green-600 checked:bg-green-600 focus:ring-green-400 focus:border-green-400"
          />

          {Boolean(Number(values.hasAndroid)) && (
            <Radio
              options={joinOptions}
              name="remark"
              label="Remark"
              required
              onChange={handleChange}
              inputClassName="rounded-full text-green-600 checked:bg-green-600 focus:ring-green-400 focus:border-green-400"
            />
          )}
        </Form>
      )}
    </Formik>
  );
};

type ModalType = "wrong_no" | "left_devotion" | "doing_devotion";

const OldCallingSevaCompleteCard = ({ call }: { call: any }) => {
  const { t: ts } = useTranslation("status");
  return (
    <Fragment>
      <CardWrapper className="w-[98%] mb-2">
        <CardMessage
          className="pr-10"
          message={{
            name: call.name,
            address: call.address,
            mobile_no: call.mobile_no,
            ...(call?.new_mobile_no && { new_mobile_no: call.new_mobile_no }),
            form_date: dayjs(call.form_date).format("DD-MM-YYYY"),
          }}
        />
        <CardIcons mobile_no={call.mobile_no} />
        <div
          className={cn(
            "overflow-hidden p-1 w-full capitalize text-center text-sm border-t border-gray-500",
            getStatusColor(call?.status)
          )}
        >
          <p>
            {call.status.replace(/_/g, " ")}{" "}
            {call?.remark && <span>({call?.remark.replace(/_/g, " ")})</span>}
          </p>
          <p>{ts("completed_by", { name: call?.response_by_user })}</p>
        </div>
      </CardWrapper>
    </Fragment>
  );
};

const OldCallingSevaCard = ({
  onClick,
  call,
}: {
  onClick: (data?: any) => void;
  call: any;
}) => {
  return (
    <Fragment>
      <CardWrapper className="w-[98%] mb-1">
        <CardMessage
          className="pr-10"
          message={{
            name: call.name,
            address: call.address,
            mobile_no: call.mobile_no,
            ...(call?.new_mobile_no && { new_mobile_no: call.new_mobile_no }),
            form_date: dayjs(call.form_date).format("DD-MM-YYYY"),
          }}
        />
        <CardIcons mobile_no={call.mobile_no} />
        <CardGridContainer>
          <CardButton
            label="Wrong Number"
            className="text-orange-500 border"
            onClick={() => onClick({ status: "wrong_no", call_id: call.id })}
          />
          <CardButton
            label="Left Devotion"
            className="text-red-500 border"
            onClick={() =>
              onClick({ status: "left_devotion", call_id: call.id })
            }
          />
          <CardButton
            label="Active Devotion"
            className="text-green-600 border"
            onClick={() =>
              onClick({ status: "doing_devotion", call_id: call.id })
            }
          />
        </CardGridContainer>
      </CardWrapper>
    </Fragment>
  );
};

const OldCallingList: NextApplicationPage = () => {
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
  const formRef = useRef<FormikProps<FormikValues>>(null);
  const { bookPendingCalls, bookCompleteCalls } = useAppSelector(
    (state) => state.calling
  );
  const [selectedCallId, setSelectedCallId] = useState<undefined | number>(
    undefined
  );
  const [show, setShow] = useState<ModalType | "">("");
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [calls, setLocalCalls] = useState<any[]>([]);
  const dispatch = useAppDispatch();
  const [hasMore, setHasMore] = useState(true);
  const params = useMemo(() => {
    return {
      status: activeTab == 0 ? "pending" : "complete",
    };
  }, [activeTab]);

  const fetchList = useCallback(
    async (page: number, params: object) => {
      if (!loading) {
        setLoading(true);
        try {
          const { data } = await apiClient.get("old_calling", {
            params: {
              ...params,
              page,
            },
          });
          const temphasMore = data.data.total > 10 * page;
          setHasMore(temphasMore);

          const temp =
            page == 1 ? data.data.result : [...calls, ...data.data.result];
          setLocalCalls((pre: any[]) =>
            page == 1 ? data.data.result : [...pre, ...data.data.result]
          );
          setPage((p) => (page == 1 ? 2 : p + 1));
          if (activeTab == 0) {
            dispatch(setCalls({ type: "bookPendingCalls", calls: temp }));
          } else {
            dispatch(setCalls({ type: "bookCompleteCalls", calls: temp }));
          }
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

  function renderForm(
    props: any = {
      onConfirm: handleOldCallingResponse,
    }
  ) {
    switch (show) {
      case "wrong_no":
        return <FirstStep {...props} />;
      case "left_devotion":
        return <SecondStep {...props} />;
      case "doing_devotion":
        return <ThirdStep {...props} />;
    }
  }

  async function handleOldCallingResponse(payload?: object) {
    if (show === "" || !selectedCallId) return;
    try {
      const { data } = await apiClient.post("old_calling_response", {
        old_calling_id: selectedCallId,
        response_type: show,
        ...payload,
      });
      dispatch(filterCalls({ type: "bookPendingCalls", id: selectedCallId }));
      toast.success(data?.message);
      setSelectedCallId(undefined);
      setShow("");
    } catch (error) {
      console.error(error);
    }
  }

  const { ref, inView } = useInView();
  const { ref: ref2, inView: inView2 } = useInView();

  useEffect(() => {
    if (inView && page > 0 && hasMore) {
      fetchList(page, params);
    }
  }, [fetchList, inView, params, hasMore]);
  useEffect(() => {
    if (inView2 && page > 0 && hasMore) {
      fetchList(page, params);
    }
  }, [fetchList, inView2, params, hasMore]);

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: `Old Calling Seva`,
      }}
    >
      <div className="p-4 mx-auto max-w-xl w-full space-y-4 ">
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
            <div className="flex flex-col gap-2">
              {bookPendingCalls.map((call) => (
                // <CallingPendingCard  />
                <OldCallingSevaCard
                  call={call}
                  key={call.id}
                  onClick={({ status, call_id }) => {
                    setShow(status);
                    setSelectedCallId(call_id);
                  }}
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
              {bookCompleteCalls.map((call) => (
                <OldCallingSevaCompleteCard call={call} key={call.id} />
              ))}
              <div ref={ref2}>
                {loading && hasMore && (
                  <LoadingSpinner className={"mx-auto w-8 h-8"} />
                )}
              </div>
            </div>
          )}
        </div>
        <Modal
          show={show !== ""}
          onClose={() => setShow("")}
          onConfirm={() =>
            show === "wrong_no"
              ? handleOldCallingResponse({})
              : formRef?.current?.handleSubmit()
          }
        >
          <div className="space-y-8 mb-8">
            {renderForm({ formRef, onConfirm: handleOldCallingResponse })}
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default OldCallingList;
OldCallingList.requireAuth = true;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "calling",
        "question",
        "status",
      ])),
    },
  };
};
