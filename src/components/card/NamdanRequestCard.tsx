import Modal from "@/components/modal/Modal";
import apiClient from "@/http/index";
import { filterCalls } from "@/redux/features/callingSlice";
import { updateCounts } from "@/redux/features/countSlice";
import { useAppDispatch } from "@/redux/store";
import { isValidUser } from "@/shared/functions/utils";
import { RuchiCall } from "@/shared/interfaces/calling";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FaQuestionCircle } from "react-icons/fa";
import {
  CardDateStatus,
  CardGridContainer,
  CardMessage,
  CardWrapper,
} from "./CommonCard";

interface CallingRequestCardProps {
  call: RuchiCall & { [k: string]: any };
  type?: number;
}

const CallingRequestCard: React.FC<CallingRequestCardProps> = ({
  call,
  type,
}) => {
  const { t: tc } = useTranslation("common");
  const { t: ts } = useTranslation("status");
  const { t: tq } = useTranslation("question");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const onConfirm = async () => {
    try {
      setLoading(true);
      const response = await apiClient.post("jyada_ruchi_response", {
        jyada_ruchi_id: call.id,
        response_type: "accept",
      });
      dispatch(filterCalls({ type: "ruchiIn", id: call.id }));
      dispatch(
        updateCounts({
          type: "namdanCallCounts",
          values: [{ key: "pending_order" }],
        })
      );
      setLoading(false);
      closeModal();
      toast.success(response.data?.message);
    } catch (e: any) {
      setLoading(false);
      toast.error(e?.response.data.error);
    }
  };

  const closeModal = () => setShow(false);

  return (
    <>
      <CardWrapper className="w-[98%]">
        <CardMessage
          className="pr-12"
          message={{
            sr_no: call.order_id,
            name: call.name,
            address: call.message,
            mobile_no: call.mobile_no,
            ...(call?.new_mobile_no && { new_mobile_no: call.new_mobile_no }),
            book_name: call.book_name + " " + call.book_lang,
          }}
        />
        <CardGridContainer className="gap-0.5">
          <CardDateStatus title={ts("book_ordered_on")} date={call.order_at} />
          <CardDateStatus
            title={ts("allot_for_delivery")}
            date={call.order_allotted_at}
          />
          <CardDateStatus
            title={ts("book_delivered_on")}
            date={call.delivered_at}
          />
          <CardDateStatus
            title={ts("book_calling_allotted")}
            date={call.calling_allotted_at as string}
          />
          <CardDateStatus
            title={ts("book_calling_done")}
            date={call.calling_response_at as string}
          />
        </CardGridContainer>

        {isValidUser("namdan_calling_list") && type == 0 && (
          <button
            className="block w-full bg-green-700 px-2 py-1 text-white font-normal text-lg border border-gray-500 rounded-b-lg border-t-0"
            onClick={() => setShow(true)}
          >
            {tc("accept")}
          </button>
        )}
      </CardWrapper>
      <Modal
        show={show}
        onClose={closeModal}
        onConfirm={onConfirm}
        loading={loading}
      >
        <div className="space-y-8 mb-8 text-center">
          <FaQuestionCircle className=" mx-auto w-20 h-20 text-primary" />
          <p className="font-normal text-xl">
            {tq("accept", { sr_no: call.order_id })}
          </p>
        </div>
      </Modal>
    </>
  );
};

export default CallingRequestCard;
