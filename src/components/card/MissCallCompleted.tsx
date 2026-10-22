import { Call } from "@/shared/interfaces/calling";
import dayjs from "dayjs";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  CardDateStatus,
  CardGridContainer,
  CardIcons,
  CardMessage,
  CardWrapper,
} from "./CommonCard";
import { getMissCallingStatusByValue } from "@/shared/interfaces/app";

interface CallingCompleteCardProp {
  call: Call & { [k: string]: any };
  type?: number;
}

const MissCallCompleted: React.FC<CallingCompleteCardProp> = ({
  call,
  type,
}) => {
  const { t: ts } = useTranslation("status");
  const getStatusColor = () => {
    switch (call.status) {
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
  const statusText = getMissCallingStatusByValue(call?.status_int)
    ?.split("_")
    .join(" ");
  return (
    <CardWrapper className="w-[98%]">
      <CardMessage
        message={{
          sr_no: call.id,
          name: call.name,
          address: call.message,
          mobile_no: call.mobile_no,
          ...(call?.new_mobile_no && { new_mobile_no: call.new_mobile_no }),
          ...(call.book_name && {
            book_name: call.book_name + " " + call.book_lang,
          }),
        }}
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

      <div className=" overflow-hidden p-2  rounded-b-lg">
        {type == 1 && (
          <p className={`text-center ${getStatusColor()} my-0`}>
            {call.response_by &&
              ts("completed_by", { name: call.response_by.name })}
          </p>
        )}
        <button className={`w-full capitalize ${getStatusColor()}`}>
          {ts(statusText || "")} -{" "}
          {dayjs(call.response_at).format("DD/MM/YYYY")}
        </button>
      </div>
    </CardWrapper>
  );
};

export default MissCallCompleted;
