import DifferentModal from "@/components/modal/DifferentModal";
import Modal from "@/components/modal/Modal";
import ReasonModal from "@/components/modal/ReasonModal";
import Timer from "@/components/Timer";
import apiClient from "@/http/index";
import {
  filterCalls,
  prepandCall,
  updateCalls,
} from "@/redux/features/callingSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { Call } from "@/shared/interfaces/calling";
import dayjs from "dayjs";
import { useCount } from "@/hooks/useCount";
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FaQuestionCircle } from "react-icons/fa";
import { mobileIssueList } from "../../constants/reason";
import CardButton from "./CardButton";
import {
  CardDateStatus,
  CardGridContainer,
  CardIcons,
  CardMessage,
  CardWrapper,
} from "./CommonCard";
import { RatingModal } from "@/components/modal/RatingModal";
import { BOOK_ORDER_STATUS } from "@/shared/interfaces/app";
import ReviewModal from "@/components/modal/ReviewModal";

interface CallingPendingCardProp {
  call: Call & { [k: string]: any };
  onSuccess?: (id: number) => void;
  type?: 0 | 1;
  onEditClick?: () => void;
}

export const NotRecievePendingCard: React.FC<CallingPendingCardProp> = ({
  call: order,
  onSuccess,
  type = 0,
}) => {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation("status");
  const { t: tq } = useTranslation("question");
  const [show, setShow] = useState<
    "accept" | "reject" | "deliver" | "wrong_order" | ""
  >("");
  const { active_permission, active_region_index } = useAppSelector(
    (state) => state.auth
  );
  const closeModal = () => setShow("");

  const locationValues = {
    state_id: order.state_id ?? 0,
    district_id: order.district_id ?? 0,
    tehsil_id: order.tehsil_id ?? 0,
    pincode: order.pincode ?? "",
  };
  const handleConfirm = async (status: string, values?: object) => {
    try {
      setLoading(true);
      setShow("");
      let data: any = {
        order_id: order.id,
        response_type:
          active_permission?.region[active_region_index]?.state_id == 27
            ? status == "reject"
              ? BOOK_ORDER_STATUS.DISTRICT_ACCEPT
              : BOOK_ORDER_STATUS.DISTRICT_REJECT
            : show == "deliver"
            ? BOOK_ORDER_STATUS.DELIVERED
            : show == "wrong_order"
            ? BOOK_ORDER_STATUS.WRONG_ORDER
            : show,
        ...(show == "wrong_order" && { reason: "wrong_number" }),
        ...(values && values),
      };
      const response = await apiClient.post("order_response", data);
      toast.success(response.data?.message);
      onSuccess?.(order.id);
      closeModal();
    } catch (e: any) {
      toast.error(e?.response.data.error);
    } finally {
      setLoading(false);
    }
  };
  const diffDay = dayjs(new Date()).diff(order.calling_allotted_at, "d");
  let remainingDay = 15 - diffDay;
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
          className={"pr-12 h-full"}
          message={{
            sr_no: order.id,
            ...(order?.new_address && { new_address: order.new_address }),
            ...(order?.name && { name: order.name }),
            address: order.message,
            mobile_no: order.mobile_no,
            ...(order?.alt_mobile_no && { alt_mobile_no: order.alt_mobile_no }),
            ...(order?.new_mobile_no && { new_mobile_no: order.new_mobile_no }),
            book_name: order.book_name + " " + order.book_lang,
          }}
        />
        <CardIcons
          mobile_no={order.mobile_no}
          alt_mobile_no={order?.alt_mobile_no}
          showTimer
          showShareIcons={true}
          message={order.message}
          timer={<Timer value={remainingDay} totalValue={15} />}
        />
        <div className="block py-1 bg-black text-white text-sm text-center">
          {`Book Delivery Sevadar: ${order?.response_by_name}`}
          <a href={`tel:${order?.response_by_mobile_no}`}>
            {order?.response_by_mobile_no?.toString()?.slice(-10)}
          </a>
        </div>
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
        {type == 0 ? (
          <CardGridContainer>
            <CardButton
              disabled={loading}
              onClick={() =>
                setShow(
                  active_permission?.region[active_region_index]?.state_id == 27
                    ? "accept"
                    : "deliver"
                )
              }
              label={
                active_permission?.region[active_region_index]?.state_id == 27
                  ? t("book_received")
                  : t("delivered")
              }
              className="text-green-500 transition active:border-transparent duration-300 active:bg-green-500 active:text-white active:shadow-lg font-bold rounded border border-gray-400"
            />
            <CardButton
              disabled={loading}
              onClick={() =>
                setShow(
                  active_permission?.region[active_region_index]?.state_id == 27
                    ? "reject"
                    : "wrong_order"
                )
              }
              label={
                active_permission?.region[active_region_index]?.state_id == 27
                  ? t("book_not_received")
                  : t("wrong_order")
              }
              className="text-red-500 transition active:border-transparent duration-300 active:bg-red-500 active:text-white active:shadow-lg font-bold  border border-gray-400"
            />
          </CardGridContainer>
        ) : (
          <p className="p-3 flex justify-center text-center text-white bg-primary font-semibold">
            {t("allotted_to", {
              name: order.order_allocated_to ?? order.allocated_to_name,
            })}
          </p>
        )}
      </CardWrapper>
      <Modal
        show={["deliver", "wrong_order"].includes(show)} //accept
        onConfirm={() => handleConfirm(show)}
        onClose={() => setShow("")}
      >
        <div className="space-y-8 mb-8">
          <FaQuestionCircle className=" mx-auto w-20 h-20 text-primary" />
          <p className="font-normal text-xl text-center">
            {tq(show == "deliver" ? "delivered" : show, { sr_no: order.id })}
          </p>
        </div>
      </Modal>
      <ReviewModal
        show={show === "accept"}
        onConfirm={(values) => handleConfirm(show, values)}
        onClose={() => setShow("")}
        title={tq("reject_book_calling", { sr_no: order.id })}
        required={false}
      />
      <DifferentModal
        show={show === "reject"}
        onConfirm={(values) => handleConfirm(show, values)}
        onClose={closeModal}
        order_id={order.id}
        initialValues={locationValues}
        showTehils
        reason={show}
      />
    </>
  );
};

