import Timer from "@/components/Timer";
import DeliveredModal from "@/components/modal/DeliveredModal";
import DifferentModal from "@/components/modal/DifferentModal";
import DuplicateModal from "@/components/modal/DuplicateModal";
import ReasonModal from "@/components/modal/ReasonModal";
import { useAppSelector } from "@/redux/store";
import { getHN_Reason } from "@/shared/functions/utils";
import { OrderIn } from "@/shared/interfaces/order-in-card";
import dayjs from "dayjs";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaQuestionCircle } from "react-icons/fa";
import { wrongOrderReason } from "../../constants/reason";
import CardButton from "./CardButton";
import {
  CardDateStatus,
  CardGridContainer,
  CardIcons,
  CardMessage,
  CardWrapper,
} from "./CommonCard";
import Modal from "@/components/modal/Modal";
import { BOOK_ORDER_STATUS } from "@/shared/interfaces/app";

interface OrderInCardProps {
  order: OrderIn;
  onConfirm?: (e: any) => void;
  timerValue?: number;
  emergency: boolean;
  regularIn?: boolean;
  nonAndroid?: boolean;
}
type WrongLocationStatus = keyof Pick<
  typeof BOOK_ORDER_STATUS,
  "DIFFERENT_AREA"
>;

export const WrongLocationCard: React.FC<OrderInCardProps> = ({
  order,
  timerValue = 15,
  onConfirm,
  emergency,
  regularIn = true,
  nonAndroid = false,
}) => {
  const [show, setShow] = useState<WrongLocationStatus | "">("");
  const { active_permission } = useAppSelector((state) => state.auth);
  const closeModal = () => {
    setShow("");
  };

  const { t: ts } = useTranslation("status");

  const handleConfirm = async (status: WrongLocationStatus, values?: any) => {
    const data = {
      ...(values && values),
      order_id: order.id,
      response_type: BOOK_ORDER_STATUS[status],
      emergency: emergency ? "1" : "0",
    };
    closeModal();
    onConfirm ? onConfirm({ data, status }) : {};
  };
  const diffDay = dayjs(new Date()).diff(
    regularIn ? order.order_at : order.delivered_at,
    "d"
  );
  let remainingDay = useMemo(() => {
    if (emergency) {
      return diffDay <= 5
        ? 5 - diffDay
        : diffDay > 5 && diffDay <= 10
        ? 10 - diffDay
        : 15 - diffDay;
    } else {
      return 15 - diffDay;
    }
  }, []);
  let borderColor = useMemo(() => {
    if (emergency) {
      return diffDay < 0
        ? "border-red-900"
        : diffDay <= 5
        ? "border-green-600"
        : diffDay > 5 && diffDay <= 10
        ? "border-yellow-500"
        : "border-red-500";
    } else {
      return remainingDay < 0
        ? "border-red-900"
        : remainingDay <= 5
        ? "border-red-500"
        : remainingDay <= 10
        ? "border-yellow-500"
        : "border-green-600";
    }
  }, [remainingDay]);
  return (
    <>
      <CardWrapper
        className={`w-[98%] min-h-[150px] border-4 drop-shadow-xl rounded-tr-none ring-0 ${borderColor}`}
      >
        <CardMessage
          className="pr-12"
          message={{
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
          timer={
            <Timer
              value={remainingDay}
              totalValue={timerValue}
              bg={emergency ? borderColor.replace("border", "bg") : ""}
            />
          }
        />
        <div className="block py-1 bg-black text-white text-sm text-center">
          {`Book Delivery Sevadar: ${
            order?.response_by_name
          } ${order?.response_by_mobile_no?.toString()?.slice(-10)}`}
        </div>
        <CardGridContainer className="gap-0.5">
          <CardDateStatus title={ts("book_ordered_on")} date={order.order_at} />
          <CardDateStatus
            title={ts("allot_for_delivery")}
            date={order.order_allotted_at}
          />
        </CardGridContainer>

        {active_permission?.role_id === 17 ? (
          <CardGridContainer>
            <CardButton
              onClick={() => setShow("DIFFERENT_AREA")}
              label={ts("update_address")}
              className="text-white transition active:border-transparent duration-300 active:bg-black bg-black active:text-white active:shadow-lg font-bold border border-gray-400"
            />
          </CardGridContainer>
        ) : (
          <p className="p-3 flex justify-center text-center text-white bg-primary font-semibold">
            {ts("accepted_by", {
              name: order.order_allocated_to ?? order.allocated_to_name,
            })}
          </p>
        )}
      </CardWrapper>

      <DifferentModal
        initialValues={{
          state_id: order?.state_id,
          district_id: order?.district_id,
          tehsil_id: order?.tehsil_id,
          pincode: order?.pincode,
        }}
        order_id={order.id}
        show={show === "DIFFERENT_AREA"}
        onClose={closeModal}
        onConfirm={(values) => handleConfirm("DIFFERENT_AREA", values)}
      />
    </>
  );
};

type StatusType = keyof Pick<
  typeof BOOK_ORDER_STATUS,
  "DELIVERED" | "DUPLICATED" | "DIFFERENT_AREA" | "WRONG_ORDER"
>;

const OrderPendingCard: React.FC<OrderInCardProps> = ({
  order,
  timerValue = 15,
  onConfirm,
  emergency,
  regularIn = true,
  nonAndroid = false,
}) => {
  const [show, setShow] = useState<StatusType | "">("");
  const { active_permission } = useAppSelector((state) => state.auth);

  const closeModal = () => {
    setShow("");
  };
  const { t: tc } = useTranslation("common");
  const { t: ts } = useTranslation("status");
  const { t: tq } = useTranslation("question");

  const handleConfirm = async (status: StatusType, values?: any) => {
    const data = {
      ...(values && values),
      order_id: order.id,
      response_type: BOOK_ORDER_STATUS[status],
      emergency: emergency ? "1" : "0",
    };
    onConfirm?.({ data, status });
    closeModal();
  };
  const diffDay = dayjs(new Date()).diff(
    regularIn ? order.order_at : order.order_allotted_at,
    "d"
  );
  let remainingDay = useMemo(() => {
    if (emergency) {
      return diffDay <= 5
        ? 5 - diffDay
        : diffDay > 5 && diffDay <= 10
        ? 10 - diffDay
        : 15 - diffDay;
    } else {
      return 15 - diffDay;
    }
  }, []);
  let borderColor = useMemo(() => {
    if (emergency) {
      return diffDay < 0
        ? "border-red-900"
        : diffDay <= 5
        ? "border-green-600"
        : diffDay > 5 && diffDay <= 10
        ? "border-yellow-500"
        : "border-red-500";
    } else {
      return remainingDay < 0
        ? "border-red-900"
        : remainingDay <= 5
        ? "border-red-500"
        : remainingDay <= 10
        ? "border-yellow-500"
        : "border-green-600";
    }
  }, [remainingDay]);
  return (
    <>
      <CardWrapper
        className={`w-[98%] min-h-[150px] border-4 drop-shadow-xl rounded-tr-none ring-0 ${borderColor}`}
      >
        <CardMessage
          className="pr-12 select-none"
          message={{
            order_type: order.emergency ? "Emergency" : "Regular",
            sr_no: order.id,
            ...(order.name && { name: order.name }),
            ...(order?.new_address && { new_address: order.new_address }),
            address: order.message,
            mobile_no: order.mobile_no,
            ...(order?.alt_mobile_no && { alt_mobile_no: order.alt_mobile_no }),
            ...(order?.new_mobile_no && { new_mobile_no: order.new_mobile_no }),
            ...(order.book_name && {
              book_name: order.book_name + " " + order.book_lang,
            }),
            ...(order.new_address && { new_address: order.new_address }),
          }}
        />
        <CardIcons
          mobile_no={order.mobile_no}
          alt_mobile_no={order?.alt_mobile_no?.toString()}
          showTimer
          timer={
            <Timer
              value={remainingDay}
              totalValue={timerValue}
              bg={emergency ? borderColor.replace("border", "bg") : ""}
            />
          }
        />
        <CardGridContainer className="gap-0.5">
          <CardDateStatus title={ts("book_ordered_on")} date={order.order_at} />
          <CardDateStatus
            title={ts("allot_for_delivery")}
            date={order.order_allotted_at}
          />
        </CardGridContainer>

        {((nonAndroid &&
          active_permission?.role === "district_book_distributor") ||
          !nonAndroid) && (
          <CardGridContainer>
            <CardButton
              onClick={() => setShow("DELIVERED")}
              label={ts("delivered")}
              className="text-green-500 active:border-transparent transition duration-300 active:bg-green-500 active:text-white active:shadow-lg font-bold border border-gray-400"
            />
            <CardButton
              onClick={() => setShow("DUPLICATED")}
              label={ts("duplicate")}
              className="text-yellow-500 transition active:border-transparent duration-300 active:bg-yellow-500 active:text-white active:shadow-lg font-bold border border-gray-400 "
            />
            <CardButton
              onClick={() => setShow("DIFFERENT_AREA")}
              label={ts("other_area")}
              className="text-gray-600 transition active:border-transparent duration-300 active:bg-gray-600 active:text-white active:shadow-lg font-bold border border-gray-400"
            />
            <CardButton
              onClick={() => setShow("WRONG_ORDER")}
              label={ts("fake_order")}
              className="text-red-500 transition active:border-transparent duration-300 active:bg-red-500 active:text-white active:shadow-lg font-bold border border-gray-400"
            />
          </CardGridContainer>
        )}
      </CardWrapper>
      <DeliveredModal
        order={order}
        show={show === "DELIVERED"}
        onClose={closeModal}
        onConfirm={() => handleConfirm("DELIVERED")}
      />
      <DuplicateModal
        order={order}
        show={show === "DUPLICATED"}
        onClose={closeModal}
        onConfirm={() => handleConfirm("DUPLICATED")}
      />
      <Modal
        show={show === "DIFFERENT_AREA"}
        onClose={closeModal}
        onConfirm={() => handleConfirm("DIFFERENT_AREA", {})}
      >
        <div className="space-y-8 mb-8">
          <FaQuestionCircle className=" mx-auto w-20 h-20 text-primary" />
          <h3 className="font-normal text-xl text-center">
            {tq("other_area", { sr_no: order.id })}
          </h3>
        </div>
      </Modal>
      <ReasonModal
        title={tq("wrong_order", { sr_no: order.id })}
        show={show === "WRONG_ORDER"}
        onClose={closeModal}
        options={wrongOrderReason.map((w) => ({ ...w, label: tc(w.label) }))}
        onConfirm={(values) => handleConfirm("WRONG_ORDER", values)}
      />
    </>
  );
};

export const RecordPendingCard = ({
  order,
  showTimer = true,
  timerValue = 15,
}: {
  order: OrderIn;
  showTimer: boolean;
  timerValue?: number;
}) => {
  const { t } = useTranslation("status");
  const remainingDay =
    15 - dayjs(new Date()).diff(order.order_allotted_at, "d");
  const borderColor = useMemo(() => {
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
        className="pr-12 select-none"
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
        timer={<Timer value={remainingDay} totalValue={timerValue} />}
      />
      <CardGridContainer className="gap-0.5">
        <CardDateStatus title={t("book_ordered_on")} date={order.order_at} />
        <CardDateStatus
          title={t("allot_for_delivery")}
          date={order.order_allotted_at}
        />
      </CardGridContainer>
      <p className="p-3 flex justify-center text-center text-white bg-primary font-semibold">
        {t("accepted_by", {
          name: order.order_allocated_to ?? order.allocated_to_name,
        })}{" "}
        <a
          className={"ml-1"}
          href={`tel:91${order?.allocated_to_mobile_no
            ?.toString()
            .substring(
              order?.allocated_to_mobile_no?.toString()?.length - 10
            )}`}
          target="_blank"
        >
          ({order?.allocated_to_mobile_no?.toString().replace("+91", "")})
        </a>
      </p>
    </CardWrapper>
  );
};

export const BookCallingRecordPendingCard = ({ order }: { order: OrderIn }) => {
  const { t } = useTranslation("status");

  return (
    <CardWrapper
      className={`w-[98%] min-h-[150px] border-4 drop-shadow-xl rounded-tr-none ring-0 select-none`}
    >
      <CardMessage
        className="pr-12"
        message={{
          sr_no: order.id,
          ...(order.name && { name: order.name }),
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
      />
      <CardGridContainer className="gap-0.5">
        <CardDateStatus title={t("book_ordered_on")} date={order.order_at} />
        <CardDateStatus
          title={t("allot_for_delivery")}
          date={order.order_allotted_at}
        />
        <CardDateStatus
          title={t("book_delivered_on")}
          date={order.delivered_at}
        />
        <CardDateStatus
          title={t("book_calling_allotted")}
          date={order.calling_allotted_at?.toString()}
        />
      </CardGridContainer>
      <p className="p-3 text-center text-white bg-primary">
        {t("allotted_to", { name: order.order_allocated_to })}
      </p>
    </CardWrapper>
  );
};
export const BookCallingRecordCompleteCard = ({
  order,
}: {
  order: OrderIn;
}) => {
  const { t } = useTranslation("status");
  const getStatusColor = () => {
    switch (order.calling_seva_status) {
      case "book_not_receive":
        return "text-gray-500";
      case "jyada_ruchi":
        return "text-green-600";
      case "not_interested":
        return "text-orange-500";
      case "got_initiation":
        return "text-blue-500";
      case "duplicate":
        return "text-yellow-500";
      case "mobile_no_issue":
        return "text-pink-500";
      default:
        return "text-green-600";
    }
  };
  return (
    <CardWrapper className="w-[98%] select-none">
      <CardMessage
        className="pr-12"
        message={{
          sr_no: order.order_id,
          ...(order.name && { name: order.name }),
          address: order.message,
          mobile_no: order.mobile_no,
          ...(order?.new_mobile_no && { new_mobile_no: order.new_mobile_no }),
          book_name: order.book_name + " " + order.book_lang,
        }}
      />
      <CardIcons mobile_no={order.mobile_no} />
      <CardGridContainer className="gap-0.5">
        <CardDateStatus title={t("book_ordered_on")} date={order.order_at} />
        <CardDateStatus
          title={t("allot_for_delivery")}
          date={order.order_allotted_at}
        />
        <CardDateStatus
          title={t("book_delivered_on")}
          date={order.delivered_at}
        />
        <CardDateStatus
          title={t("book_calling_allotted")}
          date={order.calling_allotted_at as string}
        />
      </CardGridContainer>
      <div>
        <button
          className={`w-full p-2 capitalize ${getStatusColor()} text-[16px] -mt-1`}
        >
          {t(order.calling_seva_status as string)}{" "}
          {(order.calling_seva_status === "ok" ||
            order.calling_seva_status === "jyada_ruchi") &&
            (order.satgyan_link_sent
              ? ` (${t("satgyan_link_sent")})`
              : ` (${t("not_on_wa")})`)}
          {order.reason && `(${getHN_Reason(order.reason)})`}-{" "}
          {dayjs(order.calling_response_at).format("DD/MM/YYYY")}
        </button>
        <div className={"w-full text-center mb-1 -mt-3"}>
          {t("completed_by", { name: order.response_by_name })}
        </div>
      </div>
    </CardWrapper>
  );
};
export default OrderPendingCard;
