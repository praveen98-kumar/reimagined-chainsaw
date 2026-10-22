import { RuchiCall } from "@/shared/interfaces/calling";
import dayjs from "dayjs";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CardDateStatus,
  CardGridContainer,
  CardHistory,
  CardIcons,
  CardMessage,
  CardWrapper,
} from "./CommonCard";

interface RuchiCallingCompletedCardProp {
  call: RuchiCall & { [k: string]: any };
  type?: number;
}

const getTextColor = (type: string) => {
  switch (type) {
    case "will_confirm_later":
    case "confirm_later":
      return `text-yellow-500`;
    case "issue_with_rule":
      return `text-indigo-500`;
    case "come_in_satsang":
      return `text-gray-500`;
    case "interested":
      return `text-green-500`;
    case "not_interested":
      return `text-red-500`;
    case "got_initiation":
      return `text-blue-500`;
    case "out_of_reach":
      return `text-orange-500`;
    default:
      return "text-orange-500";
  }
};

const RuchiCallingCompletedCard: React.FC<RuchiCallingCompletedCardProp> = ({
  call,
  type,
}) => {
  const { t: ts } = useTranslation("status");
  const { t: tc } = useTranslation("common");
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const getStatusColor = (status: string = call.status) => {
    switch (status) {
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
  return (
    <CardWrapper className="w-[98%]">
      <CardMessage
        className={"pr-12"}
        message={{
          sr_no: call.order_id,
          name: call.name,
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
        <CardDateStatus
          title={ts("ruchi_calling_allotted")}
          date={call.jyada_ruchi_allotted_at as string}
        />
      </CardGridContainer>
      {call?.history.length > 2 && <CardHistory history={call?.history} />}

      <div className=" overflow-hidden text-center p-2 flex flex-col -space-y-3">
        <p className={`w-full capitalize ${getStatusColor(call.status)}`}>
          <span>
            {call.status == "interested"
              ? ts("Interested For Namdan")
              : ts(call?.status)}{" "}
            -
          </span>{" "}
          <span>{dayjs(call.response_at).format("DD/MM/YYYY")}</span>
        </p>
        {type == 1 && (
          <p className={"pt-1"}>
            {ts("completed_by", { name: call.response_by })}
          </p>
        )}
      </div>
    </CardWrapper>
  );
};

export default RuchiCallingCompletedCard;
