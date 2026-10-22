import React, { useMemo, useState } from "react";
import CardButton from "./CardButton";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { BaseOrder } from "@/shared/interfaces/seva";
import dayjs from "dayjs";
import { FaQuestionCircle } from "react-icons/fa";
import Modal from "@/components/modal/Modal";
import apiClient from "@/http/index";
import toast from "react-hot-toast";
import { filterOrders, prepandOrder } from "@/redux/features/orderSlice";
import { useTranslation } from "react-i18next";
import {
  CardDateStatus,
  CardGridContainer,
  CardIcons,
  CardMessage,
  CardWrapper,
} from "./CommonCard";
import { DUPLICATE_ORDER_STATUS } from "@/shared/interfaces/app";
import { useCount } from "@/hooks/useCount";
interface DuplicatePendingCardProps {
  order: BaseOrder & { [k: string]: any };
  type?: number;
}

type StatusType = keyof Pick<
  typeof DUPLICATE_ORDER_STATUS,
  "ACCEPT" | "REJECT"
>;

const DuplicatePendingCard: React.FC<DuplicatePendingCardProps> = ({
  order,
  type = 1,
}) => {
  const { t: tq } = useTranslation("question");
  const { t: ts } = useTranslation("status");

  const dispatch = useAppDispatch();
  const [show, setShow] = useState<StatusType | "">("");
  const [showDuplicates, setShowDuplicates] = useState(false);
  const { active_permission, active_region_index } = useAppSelector(
    (s) => s.auth
  );
  const lastDuplicate = order.duplicates.length - 1;
  // @ts-ignore
  const allottedTo: any = order.allocated_to?.disciple?.name;
  let orderCount = 1;
  const activeCountryId =
    active_permission?.region[active_region_index]?.country_id;
  let remainingDay = useMemo(() => {
    return 15 - dayjs(new Date()).diff(order.allocation_date, "d");
  }, []);
  let borderColor = useMemo(() => {
    return remainingDay <= 5
      ? "border-red-500"
      : remainingDay <= 10
      ? "border-yellow-500"
      : "border-green-600";
  }, [remainingDay]);

  const closeModal = () => setShow("");
  const { update: updateCounts } = useCount();

  const handleConfirm = async (status: StatusType, values?: object) => {
    try {
      const data = {
        order_id: order.duplicates[lastDuplicate].id,
        response_type: DUPLICATE_ORDER_STATUS[status],
        ...(values && values),
      };
      const response = await apiClient.post("duplicate_order_response", data);
      toast.success(response.data?.message);
      dispatch(filterOrders({ type: "pendingDuplicateOrders", id: order.id }));
      dispatch(
        prepandOrder({
          key: "completedDuplicateOrders",
          data: { ...order, status: DUPLICATE_ORDER_STATUS[status] },
        })
      );
      updateCounts("duplicateCounts", "country_id", {
        role: active_permission?.role,
        country_id: activeCountryId,
        counts: {
          ctm: 1,
          ctd: 1,
          pending_order: -1,
        },
      });
      closeModal();
    } catch (e: any) {
      toast.error(e?.response.data.error);
    }
  };

  return (
    <>
      <CardWrapper className="w-[98%]">
        <CardMessage
          className={"pr-12 h-[170px]"}
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
          <CardDateStatus
            title={ts("book_ordered_on")}
            date={order.created_at}
          />
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
        {type === 0 && (
          <CardGridContainer>
            <CardButton
              onClick={() => setShow("ACCEPT")}
              label="Accept"
              className="text-green-600 transition active:border-transparent duration-300 active:bg-green-600 active:text-white active:shadow-lg font-bold border-r border-t border-gray-400"
            />
            <CardButton
              onClick={() => setShow("REJECT")}
              label="Reject"
              className="text-red-500 transition active:border-transparent duration-300 active:bg-red-500 active:text-white active:shadow-lg font-bold border-l border-t border-gray-400 "
            />
          </CardGridContainer>
        )}
        {type == 1 && allottedTo ? (
          <p className="p-3 text-center text-white bg-primary font-semibold">
            {ts("allotted_to", { name: allottedTo })}
          </p>
        ) : null}
      </CardWrapper>
      {show != "" ? (
        <Modal
          show={show === "ACCEPT" || show === "REJECT"}
          onConfirm={() => handleConfirm(show)}
          onClose={() => setShow("")}
        >
          <div className="space-y-8 mb-8">
            <FaQuestionCircle className=" mx-auto w-20 h-20 text-primary" />
            <p className="font-normal text-xl text-center">
              {show == "ACCEPT"
                ? tq("accept_duplicate_order", { sr_no: order.id })
                : tq("reject_duplicate_order", { sr_no: order.id })}
            </p>
          </div>
        </Modal>
      ) : null}
    </>
  );
};

export default DuplicatePendingCard;
