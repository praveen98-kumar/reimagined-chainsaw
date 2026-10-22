import Button from "@/components/Button";
import ButtonTabs from "@/components/ButtonTabs";
import {
  CardDateStatus,
  CardGridContainer,
  CardIcons,
  CardMessage,
  CardWrapper,
  getStatusColor,
} from "@/components/card/CommonCard";
import Layout from "@/components/Layout";
import UserwiseDropdown, { OnFieldChange } from "@/components/UserwiseDropdown";
import apiClient from "@/http/index";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  cn,
  getInitialValues,
  getOptionArray,
  objectWithValues,
} from "@/shared/functions/utils";
import { NextApplicationPage, Tab } from "@/shared/interfaces/app";
import dayjs from "dayjs";
import { setCalls, filterCalls } from "@/redux/features/callingSlice";
import { Option } from "@/shared/interfaces/option";
import { Form, Formik, FormikProps, FormikValues } from "formik";
import { GetStaticProps } from "next";
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
import Select from "@/components/input/Select";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useInView } from "react-intersection-observer";

const OldCallingSevaCompleteCard = ({
  call,
  type,
  pending = false,
}: {
  call: any;
  type?: boolean;
  pending?: boolean;
}) => {
  const { t: ts } = useTranslation("status");
  return (
    <Fragment>
      <CardWrapper className="w-[98%]">
        <CardMessage
          className="pr-10"
          message={{
            name: call?.name,
            address: call?.address,
            mobile_no: call?.mobile_no,
            ...(call?.new_mobile_no && { new_mobile_no: call.new_mobile_no }),
            form_date: dayjs(call?.form_date).format("DD-MM-YYYY"),
          }}
        />
        <CardIcons mobile_no={call?.mobile_no} />
        <CardGridContainer>
          <>
            <CardDateStatus
              title="Old Calling Allotted: "
              className={cn({ "col-span-2": pending })}
              date={call?.allotted_at}
            />
            <CardDateStatus
              title="Old Calling Done:"
              className={cn({ hidden: pending })}
              date={call?.response_at}
            />
          </>
        </CardGridContainer>
        <div
          className={cn(
            "overflow-hidden p-2 w-full capitalize text-center border-t border-gray-500",
            getStatusColor(call?.status)
          )}
        >
          {!pending && <p>{call?.status}</p>}

          {type ? (
            <p>
              Allotted to{" "}
              <span className="font-semibold">{call?.allotted_to_user}</span>
            </p>
          ) : (
            <p>{ts("completed_by", { name: call?.response_by_user })}</p>
          )}
        </div>
      </CardWrapper>
    </Fragment>
  );
};

