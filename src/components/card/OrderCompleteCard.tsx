import React, { useMemo } from "react";
import dayjs from "dayjs";
import { OrderIn } from "@/shared/interfaces/order-in-card";
import { FiPhoneCall } from "react-icons/fi";
import { IoLogoWhatsapp } from "react-icons/io";
import Timer from "@/components/Timer";
import { cn } from "@/shared/functions/utils";
import { BOOK_ORDER_STATUS } from "@/shared/interfaces/app";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
interface OrderCompletedProps {
  order: OrderIn;
  showTimer?: boolean;
  showSevadarName?: boolean;
  showForTrackOrder?: boolean;
}

const OrderCompleteCard: React.FC<OrderCompletedProps> = ({
  order,
  showTimer = true,
  showSevadarName = false,
  showForTrackOrder = false,
}) => {
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

  const timerValue = useMemo(() => {
    const d1 = dayjs(order.order_at);
    const d2 = dayjs(order.delivered_at);
    return d2.diff(d1, "d") + 1;
  }, [order]);
  return (
    <div className="w-full flex overflow-hidden flex-col  bg-white border border-gray-400 drop-shadow-lg rounded-lg mb-4">
      <div className="flex">
        <div className="flex-1 min-h-[130px] p-2 text-sm text-gray-600">
          <div className="flex items-center">
            Order Type :
            <div
              className={cn(
                "w-3.5 h-3.5 rounded-full mx-1",
                order.emergency ? "bg-red-500" : "bg-green-500"
              )}
            ></div>
            {showForTrackOrder && order?.emergency1 && (
              <div className={"w-3.5 h-3.5 rounded-full mr-1 bg-red-500"}></div>
            )}
            <div>{order.emergency ? "Emergency" : "Regular"}</div>
          </div>
          <p>Sr No : {order.id}</p>
          <p>Complain count : {order.complain_count}</p>
          <p>Name : {order.name}</p>
          <p>Address : {order.message}</p>
          <p>Mobile no : {order.mobile_no}</p>
          {order.book_lang && (
            <p>
              Book Name : {order.book_name} {order.book_lang}
            </p>
          )}
        </div>
        <div className={"flex flex-col items-center"}>
          {showTimer && <Timer value={timerValue} bg={"bg-black"} />}
          <a
            href={`tel:${order.mobile_no}`}
            className={"w-12 flex items-center rounded-lg justify-center h-12"}
          >
            <FiPhoneCall className="text-black text-2xl" />
          </a>
          <a
            href={`https://wa.me/91${
              order.mobile_no?.substring(order.mobile_no.length - 10) || ""
            }`}
            target="_blank"
            rel="noopener noreferrer"
            className={"w-12 flex items-center rounded-lg justify-center h-12 "}
            onClick={(e) => {
              if (!order.mobile_no || order.mobile_no.length < 10) {
                e.preventDefault();
              }
            }}
          >
            <IoLogoWhatsapp className="text-green-600 text-3xl" />
          </a>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-0.5 text-center bg-gray-100 text-white text-[11px]">
        <p className="bg-gray-400 p-0.5 gap-1">
          <span>Book Ordered On : </span>
          <span>{dayjs(order.order_at).format("DD/MM/YYYY")}</span>
        </p>
        {order.order_allotted_at && (
          <p className="bg-gray-400 p-0.5 gap-1">
            <span>Allot for Delivery: </span>
            <span>{dayjs(order.order_allotted_at).format("DD/MM/YYYY")}</span>
          </p>
        )}
        {order.delivered_at && showForTrackOrder && (
          <p className="bg-gray-400 p-0.5 gap-1 col-span-2">
            <span>Book Delivered On: </span>
            <span>{dayjs(order.delivered_at).format("DD/MM/YYYY")}</span>
          </p>
        )}
        {order.calling_allotted_at && !showForTrackOrder && (
          <p className="bg-gray-400 p-0.5 gap-1">
            <span>Book Calling Allotted: </span>
            <span>{dayjs(order.calling_allotted_at).format("DD/MM/YYYY")}</span>
          </p>
        )}
        {order.calling_response_at && !showForTrackOrder && (
          <p className="bg-gray-400 p-0.5 gap-1 col-span-2">
            <span>Calling Seva Done: </span>
            <span>{dayjs(order.calling_response_at).format("DD/MM/YYYY")}</span>
          </p>
        )}
      </div>

      {/* @ts-ignore */}
      {order?.history?.map((historyItem: any, index: number) => (
        <p
          key={`historyIndex_${index}`}
          className="text-xs block bg-gray-500 text-gray-100 text-center p-0.5"
        >
          Complain Raise on:{" "}
          {dayjs(historyItem.created_at)
            .utc(true)
            .add(5, "hour")
            .add(30, "minute")
            .format("DD/MM/YYYY")}{" "}
          by {historyItem.created_by_user}
        </p>
      ))}
      {!showForTrackOrder && (
        <div className="overflow-hidden rounded-b-lg">
          <div
            className={`w-full text-center font-medium p-2 capitalize ${
              order.response_by_name ? textColor() : "text-gray-500"
            }`}
          >
            {showSevadarName && <p>Sevadar - "{order.response_by_name}"</p>}
            <p>
              {/* {order.book_order_status.replace("_", " ")} */}
              {order.book_order_status == BOOK_ORDER_STATUS.WRONG_ORDER ? (
                <span className="text-sm">
                  ({order.reason.replace("_", " ")})
                </span>
              ) : (
                ""
              )}
              - {dayjs(order.delivered_at).format("DD/MM/YYYY")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCompleteCard;
