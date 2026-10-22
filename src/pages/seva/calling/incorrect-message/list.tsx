import ButtonTabs from "@/components/ButtonTabs";
import CardButton from "@/components/card/CardButton";
import {
  CardDateStatus,
  CardGridContainer,
  CardIcons,
  CardMessage,
  CardWrapper,
} from "@/components/card/CommonCard";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import Modal from "@/components/modal/Modal";
import apiClient from "@/http/index";
import {
  filterOrders,
  prepandOrder,
  setOrders,
  updateOrder,
} from "@/redux/features/orderSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { getInitialValues, objectWithValues } from "@/shared/functions/utils";
import {
  getIncompleteOrderStatusByValue,
  INCOMPLETE_ORDER_STATUS,
} from "@/shared/interfaces/app";
import dayjs from "dayjs";
import { useCount } from "@/hooks/useCount";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaQuestionCircle } from "react-icons/fa";
import InfiniteScroll from "react-infinite-scroll-component";
import toast from "react-hot-toast";

const list = () => {
  const { t } = useTranslation("calling");
  const { t: tc } = useTranslation("common");
  const [activeTab, setActiveTab] = useState(0);
  const { active_permission, active_region_index, user } = useAppSelector(
    (state) => state.auth
  );
  const { pendingIncorrectOrders, completedIncorrectOrders } = useAppSelector(
    (state) => state.orders
  );
  const [tabs, setTabs] = useState<any[]>([
    {
      label: tc("pending_seva")!,
      page: 1,
      hasNext: true,
      query: "incorrect_orders",
      status: "pending",
      type: "pendingIncorrectOrders",
    },
    {
      label: tc("completed_seva")!,
      page: 1,
      hasNext: true,
      query: "incorrect_orders",
      status: "complete",
      type: "completedIncorrectOrders",
    },
  ]);
  const formRef = useRef<any>(null);
  const dispatch = useAppDispatch();
  const [orders, setLocalOrders] = useState<any>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const { update } = useCount();
  const { incorrectCounts: counts } = useAppSelector((state) => state.counts);
  const params = useMemo(
    () => ({
      status: tabs[activeTab].status,
      allocated_to: user?.id,
      ...getInitialValues(active_permission, active_region_index),
      ...objectWithValues(formRef?.current?.values ?? {}),
    }),
    [activeTab, active_permission, formRef?.current?.values]
  );
  const activeCountryId =
    active_permission?.region[active_region_index]?.country_id;
  const fetchOrder = useCallback(
    async (page: number, params: Record<string, string | number | boolean>) => {
      if (!loading) {
        setLoading(true);
        try {
          const { data } = await apiClient.get("incorrect_orders", {
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
          if (
            active_permission?.role == "incomplete_message_sevadar" &&
            activeTab == 0
          ) {
            console.log("APi Response", data.data);
            update(
              "incorrectCounts",
              "country_id",
              {
                role: active_permission?.role,
                country_id: activeCountryId,
                counts: {
                  pending_order: data.data.total,
                },
              },
              true
            );
          }
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

  useEffect(() => {
    fetchOrder(1, params);
  }, [activeTab]);

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: t("incomplete.heading") ?? "Incomplete Messages Calling Seva",
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
        {activeTab == 0 && (
          <InfiniteScroll
            className="space-y-4"
            dataLength={pendingIncorrectOrders.length}
            next={() => fetchOrder(page, params)}
            hasMore={hasMore}
            loader={<LoadingSpinner className={"mx-auto w-8 h-8"} />}
          >
            {pendingIncorrectOrders.map((order) => (
              <IncorrectCard
                pending={true}
                order={order}
                key={order.id}
                type={0}
              />
            ))}
          </InfiniteScroll>
        )}
        {activeTab == 1 && (
          <InfiniteScroll
            className="space-y-4"
            dataLength={completedIncorrectOrders.length}
            next={() => fetchOrder(page, params)}
            hasMore={hasMore}
            loader={<LoadingSpinner className={"mx-auto w-8 h-8"} />}
          >
            {completedIncorrectOrders.map((order) => (
              <IncorrectCard
                pending={false}
                order={order}
                key={order.id}
                type={0}
              />
            ))}
          </InfiniteScroll>
        )}
      </div>
    </Layout>
  );
};
type StatusType = keyof Pick<
  typeof INCOMPLETE_ORDER_STATUS,
  "NOT_INTERESTED" | "OUT_OF_REACH"
>;

export const IncorrectCard = ({
  order,
  type = 0,
  pending = true,
}: {
  order: any;
  type: number;
  pending: boolean;
}) => {
  const { t: ts } = useTranslation("status");
  const { t: tq } = useTranslation("question");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const dispatch = useAppDispatch();
  const [show, setShow] = useState<StatusType | "">("");
  const { active_permission, active_region_index } = useAppSelector(
    (s) => s.auth
  );
  const activeCountryId =
    active_permission?.region[active_region_index]?.country_id;
  const { update: updateCounts } = useCount();

  const getStatusColor = () => {
    switch (order.status) {
      case "interested":
        return "text-green-600";
      case "not_interested":
        return "text-red-500";
      case "got_initiation":
        return "text-blue-500";
      case "duplicate":
        return "text-yellow-500";
      case "out-of-reach":
        return "text-orange-500";
      default:
        return "text-gray-500";
    }
  };
  const handleConfirm = async (status: StatusType, values?: object) => {
    setLoading(true);
    try {
      const data = {
        incorrect_order_id: order.id,
        response_type: INCOMPLETE_ORDER_STATUS[status],
        ...(values && values),
      };
      const res = await apiClient.post("incorrect_order_response", data);
      if (!["OUT_OF_REACH"].includes(show)) {
        dispatch(
          filterOrders({ type: "pendingIncorrectOrders", id: order.id })
        );
        dispatch(
          prepandOrder({
            key: "completedIncorrectOrders",
            data: {
              ...order,
              status_int: INCOMPLETE_ORDER_STATUS[status],
              response_at: new Date(),
            },
          })
        );
        updateCounts("incorrectCounts", "country_id", {
          role: active_permission?.role,
          country_id: activeCountryId,
          counts: {
            ctm: 1,
            ctd: 1,
            pending_order: -1,
          },
        });
      } else {
        dispatch(
          updateOrder({
            type: "pendingIncorrectOrders",
            data: {
              id: order.id,
              status_int: INCOMPLETE_ORDER_STATUS[status],
            },
          })
        );
      }
      setShow("");
      toast.success(res?.data?.message);
      setLoading(false);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CardWrapper className="w-[98%]">
        <CardMessage
          className="pr-12 h-28"
          message={{
            sr_no: order.id,
            mobile_no: order?.mobile_no,
            message: order?.message,
          }}
        />
        {order?.mobile_no ? <CardIcons mobile_no={order.mobile_no} /> : null}

        <CardGridContainer className="gap-0.5">
          <CardDateStatus
            title={ts("order_received_on")}
            date={order?.created_at}
          />
          <CardDateStatus
            title={ts("incomplete_calling_allotted")}
            date={order?.allocation_date || order?.incomplete_allotted_at}
          />
        </CardGridContainer>
        {pending ? (
          type == 0 ? (
            <CardGridContainer>
              <CardButton
                onClick={() => {
                  // dispatch(selectMissCall(order));
                  localStorage.setItem("orderDetail", JSON.stringify(order));
                  router.push(
                    "/seva/order/order-form?type=want_book&seva_type=incorrect_order_response"
                  );
                }}
                label="Update Detail"
                className="text-black transition active:border-transparent duration-300 active:bg-black active:text-white active:shadow-lg font-bold border-r border-t border-gray-400"
              />
              <CardButton
                label={ts("not_interested")}
                className="text-red-500 transition active:border-transparent duration-300 active:bg-red-500 active:text-white active:shadow-lg font-bold border-l border-t border-gray-400 "
                onClick={() => setShow("NOT_INTERESTED")}
              />
              <CardButton
                label={ts("out_of_reach")}
                className={`${
                  order.status_int === INCOMPLETE_ORDER_STATUS.OUT_OF_REACH
                    ? "text-white bg-yellow-500"
                    : "text-yellow-500 active:bg-orange-500 active:text-white active:shadow-lg"
                } col-span-2 transition active:border-transparent duration-300  font-bold border-l border-t border-gray-400`}
                onClick={() => setShow("OUT_OF_REACH")}
              />
            </CardGridContainer>
          ) : (
            <p className="p-3 text-center text-white bg-primary font-semibold">
              {ts("allotted_to", { name: order?.allocated_to?.disciple?.name })}
            </p>
          )
        ) : (
          <>
            {type == 0 ? (
              <p className={`text-center capitalize ${getStatusColor()} py-2`}>
                <span className="capitalize mr-2">
                  {getIncompleteOrderStatusByValue(
                    order?.status_int == 1 ? 3 : order?.status_int
                  )
                    ?.split("_")
                    .join(" ")}
                  :
                </span>
                <span>
                  {dayjs(order.incomplete_response_at).format("DD/MM/YYYY")}
                </span>
              </p>
            ) : (
              <>
                <p className={`text-center ${getStatusColor()} my-0`}>
                  {order?.allocated_to &&
                    ts("completed_by", {
                      name: order?.allocated_to?.disciple?.name,
                    })}
                </p>
                <p
                  className={`text-center capitalize ${getStatusColor()} my-0`}
                >
                  <span className="capitalize">
                    {getIncompleteOrderStatusByValue(
                      order?.status_int == 1 ? 3 : order?.status_int
                    )
                      ?.split("_")
                      .join(" ")}
                    :
                  </span>
                  <span>{dayjs(order.response_at).format("DD/MM/YYYY")}</span>
                </p>
              </>
            )}
          </>
        )}
      </CardWrapper>
      {show != "" ? (
        <Modal
          show={show === "OUT_OF_REACH" || show === "NOT_INTERESTED"}
          onConfirm={() => handleConfirm(show)}
          onClose={() => setShow("")}
          loading={loading}
        >
          <div className="space-y-8 mb-8">
            <FaQuestionCircle className=" mx-auto w-20 h-20 text-primary" />
            <p className="font-normal text-xl text-center">
              {show === "OUT_OF_REACH"
                ? tq("out_of_reach", { sr_no: order.id })
                : tq("not_interested", { sr_no: order.id })}
            </p>
          </div>
        </Modal>
      ) : null}
    </>
  );
};

list.requireAuth = true;
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

export default list;
