import Button from "@/components/Button";
import ButtonTabs from "@/components/ButtonTabs";
import {
  BookCallingRecordPendingCard,
  BookCallingRecordCompleteCard,
} from "@/components/card/OrderPendingCard";
import Select from "@/components/input/Select";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import UserwiseDropdown, { OnFieldChange } from "@/components/UserwiseDropdown";
import apiClient from "@/http/index";
import { setOrders } from "@/redux/features/orderSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  getInitialValues,
  getOptionArray,
  objectWithValues,
} from "@/shared/functions/utils";
import { NextApplicationPage } from "@/shared/interfaces/app";
import { Option } from "@/shared/interfaces/option";
import dayjs from "dayjs";
import { Form, Formik } from "formik";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";

const Record: NextApplicationPage = () => {
  const { t: tc } = useTranslation("common");
  const { t } = useTranslation("calling");
  const [activeTab, setActiveTab] = useState(0);
  const [tabs, setTabs] = useState<any[]>([
    {
      label: tc("pending_seva"),
      page: 1,
      hasNext: true,
      query: "calling",
      type: "pendingOrders",
    },
    {
      label: tc("completed_seva"),
      page: 1,
      hasNext: true,
      query: "calling",
      type: "completedOrders",
    },
  ]);
  const { active_permission, active_region_index } = useAppSelector(
    (state) => state.auth
  );
  const region = active_permission?.role_region as string;
  const dispatch = useAppDispatch();
  const { pendingOrders, completedOrders } = useAppSelector(
    (state) => state.orders
  );
  const formRef = useRef<any>(null);
  const [sevadarList, setSevadarList] = useState<Option[]>([]);
  const [orders, setLocalOrders] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const params = useMemo(
    () => ({
      status: activeTab == 0 ? "pending" : "complete",
      ...getInitialValues(active_permission, active_region_index),
      ...objectWithValues(formRef?.current?.values ?? {}),
      ...(activeTab == 1 && {
        from_date: dayjs().startOf("month").startOf("day").toISOString(),
      }),
    }),

    [activeTab, formRef.current?.values, active_permission]
  );
  const fetchOrder = useCallback(
    async (page: number, params: Record<string, string | number | boolean>) => {
      if (!loading) {
        setLoading(true);
        try {
          const { data } = await apiClient.get("calling", {
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

  const getSevadarList = async (district_id: number) => {
    try {
      const { data } = await apiClient.get("users", {
        params: {
          role: 27,
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

  useEffect(() => {
    if (inView && page > 0 && hasMore) {
      fetchOrder(page, params);
    }
  }, [fetchOrder, inView, params, hasMore, activeTab]);

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
        heading: t("book.seva.title.records") ?? "BOOK CALLING RECORDS",
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
            const payload = {
              ...params,
              ...formValue,
              ...(activeTab == 1 && {
                from_date: dayjs()
                  .subtract(30, "day")
                  .startOf("day")
                  .toISOString(),
              }),
            };
            fetchOrder(1, payload);
          }}
        >
          {({ values, setFieldValue }) => {
            return (
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
                    if (district_id != null) {
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
            );
          }}
        </Formik>
        {activeTab == 0 ? (
          <div className="flex flex-col gap-2">
            {pendingOrders.map((order: any, index) => (
              <BookCallingRecordPendingCard order={order} key={index} />
            ))}
          </div>
        ) : null}
        {activeTab == 1 ? (
          <div className="flex flex-col gap-2">
            {completedOrders.map((order: any, index) => (
              <BookCallingRecordCompleteCard order={order} key={index} />
            ))}
          </div>
        ) : null}
        <div ref={ref}>
          {loading && hasMore && (
            <LoadingSpinner className={"mx-auto w-8 h-8"} />
          )}
        </div>
      </div>
    </Layout>
  );
};

Record.requireAuth = true;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "calling",
        "status",
      ])),
    },
  };
};

export default Record;
