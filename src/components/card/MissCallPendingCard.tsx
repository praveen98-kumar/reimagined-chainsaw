import Modal from "@/components/modal/Modal";
import apiClient from "@/http/index";
import {
  filterCalls,
  prepandCall,
  updateCalls,
} from "@/redux/features/callingSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { MissCall } from "@/shared/interfaces/calling";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaQuestionCircle } from "react-icons/fa";
import CardButton from "./CardButton";
import {
  CardDateStatus,
  CardGridContainer,
  CardIcons,
  CardMessage,
  CardWrapper,
} from "./CommonCard";
import { useCount } from "@/hooks/useCount";
import toast from "react-hot-toast";
import { MISSCALL_CALLING_STATUS } from "@/shared/interfaces/app";
interface MissCallPendingCardProps {
  call: MissCall & { [k: string]: any };
  type?: number;
}

type StatusType = keyof Pick<
  typeof MISSCALL_CALLING_STATUS,
  | "NOT_INTERESTED"
  | "OUT_OF_REACH"
  | "DUPLICATE"
  | "GOT_INITIATION"
  | "WANT_BOOK"
  | "INTERESTED"
>;

const MissCallPendingCard: React.FC<MissCallPendingCardProps> = ({
  call,
  type = 0,
}) => {
  const { t: ts } = useTranslation("status");
  const { t: tq } = useTranslation("question");

  let [callObj, setCallObj] = useState<MissCall & { [k: string]: any }>({
    ...call,
  });
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { active_permission, active_region_index } = useAppSelector(
    (state) => state.auth
  );
  const activeCountryId =
    active_permission?.region[active_region_index]?.country_id;
  const [show, setShow] = useState<StatusType | "">("");
  const { update } = useCount();
  const handleConfirm = async (status: StatusType, values?: object) => {
    if (status == "WANT_BOOK" || status == "INTERESTED") {
      handleClick(status);
    } else {
      try {
        const payload = {
          miss_call_id: call.id,
          response_type: status,
          ...(values && values),
        };
        const { data } = await apiClient.post("miss_call_response", payload);
        toast.success(data?.message);
        if (!["OUT_OF_REACH"].includes(status)) {
          dispatch(filterCalls({ id: call.id, type: "missPendingCalls" }));
          dispatch(
            prepandCall({
              data: { ...call, status_int: MISSCALL_CALLING_STATUS[status] },
              key: "missCompleteCalls",
            })
          );
          update("missCallCounts", "country_id", {
            role: active_permission?.role,
            country_id: activeCountryId,
            counts: {
              pending_order: -1,
              ctm: 1,
              ctd: 1,
            },
          });
        } else {
          setCallObj({ ...callObj, status: status });
        }
        updateCalls({
          type: "missPendingCalls",
          id: callObj.id,
          data: {
            status_int: MISSCALL_CALLING_STATUS[status],
          },
        });
        setShow("");
      } catch (e: any) {
        console.error(e);
      }
    }
  };
  const handleClick = (type: string) => {
    localStorage.setItem(
      "orderDetail",
      JSON.stringify({ order_id: call.id, mobile_no: call.mobile_no })
    );
    router.push(
      `/seva/order/order-form?type=${type}&seva_type=miss_call_response`
    );
  };

  return (
    <>
      <CardWrapper className="w-[98%]">
        <CardMessage
          className="pr-12 h-28"
          message={{ sr_no: call.id, mobile_no: call.mobile_no }}
        />
        <CardIcons mobile_no={call.mobile_no} />
        <CardGridContainer className="gap-0.5">
          <CardDateStatus
            title={ts("miss_call_received_on")}
            date={call.created_at}
          />
          <CardDateStatus
            title={ts("book_calling_allotted")}
            date={call.allocation_date}
          />
        </CardGridContainer>
        {type == 0 ? (
          <CardGridContainer>
            <CardButton
              onClick={() => setShow("WANT_BOOK")}
              label={ts("want_book")}
              className="text-green-600 transition active:border-transparent duration-300 active:bg-green-600 active:text-white active:shadow-lg font-bold border border-gray-400"
            />
            <CardButton
              onClick={() => setShow("INTERESTED")}
              label={ts("interested_naamdan")}
              className="text-green-600 transition active:border-transparent duration-300 active:bg-green-600 active:text-white active:shadow-lg font-bold border-l border border-gray-400 "
            />
            <CardButton
              onClick={() => setShow("DUPLICATE")}
              label={ts("duplicate")}
              className="text-yellow-500 transition active:border-transparent duration-300 active:bg-yellow-500 active:text-white active:shadow-lg font-bold border border-gray-400"
            />
            <CardButton
              onClick={() => setShow("GOT_INITIATION")}
              label={ts("got_initiation")}
              className="text-blue-500  transition active:border-transparent duration-300 active:bg-blue-500 active:text-white active:shadow-lg font-bold border border-gray-400 "
            />
            <CardButton
              onClick={() => setShow("NOT_INTERESTED")}
              label={ts("not_interested")}
              className="text-red-500 transition active:border-transparent duration-300 active:bg-red-500 active:text-white active:shadow-lg font-bold  border border-gray-400"
            />
            <CardButton
              onClick={() => {
                if (call.status_int !== 3) setShow("OUT_OF_REACH");
              }}
              label={ts("out_of_reach")}
              className={`${
                show == "OUT_OF_REACH" ||
                call.status_int == 3 ||
                callObj?.status_int == 3
                  ? "text-white bg-orange-500"
                  : "text-orange-500"
              }  active:border-transparent transition duration-300 active:bg-orange-500 active:text-white active:shadow-lg font-bold border border-gray-400`}
            />
          </CardGridContainer>
        ) : type == 1 ? (
          <p className="p-3 flex justify-center text-center text-white bg-primary gap-0.5 font-semibold flex-1 text-sm rounded-b-lg ">
            {ts("allotted_to", { name: call.allocated_to.name })}
          </p>
        ) : null}
      </CardWrapper>
      {show !== "" ? (
        <Modal
          show={
            show == "DUPLICATE" ||
            show === "GOT_INITIATION" ||
            show === "INTERESTED" ||
            show === "NOT_INTERESTED" ||
            show === "OUT_OF_REACH" ||
            show === "WANT_BOOK"
          }
          onClose={() => setShow("")}
          onConfirm={() => handleConfirm(show)}
        >
          <div className="space-y-8 mb-8">
            <FaQuestionCircle className=" mx-auto w-20 h-20 text-primary" />
            <p className="font-normal text-xl text-center">
              {tq(show.toLowerCase(), { sr_no: call.id })}
            </p>
          </div>
        </Modal>
      ) : null}
    </>
  );
};

export default MissCallPendingCard;
