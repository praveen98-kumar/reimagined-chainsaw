import React, { useMemo, useState } from "react";
import { BaseOrder } from "@/shared/interfaces/seva";
import dayjs from "dayjs";
import { capitalizeWords } from "@/shared/functions/utils";
import {
  CardDateStatus,
  CardGridContainer,
  CardIcons,
  CardMessage,
  CardWrapper,
} from "./CommonCard";
import { useTranslation } from "react-i18next";
import CardButton from "./CardButton";
import { getDuplicateStatusByValue } from "@/shared/interfaces/app";

interface DuplicateCompleteCardProp {
  order: BaseOrder & { [k: string]: any };
  type?: number;
}
const DuplicateCompleted: React.FC<DuplicateCompleteCardProp> = ({
  order,
  type,
}) => {
  const { t: ts } = useTranslation("status");
  const [showDuplicates, setShowDuplicates] = useState(false);
  const lastDuplicate = order.duplicates.length - 1;
  const acceptStatus: string = capitalizeWords(
    getDuplicateStatusByValue(order.duplicates?.[0]?.status_int) + "ed"
  );
  // @ts-ignore
  const acceptedBy: any = order?.duplicates?.[0]?.response_by?.disciple?.name;
  let orderCount = 1;

  let remainingDay = useMemo(() => {
    return (
      15 -
      dayjs(new Date()).diff(
        order.duplicates[lastDuplicate].allocation_date,
        "d"
      )
    );
  }, []);

  return (
    <CardWrapper className="w-[98%]">
      <CardMessage
        message={{
          sr_no: order.id,
          ...(order?.new_address && { new_address: order.new_address }),
          ...(order?.name && { name: order.name }),
          address: order.message,
          mobile_no: order.mobile_no,
          ...(order?.alt_mobile_no && { alt_mobile_no: order.alt_mobile_no }),
          ...(order?.new_mobile_no && { new_mobile_no: order.new_mobile_no }),
          ...(order.book_name && {
            book_name: order.book_name + " " + order.book_lang,
          }),
        }}
      />
      <CardIcons mobile_no={order.mobile_no} />
      <CardGridContainer className="gap-0.5">
        <CardDateStatus title={ts("book_ordered_on")} date={order.created_at} />
        <CardDateStatus
          title={ts("allot_for_delivery")}
          date={order.order_allotted_at}
        />
        <CardDateStatus
          title={ts("book_delivered_on")}
          date={order.delivered_at}
        />
      </CardGridContainer>
      {showDuplicates ? (
        <div>
          {order?.duplicates?.map((obj, i) => (
            <>
              <CardMessage
                message={{
                  count: ++orderCount,
                  name: order?.name,
                  address: order?.message,
                  mobile_no: order?.mobile_no,
                }}
                className="min-h-28"
              />
              <CardGridContainer className="gap-0.5">
                <CardDateStatus
                  title={ts("book_ordered_on")}
                  date={order.created_at}
                />
                <CardDateStatus
                  title={ts("allot_for_delivery")}
                  date={order.order_allotted_at}
                />
              </CardGridContainer>
            </>
          ))}
        </div>
      ) : null}
      <CardGridContainer>
        <CardButton
          onClick={() => setShowDuplicates((prev) => !prev)}
          label={
            showDuplicates
              ? "Collapse Duplicates"
              : `Show Duplicates (${order?.duplicates?.length})`
          }
          className="text-gray-600 transition active:border-transparent duration-300 active:bg-gray-600 active:text-white active:shadow-lg font-bold border-r border-t border-gray-400"
        />
      </CardGridContainer>

      {acceptedBy ? (
        <p className="p-3 text-center text-white bg-primary font-semibold">
          {acceptStatus} By <span className="font-bold">{acceptedBy}</span>
        </p>
      ) : null}
    </CardWrapper>
  );
};

export default DuplicateCompleted;