const CallingPendingCard: React.FC<CallingPendingCardProp> = ({
  call,
  onEditClick,
}) => {
  let [callObj, setCallObj] = useState<Call>({ ...call });
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation("status");
  const { t: tq } = useTranslation("question");
  const { t: tc } = useTranslation("common");
  const dispatch = useAppDispatch();
  const { active_permission, active_region_index } = useAppSelector(
    (state) => state.auth
  );
  const { update } = useCount();

  const activeDistrictId =
    active_permission?.region[active_region_index]?.district_id;
  const [show, setShow] = useState<
    | "out_of_reach"
    | "jyada_ruchi"
    | "got_initiation"
    | "not_interested"
    | "book_not_receive"
    | "duplicate"
    | "ok"
    | "mobile_no_issue"
    | "not_on_wa"
    | "satgyan_link_sent"
    | "complete"
    | ""
  >("");
  const locationValues = {
    country_id: callObj.country_id ?? 0,
    state_id: callObj.state_id ?? 0,
    district_id: callObj.district_id ?? 0,
    tehsil_id: callObj.tehsil_id ?? 0,
    pincode: callObj.pincode ?? "",
  };

  const closeModal = () => setShow("");

  const handleConfirm = async (status: string, values?: object) => {
    setLoading(true);
    try {
      setShow("");
      let data: any = {
        calling_id: callObj.id,
        response_type: status,
        ...(values && values),
      };
      if (status === "satgyan_link_sent" || status === "not_on_wa") {
        data["status"] = status;
      }
      const response = await apiClient.post("calling_response", data);
      toast.success(response.data?.message);
      if (!["out_of_reach", "jyada_ruchi", "ok"].includes(status)) {
        dispatch(filterCalls({ type: "bookPendingCalls", id: callObj.id }));
        dispatch(
          prepandCall({
            key: "bookCompleteCalls",
            data: { ...callObj, status },
          })
        );
      } else {
        setCallObj({ ...callObj, status: status });
        dispatch(
          updateCalls({
            type: "bookPendingCalls",
            id: callObj.id,
            data: {
              calling_seva_status: status,
            },
          })
        );
      }

      if (!["out_of_reach", "jyada_ruchi", "ok"].includes(status)) {
        update("bookCallingCounts", "district_id", {
          role: active_permission?.role,
          district_id: activeDistrictId,
          counts: {
            ctm: 1,
            ctd: 1,
            pending_order: -1,
          },
        });
      }

      if (status != "ok") {
        closeModal();
      } else {
        setShow("complete");
      }
    } catch (e: any) {
      toast.error(e?.response.data.error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <CardWrapper className="w-[98%] select-none">
        <CardMessage
          onEditClick={onEditClick}
          showEditClick
          className={"pr-12"}
          message={{
            sr_no: call.order_id,
            ...(call?.name && { name: call.name }),
            address: call.message,
            mobile_no: call.mobile_no,
            ...(call?.alt_mobile_no && { alt_mobile_no: call.alt_mobile_no }),
            ...(call?.new_mobile_no && { new_mobile_no: call.new_mobile_no }),
            ...(call.book_name && {
              book_name: call.book_name + " " + call.book_lang,
            }),
          }}
          new_mobile_no={call.new_mobile_no}
        />
        <CardIcons
          mobile_no={call.mobile_no}
          alt_mobile_no={call?.alt_mobile_no}
        />
        <CardGridContainer className="gap-0.5">
          <CardDateStatus title={t("book_ordered_on")} date={call.order_at} />
          <CardDateStatus
            title={t("allot_for_delivery")}
            date={call.order_allotted_at}
          />
          <CardDateStatus
            title={t("book_delivered_on")}
            date={call.delivered_at}
          />
          <CardDateStatus
            title={t("book_calling_allotted")}
            date={call.calling_allotted_at as string}
          />
        </CardGridContainer>
        <CardGridContainer>
          {callObj.status == "jyada_ruchi" ||
          show == "complete" ||
          callObj.status == "ok" ||
          callObj.calling_seva_status == "jyada_ruchi" ||
          callObj.calling_seva_status == "ok" ? (
            <>
              <CardButton
                disabled={loading}
                onClick={() => setShow("satgyan_link_sent")}
                label={t("satgyan_link_sent")}
                className="text-green-600 transition active:border-transparent duration-300 active:bg-green-600 active:text-white active:shadow-lg font-bold border-r border-t border-gray-400"
              />
              <CardButton
                disabled={loading}
                onClick={() => setShow("not_on_wa")}
                label={t("not_on_wa")}
                className="text-red-500 transition active:border-transparent duration-300 active:bg-red-500 active:text-white active:shadow-lg font-bold border-l border-t border-gray-400"
              />
            </>
          ) : (
            <>
              <CardButton
                disabled={loading}
                onClick={() => {
                  setShow("out_of_reach");
                }}
                label={t("out_of_reach")}
                className={`${
                  show == "out_of_reach" ||
                  callObj.calling_seva_status == "out_of_reach" ||
                  callObj.status == "out_of_reach"
                    ? "text-white bg-yellow-500"
                    : "text-yellow-500"
                }   active:border-transparent transition duration-300 active:bg-yellow-500 active:text-white active:shadow-lg font-bold border border-gray-400`}
              />
              <CardButton
                disabled={loading}
                onClick={() => setShow("mobile_no_issue")}
                label={t("mobile_no_issue")}
                className="text-pink-500 active:border-transparent transition duration-300 active:bg-pink-500 active:text-white active:shadow-lg font-bold border border-gray-400"
              />
              <CardButton
                disabled={loading}
                onClick={() => setShow("book_not_receive")}
                label={t("book_not_receive")}
                className="text-gray-500 transition active:border-transparent duration-300 active:bg-gray-500 active:text-white active:shadow-lg font-bold border border-gray-400 "
              />
              <CardButton
                disabled={loading}
                onClick={() => setShow("jyada_ruchi")}
                label={t("jyada_ruchi")}
                className="text-green-600 transition active:border-transparent duration-300 active:bg-green-600 active:text-white active:shadow-lg font-bold border border-gray-400"
              />
              <CardButton
                disabled={loading}
                onClick={() => setShow("duplicate")}
                label={t("duplicate")}
                className="text-yellow-500 transition active:border-transparent duration-300 active:bg-yellow-500 active:text-white active:shadow-lg font-bold border border-gray-400"
              />
              <CardButton
                disabled={loading}
                onClick={() => setShow("got_initiation")}
                label={t("got_initiation")}
                className="text-blue-500 transition active:border-transparent duration-300 active:bg-blue-500 active:text-white active:shadow-lg font-bold border border-gray-400 "
              />
              <CardButton
                disabled={loading}
                onClick={() => setShow("not_interested")}
                label={t("not_interested")}
                className="text-red-500 transition active:border-transparent duration-300 active:bg-red-500 active:text-white active:shadow-lg font-bold  border border-gray-400"
              />
              <CardButton
                disabled={loading}
                onClick={() => setShow("ok")}
                label={t("ok")}
                className="text-orange-500 transition active:border-transparent duration-300 active:bg-orange-500 active:text-white active:shadow-lg font-bold rounded border border-gray-400"
              />
            </>
          )}
        </CardGridContainer>
      </CardWrapper>
      <Modal
        show={
          show === "not_interested" ||
          show === "satgyan_link_sent" ||
          show === "not_on_wa" ||
          show === "got_initiation" ||
          show === "out_of_reach" ||
          show === "duplicate" ||
          show === "ok"
        }
        disableClosing={loading}
        loading={loading}
        onConfirm={() => handleConfirm(show)}
        onClose={() => setShow("")}
      >
        <div className="space-y-8 mb-8">
          <FaQuestionCircle className=" mx-auto w-20 h-20 text-primary" />
          <p className="font-normal text-xl text-center">
            {tq(show, { sr_no: callObj.order_id })}
          </p>
        </div>
      </Modal>
      <DifferentModal
        show={show === "jyada_ruchi" || show === "book_not_receive"}
        onConfirm={(values) => handleConfirm(show, values)}
        onClose={closeModal}
        order_id={callObj.order_id}
        initialValues={locationValues}
        showTehils={show === "jyada_ruchi"}
        reason={show}
      />
      <RatingModal
        show={show === "ok"}
        onClose={closeModal}
        onConfirm={(values) => handleConfirm("ok", values)}
        title={"Rate your experience"}
      />
      <ReasonModal
        title={tq("other_issue", { sr_no: call.order_id })}
        show={show === "mobile_no_issue"}
        onClose={closeModal}
        options={mobileIssueList.map(({ label, value }) => ({
          value,
          label: tc(label),
        }))}
        onConfirm={(values) => handleConfirm("mobile_no_issue", values)}
      />
    </>
  );
};

export default CallingPendingCard;
