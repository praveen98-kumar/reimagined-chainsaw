import { RuchiCall } from "@/shared/interfaces/calling";
import dayjs from "dayjs";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  CardDateStatus,
  CardGridContainer,
  CardHistory,
  CardIcons,
  CardMessage,
  CardWrapper,
  getStatusColor,
} from "./CommonCard";

interface NamdanCallingCompletedCardProp {
  call: RuchiCall & { [k: string]: any };
  type?: number;
}

const NamdanCallingCompletedCard: React.FC<NamdanCallingCompletedCardProp> = ({
  call,
  type,
}) => {
  const { t: ts } = useTranslation("status");

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
        <CardDateStatus
          title={ts("ruchi_calling_done")}
          date={call.jyada_ruchi_response_at as string}
        />
        <CardDateStatus
          title={ts("namdan_calling_done")}
          date={call.response_at as string}
        />
      </CardGridContainer>

      <CardHistory
        showLast={true}
        history={[
          ...call?.history.filter(
            (history) => history.status != "Namdan Taken"
          ),
          ...(call?.status == "namdan_taken"
            ? [
                {
                  created_at: call?.namdan_date,
                  status: "Namdan Taken",
                  remark: call?.remark,
                  form_no: call?.form_no,
                },
              ]
            : []),
        ]}
      />

      <div className=" overflow-hidden text-center p-2 flex flex-col -space-y-3">
        <p
          className={`w-full flex justify-center gap-x-1 capitalize ${getStatusColor(
            call.status
          )}`}
        >
          <span>{ts(call?.status.replace("_", " "))}-</span>
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

export default NamdanCallingCompletedCard;
