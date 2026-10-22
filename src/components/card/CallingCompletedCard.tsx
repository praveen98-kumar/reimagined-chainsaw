import { getHN_Reason } from "@/shared/functions/utils";
import { Call } from "@/shared/interfaces/calling";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  CardDateStatus,
  CardGridContainer,
  CardIcons,
  CardMessage,
  CardWrapper,
} from "./CommonCard";

interface CallingCompleteCardProp {
  call: Call & { [k: string]: any };
}

const CallingCompletedCard: React.FC<CallingCompleteCardProp> = ({ call }) => {
  const { t } = useTranslation("status");
  const getStatusColor = () => {
    switch (call.calling_seva_status) {
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
        className={"pr-12"}
        message={{
          sr_no: call.id,
          ...(call?.name && { name: call.name }),
          address: call.message,
          mobile_no: call.mobile_no,
          ...(call?.alt_mobile_no && { alt_mobile_no: call.alt_mobile_no }),
          ...(call?.new_mobile_no && { new_mobile_no: call.new_mobile_no }),
          book_name: call.book_name + " " + call.book_lang,
        }}
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
      <div className=" overflow-hidden">
        <button className={`w-full p-2 capitalize ${getStatusColor()}`}>
          {/* {(call.calling_seva_status == "book_not_receive"
            ? "पुस्तक नहीं मिली"
            : call.calling_seva_status
          ).replace(/_/g, " ")}{" "} */}
          {call.calling_seva_status == "book_not_receive"
            ? t("book_not_receive")
            : t(call.calling_seva_status)}
          {(call.calling_seva_status === "ok" ||
            call.calling_seva_status === "jyada_ruchi") &&
            (call.satgyan_link_sent
              ? ` (${t("satgyan_link_sent")}) `
              : ` (${t("not_on_wa")}) `)}
          {call.reason && ` (${getHN_Reason(call.reason)}) `}-{" "}
          {dayjs(call.calling_response_at).format("DD/MM/YYYY")}
        </button>
      </div>
    </CardWrapper>
  );
};

export default CallingCompletedCard;
