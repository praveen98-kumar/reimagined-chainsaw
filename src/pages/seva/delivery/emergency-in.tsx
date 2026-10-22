import Button from "@/components/Button";
import ButtonTabs from "@/components/ButtonTabs";
import TextInput from "@/components/input/TextInput";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import Timer from "@/components/Timer";
import UserwiseDropdown from "@/components/UserwiseDropdown";
import apiClient from "@/http/index";
import { setOrders } from "@/redux/features/orderSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  getInitialValues,
  isValidUser,
  objectWithValues,
} from "@/shared/functions/utils";
import { BOOK_ORDER_STATUS } from "@/shared/interfaces/app";
import { OrderIn } from "@/shared/interfaces/order-in-card";
import dayjs from "dayjs";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ImForward } from "react-icons/im";
import { useInView } from "react-intersection-observer";

const AllottCard = ({
  order,
  completed = false,
  selected = false,
}: {
  order: OrderIn;
  completed?: boolean;
  selected?: boolean;
}) => {
  let days = useMemo(() => {
    return dayjs(new Date()).diff(order.order_at, "d");
  }, []);

  let remainingDay = useMemo(() => {
    let maxDays = 5;
    if (days <= 5) {
      maxDays = 5;
    } else if (days > 5 && days <= 10) {
      maxDays = 11;
    } else if (days > 10 && days <= 15) {
      maxDays = 16;
    }
    return maxDays - days;
  }, [days]);
  const textColor = () => {
    switch (order.book_order_status) {
      case BOOK_ORDER_STATUS.DUPLICATED:
        return "text-yellow-500";
      case BOOK_ORDER_STATUS.DIFFERENT_AREA:
        return "text-gray-500";
      case BOOK_ORDER_STATUS.WRONG_ORDER:
        return "text-red-500";
      default:
        return "text-green-600";
    }
  };
  let borderColor = useMemo(() => {
    return days <= 5
      ? "border-green-600"
      : days <= 10
      ? "border-yellow-500"
      : "border-red-500";
  }, [days]);
  return (
    <div
      className={`w-full mb-4 flex overflow-hidden flex-col shadow-xl  drop-shadow-lg border ${borderColor} border-4 rounded-lg rounded-tr-none relative ${
        selected ? "bg-gray-300/50" : "bg-white"
      }`}
    >
      <div className="flex w-full">
        <div className="flex-1 p-2 pt-5 text-sm text-gray-600">
          <p>Sr No : {order.id}</p>
          <p>Name : {order.name}</p>
          <p>Address : {order.message}</p>
          <p>Mobile no : {order.mobile_no}</p>
          {order.book_lang && (
            <p>
              Book Name : {order.book_name} {order.book_lang}
            </p>
          )}
        </div>
        <div className="flex flex-col items-center">
          <Timer
            value={remainingDay}
            bg={borderColor.replace("border", "bg")}
          />
        </div>
      </div>
      <div className="bg-gray-500 flex items-center justify-around text-gray-200 text-xs p-1 text-center">
        <span>
          {" "}
          ऑर्डर दिया गया: {dayjs(order.order_at).format("DD/MM/YYYY")}
        </span>
        {completed && (
          <>
            <div className="h-full w-0.5 bg-gray-300" />
            <span>
              Alloted On: {dayjs(order.order_allotted_at).format("DD/MM/YYYY")}
            </span>
          </>
        )}
      </div>
      {completed && (
        <div className="overflow-hidden p-2 text-white text-center border-t-0 rounded-b-lg">
          <button
            className={`w-full font-medium p-2 capitalize ${
              order.response_by_name ? textColor() : "text-gray-500"
            }`}
          >
            {order.response_by_names
              ? order.response_by_name
              : order.allocated_to_name}
            {order.response_by_name ? " द्वारा पूर्ण की गयी" : " को नियुक्त"}
            <br />
            {/* {order.book_order_status.replace("_", " ")} */}
            {order.book_order_status == BOOK_ORDER_STATUS.WRONG_ORDER ? (
              <span className="text-sm">
                ({order.reason.replace("_", " ")})
              </span>
            ) : (
              ""
            )}
            - {dayjs(order.delivered_at).format("DD/MM/YYYY")}
          </button>
        </div>
      )}
    </div>
  );
};

