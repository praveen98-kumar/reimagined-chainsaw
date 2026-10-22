import Button from "@/components/Button";
import ButtonTabs from "@/components/ButtonTabs";
import RuchiCallingCompletedCard from "@/components/card/RuchiCallingCompletedCard";
import RuchiCallingPendingCard from "@/components/card/RuchiCallingPendngCard";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import UserwiseDropdown, { OnFieldChange } from "@/components/UserwiseDropdown";
import apiClient from "@/http/index";
import { setCalls } from "@/redux/features/callingSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  getInitialValues,
  getOptionArray,
  isValidUser,
  objectWithValues,
} from "@/shared/functions/utils";
import { Formik, Form } from "formik";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { NextApplicationPage } from "@/shared/interfaces/app";
import Select from "@/components/input/Select";
import { Option } from "@/shared/interfaces/option";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "react-i18next";

const RuchiCallingListOut: NextApplicationPage = () => {
  const { t: tc } = useTranslation("common");
  const { t } = useTranslation("calling");
  const { t: tq } = useTranslation("question");
  const [activeTab, setActiveTab] = useState(0);
  const [tabs, setTabs] = useState<any[]>([
    {
      label: tc("pending_seva"),
      page: 1,
      hasNext: true,
      query: "jyada_ruchi",
      type: "ruchiPendingCalls",
    },
    {
      label: tc("completed_seva"),
      page: 1,
      hasNext: true,
      query: "jyada_ruchi",
      type: "ruchiCompleteCalls",
    },
  ]);
  const router = useRouter();
  const [type, setType] = useState<number>(0);
  const { user, active_permission, active_region_index } = useAppSelector(
    (state) => state.auth
  );
  const dispatch = useAppDispatch();
  const formRef = useRef<any>(null);
  const [sevadarList, setSevadarList] = useState<Option[]>([]);
  const { ruchiPendingCalls, ruchiCompleteCalls } = useAppSelector(
    (state) => state.calling
  );
  const [calls, setLocalCalls] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const params: any = useMemo(
    () => ({
      status: activeTab == 0 ? "pending" : "complete",
      ...getInitialValues(active_permission, active_region_index),
      ...(active_permission?.role == "jyada_ruchi_sevadar" && {
        allocated_to: user?.id,
      }),
    }),
    [activeTab]
  );

  const fetchCalls = useCallback(
    async (page: number, params: Record<string, string | number | boolean>) => {
      if (!loading) {
        setLoading(true);
        try {
          const { data } = await apiClient.get("jyada_ruchi", {
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
  }, [router.isReady]);
  const getSevadarList = async (district_id: number) => {
    try {
      const { data } = await apiClient.get("users", {
        params: {
          role: 28,
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

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading:
          t("ruchi.seva.title.seva_out") ?? "Jyada Ruchi Calling Seva OUT",
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
        {active_permission && active_permission?.role_region !== "tehsil" ? (
          <Formik
            innerRef={formRef}
            initialValues={{
              country_id: 0,
              state_id: 0,
              district_id: 0,
              tehsil_id: 0,
              pincode: "",
              allocated_to: 0,
            }}
            onSubmit={(values) => {
              const formValue = objectWithValues(values);
              fetchCalls(1, { ...params, ...formValue });
            }}
          >
            {({ values, setFieldValue }) =>
              !isValidUser("jyada_ruchi_seva_list", [
                "jyada_ruchi_sevadar",
              ]) && (
                <Form>
                  <UserwiseDropdown
                    conditionalFields={{ tehsil_id: false }}
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
                      getSevadarList(district_id);
                    }}
                  />
                  <Select
                    name={"allocated_to"}
                    options={sevadarList}
                    // label="Sevadar"
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
              )
            }
          </Formik>
        ) : null}
        {activeTab == 0 ? (
          <InfiniteScroll
            className="space-y-4"
            dataLength={ruchiPendingCalls.length}
            next={() => fetchCalls(page, params)}
            hasMore={hasMore}
            loader={<LoadingSpinner className={"mx-auto w-8 h-8"} />}
          >
            {ruchiPendingCalls.map((call) => (
              <RuchiCallingPendingCard call={call} key={call.id} type={type} />
            ))}
          </InfiniteScroll>
        ) : (
          <InfiniteScroll
            className="space-y-4"
            dataLength={ruchiCompleteCalls.length}
            next={() => fetchCalls(page, params)}
            hasMore={hasMore}
            loader={<LoadingSpinner className={"mx-auto w-8 h-8"} />}
          >
            {ruchiCompleteCalls.map((call) => (
              <RuchiCallingCompletedCard
                call={call}
                key={call.id}
                type={type}
              />
            ))}
          </InfiniteScroll>
        )}
      </div>
    </Layout>
  );
};

RuchiCallingListOut.requireAuth = true;

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

export default RuchiCallingListOut;
