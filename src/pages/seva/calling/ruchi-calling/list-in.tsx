import Button from "@/components/Button";
import CallingRequestCard from "@/components/card/CallingRequestCard";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import UserwiseDropdown from "@/components/UserwiseDropdown";
import apiClient from "@/http/index";
import { setCalls } from "@/redux/features/callingSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  getInitialValues,
  isValidUser,
  objectWithValues,
} from "@/shared/functions/utils";
import { Formik, Form } from "formik";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { NextApplicationPage } from "@/shared/interfaces/app";
import { useCount } from "../../../../hooks/useCount";

const RuchiCallingListIn: NextApplicationPage = () => {
  const { t: tc } = useTranslation("common");
  const { t } = useTranslation("calling");
  const { ruchiIn } = useAppSelector((state) => state.calling);
  const dispatch = useAppDispatch();
  const [calls, setLocalCalls] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const formRef = useRef<any>(null);
  const { active_permission, active_region_index } = useAppSelector(
    (state) => state.auth
  );
  const { jyadaRuchiCounts } = useAppSelector((state) => state.counts);
  const activeDistrictId =
    active_permission?.region[active_region_index]?.district_id;
  const { update } = useCount();
  const params = useMemo(
    () => ({
      status: "jyada_ruchi",
      ...getInitialValues(active_permission, active_region_index),
      ...objectWithValues(formRef?.current?.values ?? {}),
    }),

    [formRef.current?.values, active_permission]
  );

  const fetchCalls = useCallback(
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
          if (active_permission?.role == "jyada_ruchi_sevadar") {
            update("jyadaRuchiCounts", "district_id", {
              role: active_permission?.role,
              district_id: activeDistrictId,
              counts: {
                pending_order_in:
                  data.data.total - Number(jyadaRuchiCounts.pending_order_in),
              },
            });
          }
          const temphasMore = data.data.total > 10 * page;
          const temp =
            page == 1 ? data.data.result : [...calls, ...data.data.result];
          setLocalCalls((pre: any[]) =>
            page == 1 ? data.data.result : [...pre, ...data.data.result]
          );
          setPage((p) => (page == 1 ? 2 : p + 1));
          setHasMore(temphasMore);
          dispatch(setCalls({ type: "ruchiIn", calls: temp }));
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    },
    [calls, loading]
  );
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && page > 0 && hasMore) {
      fetchCalls(page, params);
    }
  }, [fetchCalls, inView, params, hasMore]);

  useEffect(() => {
    if (calls.length < 5 && hasMore) {
      fetchCalls(page, params);
    }
  }, [hasMore, calls.length, page, params]);

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: t("ruchi.seva.title.seva_in") ?? "Jyada Ruchi Calling Seva IN",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        {active_permission && active_permission?.role_region !== "district" && (
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
              fetchCalls(1, { ...params, ...formValue });
            }}
          >
            {() =>
              !isValidUser("jyada_ruchi_seva_list", [
                "jyada_ruchi_sevadar",
              ]) && (
                <Form>
                  <UserwiseDropdown
                    conditionalFields={{ tehsil_id: false }}
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
              )
            }
          </Formik>
        )}
        <div className="flex flex-col gap-2">
          {ruchiIn.map((call) => (
            <CallingRequestCard call={call} />
          ))}
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

RuchiCallingListIn.requireAuth = true;

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

export default RuchiCallingListIn;