const EmergencyOrderIn = () => {
  const { user, active_region_index, active_permission } = useAppSelector(
    (state) => state.auth
  );
  const [activeTab, setActiveTab] = useState(0);
  const [tabs, setTabs] = useState<any[]>([
    {
      label: "सेवा अलोट करें",
      page: 1,
      hasNext: true,
      query: "orders",
      type: "emergencyPendingOrder",
    },
    {
      label: "पूर्ण सेवा",
      page: 1,
      hasNext: true,
      query: "orders",
      type: "emergencyCompletedOrder",
    },
  ]);
  const dispatch = useAppDispatch();
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const router = useRouter();
  const formRef = useRef<any>(null);
  const { emergencyPendingOrder, emergencyCompletedOrder } = useAppSelector(
    (state) => state.orders
  );
  const [orders, setLocalOrders] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const params = useMemo(
    () => ({
      ...(activeTab == 0 ? { status: "received" } : { allocated_by: user?.id }),
      emergency: "1",
      send_for_delivery: 1,
      ...getInitialValues(active_permission, active_region_index),
      ...objectWithValues(formRef?.current?.values ?? {}),
    }),
    [activeTab, active_permission, formRef?.current?.values]
  );

  const fetchOrder = useCallback(
    async (page: number, params: Record<string, string | number | boolean>) => {
      if (!loading) {
        setLoading(true);
        try {
          const { data } = await apiClient.get("orders", {
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
    [activeTab]
  );

  const addOrder = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    if (e.target.checked) {
      setSelectedOrders((pre) => [...pre, id]);
    } else {
      setSelectedOrders(selectedOrders.filter((i: any) => i !== id));
    }
  };

  const { ref, inView } = useInView();
  const { ref: ref2, inView: inView2 } = useInView();

  useEffect(() => {
    if (inView && page > 0 && hasMore) {
      fetchOrder(page, params);
    }
  }, [fetchOrder, inView, params, hasMore]);
  useEffect(() => {
    if (inView2 && page > 0 && hasMore) {
      fetchOrder(page, params);
    }
  }, [fetchOrder, inView2, params, hasMore]);

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: selectedOrders.length
          ? "Allot Orders to Sevadar"
          : "EMERGENCY ORDERS",
        rightIcon: selectedOrders.length ? (
          <ImForward
            onClick={() => {
              localStorage.setItem(
                "selectedOrders",
                JSON.stringify(selectedOrders)
              );
              router.push("/seva/delivery/allott");
            }}
            className="w-6 h-6 text-white absolute right-5"
            style={{ transform: "scale(1,-1)" }}
          />
        ) : null,
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
            pincode: "",
          }}
          onSubmit={(values) => {
            const formValue = objectWithValues(values);
            fetchOrder(1, { ...params, ...formValue });
          }}
        >
          {() => (
            <Form>
              <UserwiseDropdown
                showDivision={active_permission?.role_region == "division"}
              />
              <TextInput
                name="pincode"
                label="Pincode"
                inputMode="numeric"
                minLength={6}
                maxLength={6}
              />
              <Button
                type="submit"
                className="mx-auto w-1/2 mb-2"
                disabled-={loading}
                loading={loading}
              >
                खोजें
              </Button>
            </Form>
          )}
        </Formik>
        {((activeTab === 0 && emergencyPendingOrder.length == 0) ||
          (activeTab === 1 && emergencyCompletedOrder.length == 0)) && (
          <p className={"text-center font-bold"}>Orders not found.</p>
        )}
        {activeTab == 0 ? (
          <div className="flex flex-col gap-2">
            {emergencyPendingOrder.map((order: any, index) => {
              const selected = !!selectedOrders.find((id) => id == order.id);
              return (
                <label
                  htmlFor={order.id.toString()}
                  key={index}
                  className="relative"
                >
                  {active_permission && isValidUser("allot_book_order") && (
                    <input
                      className="absolute top-2 left-3 rounded text-black focus:ring-black"
                      type={"checkbox"}
                      style={{ zIndex: 1 }}
                      name={order.id.toString()}
                      id={order.id.toString()}
                      onChange={(e) => addOrder(e, order.id)}
                    />
                  )}
                  <AllottCard order={order} key={index} selected={selected} />
                </label>
              );
            })}
            <div ref={ref}>
              {loading && hasMore && (
                <LoadingSpinner className={"mx-auto w-8 h-8"} />
              )}
            </div>
          </div>
        ) : null}
        {activeTab == 1 ? (
          <div className="flex flex-col gap-2">
            {emergencyCompletedOrder.map((order: any, index) => (
              <AllottCard order={order} completed={true} key={index} />
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

export default EmergencyOrderIn;
