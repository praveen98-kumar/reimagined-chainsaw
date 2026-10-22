import CallingCompletedCard from "@/components/card/CallingCompletedCard";
import CallingPendingCard from "@/components/card/CallingPendingCard";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { UpdateMobileModal } from "@/components/modal/UpdateMobileModal";
import apiClient from "@/http/index";
import { setCalls } from "@/redux/features/callingSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { NextApplicationPage, Tab } from "@/shared/interfaces/app";
import { Call } from "@/shared/interfaces/calling";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { useCount } from "../../../../hooks/useCount";

const BookCallingList: NextApplicationPage = () => {
  const { t } = useTranslation("calling");
  const { t: tc } = useTranslation("common");
  const { t: tq } = useTranslation("question");
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
  const [editingCall, setEditingCall] = useState<Call | null>(null);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { bookPendingCalls, bookCompleteCalls } = useAppSelector(
    (state) => state.calling
  );
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { update } = useCount();
  const { active_permission, active_region_index } = useAppSelector(
    (state) => state.auth
  );
  const { bookCallingCounts } = useAppSelector((state) => state.counts);

  const activeDistrictId =
    active_permission?.region[active_region_index].district_id;
  const params = useMemo(
    () => ({
      allocated_to: user?.id as number,
      status: activeTab == 0 ? "pending" : "complete",
    }),
    [activeTab]
  );

  const fetchData = useCallback(
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
          if (active_permission?.role == "book_calling_sevadar") {
            update("bookCallingCounts", "district_id", {
              role: active_permission?.role,
              district_id: activeDistrictId,
              counts: {
                pending_order:
                  data.data.total - Number(bookCallingCounts.pending_order),
              },
            });
          }
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
    [activeTab, calls, loading]
  );

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && page > 0 && hasMore) {
      fetchData(page, params);
    }
  }, [fetchData, inView, params, hasMore]);

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
        heading: t("book.heading") ?? "Book Calling Seva",
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
        {/* {active_permission && active_permission?.role_region !== "tehsil" && ( */}
        {/*   <Formik */}
        {/*     innerRef={formRef} */}
        {/*     initialValues={{ */}
        {/*       country_id: 0, */}
        {/*       state_id: 0, */}
        {/*       district_id: 0, */}
        {/*       tehsil_id: 0, */}
        {/*       pincode: "", */}
        {/*     }} */}
        {/*     onSubmit={(values) => { */}
        {/*       const formValue = objectWithValues(values); */}
        {/*       fetchData(1, { ...params, ...formValue }); */}
        {/*     }} */}
        {/*   > */}
        {/*     {() => ( */}
        {/*       <Form> */}
        {/*         <UserwiseDropdown /> */}
        {/*         <Button */}
        {/*           type="submit" */}
        {/*           className="mx-auto w-1/2" */}
        {/*           loading={loading} */}
        {/*         > */}
        {/*           {tc("search")} */}
        {/*         </Button> */}
        {/*       </Form> */}
        {/*     )} */}
        {/*   </Formik> */}
        {/* )} */}
        {activeTab == 0 ? (
          <div className="flex flex-col gap-2">
            {bookPendingCalls.map((call) => (
              <CallingPendingCard
                call={call}
                key={call.id}
                onEditClick={() => setEditingCall(call)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {bookCompleteCalls.map((call) => (
              <CallingCompletedCard call={call} key={call.id} />
            ))}
          </div>
        )}
        {editingCall != null ? (
          <UpdateMobileModal
            title={tq("update_mobile")}
            show={editingCall != null}
            item={editingCall}
            onClose={() => setEditingCall(null)}
            onConfirm={() => {}}
          />
        ) : null}
      </div>
      <div ref={ref}>
        {loading && hasMore && <LoadingSpinner className={"mx-auto w-8 h-8"} />}
      </div>
    </Layout>
  );
};

BookCallingList.requireAuth = true;
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

export default BookCallingList;