const OldCallingRecord: NextApplicationPage = () => {
  const { t: tc } = useTranslation("common");
  const [activeTab, setActiveTab] = useState(0);
  const formRef = useRef<FormikProps<FormikValues>>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasmore] = useState(true);
  const [tabs, setTabs] = useState<Tab[]>([
    { label: tc("pending_seva")!, page: 1, hasNext: true, query: "calling" },
    {
      label: tc("completed_seva")!,
      page: 1,
      hasNext: true,
      query: "calling",
    },
  ]);
  const { active_permission, active_region_index } = useAppSelector(
    (state) => state.auth
  );
  const region = active_permission?.role_region as string;
  const [sevadarList, setSevadarList] = useState<Option[]>([]);
  const dispatch = useAppDispatch();
  const [calls, setLocalCalls] = useState<any[]>([]);
  const { bookPendingCalls, bookCompleteCalls } = useAppSelector(
    (state) => state.calling
  );
  const params = useMemo(
    () => ({
      status: activeTab == 0 ? "pending" : "complete",
      ...getInitialValues(active_permission, active_region_index),
      ...objectWithValues(formRef?.current?.values ?? {}),
    }),

    [activeTab, formRef.current?.values, active_permission]
  );
  const [page, setPage] = useState<number>(1);

  const fetchCalls = useCallback(
    async (page: number, params: Record<string, string | number | boolean>) => {
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
          const temp =
            page == 1 ? data.data.result : [...calls, ...data.data.result];
          setLocalCalls((pre: any[]) =>
            page == 1 ? data.data.result : [...pre, ...data.data.result]
          );
          setPage((p) => (page == 1 ? 2 : p + 1));
          setHasmore(temphasMore);

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

  const getSevadarList = async (district_id: number) => {
    try {
      const { data } = await apiClient.get("users", {
        params: {
          role: 48,
          district_id,
          limit: 0,
        },
      });
      setSevadarList(
        getOptionArray(
          [...data.data.result].map((u) => ({
            name: u.disciple.name,
            id: u.id,
          })),
          "name",
          "id"
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const { ref, inView } = useInView();
  const { ref: ref2, inView: inView2 } = useInView();

  useEffect(() => {
    if (inView && page > 0 && hasMore) {
      fetchCalls(page, params);
    }
  }, [fetchCalls, inView, params, hasMore]);
  useEffect(() => {
    if (inView2 && page > 0 && hasMore) {
      fetchCalls(page, params);
    }
  }, [fetchCalls, inView2, params, hasMore]);

  useEffect(() => {
    if (
      active_permission?.region[active_region_index].district_id &&
      region == "district"
    ) {
      getSevadarList(
        active_permission?.region[active_region_index].district_id
      );
    }
  }, [active_permission, active_region_index, region]);

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
        <Formik
          innerRef={formRef}
          initialValues={{
            country_id: 0,
            state_id: 0,
            district_id: 0,
            tehsil_id: 0,
            allocated_to: 0,
          }}
          onSubmit={(values) => {
            const formValue = objectWithValues(values);
            fetchCalls(1, { ...params, ...formValue });
          }}
        >
          {({ values, setFieldValue }) => (
            <Form>
              <UserwiseDropdown
                conditionalFields={{ tehsil_id: false }}
                isClearable={true}
                showDivision={active_permission?.role_region == "division"}
              />
              <OnFieldChange
                fields={["country_id", "state_id"]}
                // @ts-ignore
                onChange={() => {
                  setSevadarList([]);
                  setFieldValue("allocated_to", 0);
                }}
              />
              <OnFieldChange
                fields={["district_id"]}
                // @ts-ignore
                onChange={({ district_id }) => {
                  setSevadarList([]);
                  setFieldValue("allocated_to", 0);
                  if (district_id != null && district_id != 0) {
                    getSevadarList(district_id);
                  }
                }}
              />
              <Select
                name={"allocated_to"}
                options={sevadarList}
                label={tc("sevadar.sevadar") ?? "Sevadar"}
                placeholder={tc("select_sevadar") ?? "Select Sevadar"}
                value={
                  sevadarList.find((s) => s.value == values.allocated_to) ??
                  null
                }
                onChange={(opt: any) => {
                  setFieldValue(
                    "allocated_to",
                    opt && opt.value ? opt.value : null
                  );
                }}
                isClearable={true}
              />
              <Button className="mx-auto" type="submit">
                {tc("search")}
              </Button>
            </Form>
          )}
        </Formik>

        {activeTab == 0 ? (
          <div className="flex flex-col gap-2">
            {bookPendingCalls.map((order: any, index) => (
              <OldCallingSevaCompleteCard
                call={order}
                key={`old-seva-${index}`}
                type
                pending
              />
            ))}
            <div ref={ref}>
              {loading && hasMore && (
                <LoadingSpinner className={"mx-auto w-8 h-8"} />
              )}
            </div>
          </div>
        ) : null}
        {activeTab == 1 ? (
          <div className="flex flex-col gap-2">
            {bookCompleteCalls.map((order: any, index) => (
              <OldCallingSevaCompleteCard
                key={`old-seva-${index}`}
                call={order}
              />
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

export default OldCallingRecord;
OldCallingRecord.requireAuth = true;

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
