import React, { useMemo, useState } from "react";
import { FaQuestionCircle } from "react-icons/fa";
import { OrderIn } from "@/shared/interfaces/order-in-card";
import Modal from "@/components/modal/Modal";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { filterOrders } from "@/redux/features/orderSlice";
import apiClient from "@/http/index";
import dayjs from "dayjs";
import Timer from "@/components/Timer";
import { useTranslation } from "react-i18next";
import {
  CardDateStatus,
  CardGridContainer,
  CardIcons,
  CardMessage,
  CardWrapper,
} from "@/components/card/CommonCard";
import CardButton from "./CardButton";
import { useCount } from "@/hooks/useCount";
import { BOOK_ORDER_STATUS } from "@/shared/interfaces/app";

interface OrderInCardProps {
  order: OrderIn;
  ableToAcceptOrder?: boolean;
  firstOrderDate?: string;
}

const OrderInCard: React.FC<OrderInCardProps> = ({
  order,
  ableToAcceptOrder = true,
  firstOrderDate = "",
}) => {
  const dispatch = useAppDispatch();
  const { active_permission, active_region_index } = useAppSelector(
    (state) => state.auth
  );
  const activeTehsilId =
    active_permission?.region[active_region_index]?.tehsil_id;
  const { update } = useCount();
  const [show, setShow] = useState<boolean>(false);

  const closeModal = () => {
    setShow(false);
  };
  const onConfirm = async () => {
    try {
      if (!ableToAcceptOrder) {
        toast.error("Please complete your pending seva to accept more order.");
        setShow(false);
        return;
      }
      const data = {
        order_id: order.id,
        // state_id: 8,
        // district_id: 87,
        // tehsil_id: 500,
        response_type: BOOK_ORDER_STATUS.ACCEPTED,
      };
      const response = await apiClient.post("order_response", data);
      toast.success(response.data?.message);
      dispatch(filterOrders({ id: order.id, type: "ordersIn" }));
      update("bookDeliveryCounts", "tehsil_id", {
        role: active_permission?.role,
        tehsil_id: activeTehsilId,
        counts: {
          pending_out: 1,
          pending_in: -1,
          ...(!firstOrderDate && {
            first_accepted_order_date: dayjs().toISOString(),
          }),
        },
      });
      setShow(false);
    } catch (e: any) {
      toast.error(e?.response.data.error);
    }
  };
  const { t: ts } = useTranslation("status");
  const { t: tc } = useTranslation("common");
  const { t: tq } = useTranslation("question");

  let remainingDay = 15 - dayjs(new Date()).diff(order.order_at, "d");
  let borderColor = useMemo(() => {
    return remainingDay < 0
      ? "border-red-900"
      : remainingDay <= 5
      ? "border-red-500"
      : remainingDay <= 10
      ? "border-yellow-500"
      : "border-green-600";
  }, [remainingDay]);
  return (
    <>
      <CardWrapper
        className={`w-[98%] min-h-[150px] border-4 drop-shadow-xl rounded-tr-none ring-0 ${borderColor}`}
      >
        <CardMessage
          className="pr-12"
          message={{
            order_type: order.emergency ? "Emergency" : "Regular",
            sr_no: order.id,
            ...(order.name && { name: order.name }),
            ...(order?.new_address && { new_address: order.new_address }),
            address: order.message,
            mobile_no: order.mobile_no,
            ...(order?.alt_mobile_no && { alt_mobile_no: order.alt_mobile_no }),
            ...(order?.new_mobile_no && { new_mobile_no: order.new_mobile_no }),
            book_name: order.book_name + " " + order.book_lang,
          }}
        />
        <CardIcons
          mobile_no={order.mobile_no}
          alt_mobile_no={order?.alt_mobile_no?.toString()}
          showTimer
          timer={<Timer value={remainingDay} />}
        />
        <CardGridContainer className="gap-0.5">
          <CardDateStatus title={ts("book_ordered_on")} date={order.order_at} />
        </CardGridContainer>
        <CardGridContainer className={ableToAcceptOrder ? "" : "hidden"}>
          <CardButton
            label={tc("accept")}
            onClick={() => setShow(true)}
            className={"bg-green-700 text-white font-semibold text-lg"}
          />
        </CardGridContainer>
      </CardWrapper>
      <Modal show={show} onClose={closeModal} onConfirm={onConfirm}>
        <div className="space-y-8 mb-8 text-center">
          <FaQuestionCircle className=" mx-auto w-20 h-20 text-primary" />
          <p className="font-normal text-xl">
            {tq("accept", { sr_no: order.id })}
          </p>
        </div>
      </Modal>
    </>
  );
};

export const RecordInCard: React.FC<OrderInCardProps> = ({ order }) => {
  const { t: ts } = useTranslation("status");
  let remainingDay = 15 - dayjs(new Date()).diff(order.order_at, "d");

  let borderColor = useMemo(() => {
    return remainingDay < 0
      ? "border-red-900"
      : remainingDay <= 5
      ? "border-red-500"
      : remainingDay <= 10
      ? "border-yellow-500"
      : "border-green-600";
  }, [remainingDay]);
  return (
    <CardWrapper
      className={`w-[98%] min-h-[150px] border-4 drop-shadow-xl rounded-tr-none ring-0 ${borderColor}`}
    >
      <CardMessage
        className="pr-12"
        message={{
          order_type: order.emergency ? "Emergency" : "Regular",
          sr_no: order.id,
          ...(order.name && { name: order.name }),
          ...(order?.new_address && { new_address: order.new_address }),
          address: order.message,
          mobile_no: order.mobile_no,
          ...(order?.alt_mobile_no && { alt_mobile_no: order.alt_mobile_no }),
          ...(order?.new_mobile_no && { new_mobile_no: order.new_mobile_no }),
          book_name: order.book_name + " " + order.book_lang,
        }}
      />
      <CardIcons
        mobile_no={order.mobile_no}
        alt_mobile_no={order?.alt_mobile_no?.toString()}
        showTimer
        timer={<Timer value={remainingDay} />}
      />
      <CardGridContainer className="gap-0.5">
        <CardDateStatus title={ts("book_ordered_on")} date={order.order_at} />
      </CardGridContainer>
    </CardWrapper>
  );
};

export default OrderInCard;
