import { OrderIn } from "@/shared/interfaces/order-in-card";
import { useTranslation } from "react-i18next";
import { BiEdit, BiTrash } from "react-icons/bi";
import { isValidUser } from "@/shared/functions/utils";
import {
  CardDateStatus,
  CardGridContainer,
  CardWrapper,
  removeSymbols,
} from "./CommonCard";
import Modal from "@/components/modal/Modal";
import apiClient from "@/http/index";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaQuestionCircle } from "react-icons/fa";

const RemoveOrderModal = ({
  id,
  onDeleteConfirm,
}: {
  id: number;
  onDeleteConfirm: (id: number) => void;
}) => {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t: tq } = useTranslation("question");

  async function removeOrder() {
    setLoading(true);
    try {
      await apiClient.delete(`order/${id}`);
      toast.success("Order deleted successfully.");
      onDeleteConfirm(id);
      setShow(false);
    } catch (error: any) {
      console.error(error);
      if (error?.response?.status === 401) {
        toast.error("Not authorized");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center">
      <button onClick={() => setShow(true)} className="text-red-400">
        <BiTrash className="w-6 h-6" />
      </button>
      <Modal
        show={show}
        onClose={() => setShow(false)}
        onConfirm={removeOrder}
        disableClosing={loading}
        loading={loading}
      >
        <div className="mb-8 space-y-8">
          <FaQuestionCircle className=" mx-auto w-20 h-20 text-primary" />
          <p className="font-normal text-xl text-center">
            {tq("delete_order")}
          </p>
        </div>
      </Modal>
    </div>
  );
};

const CreatedOrderCard = ({
  order,
  onEditClicked,
  showEdit,
  canDelete,
  onDeleteConfirm,
  sevadarDetail = {},
}: {
  showEdit?: boolean;
  canDelete?: boolean;
  order: OrderIn;
  onDeleteConfirm?: (id: number) => void;
  onEditClicked: (id: number) => void;
  sevadarDetail?: Record<string, string>;
}) => {
  const { t } = useTranslation("status");
  const items = {
    address: order.message,
    ...(order.mobile_no?.length >= 10 && { mobile_no: order.mobile_no }),
    ...(order.book_name &&
      order.book_name != "" && { book_name: order.book_name }),
    ...(order.book_lang &&
      order.book_lang != "" && { book_language: order.book_lang }),
    ...(order?.country_name &&
      order?.country_name != "India" && { country: order?.country_name }),
  };

  const canEdit: boolean = isValidUser("update_order");
  return (
    <CardWrapper
      className={
        order.category == "incomplete"
          ? "w-[98%] border-yellow-600 ring-yellow-400"
          : "w-[98%] border-green-600 ring-green-400"
      }
    >
      <div className={`w-full p-2 text-sm space-y-1 ${canEdit && "pr-10"}`}>
        {Object.entries(items).map(([key, value], i) => (
          <p key={key + i}>
            <span className="font-medium capitalize p-0 pr-1">
              {removeSymbols(key)}:
            </span>
            {value}
          </p>
        ))}
        <div className="absolute top-2 right-2 flex flex-col gap-3">
          {showEdit && canEdit && (
            <button
              onClick={() => onEditClicked(order.id)}
              className="text-blue-400 "
            >
              <BiEdit className="w-6 h-6" />
            </button>
          )}
          {canDelete && (
            <RemoveOrderModal
              id={order.id}
              onDeleteConfirm={onDeleteConfirm!}
            />
          )}
        </div>
      </div>
      {order?.seva_by_name && (
        <div className="text-xs font-semibold capitalize bg-gray-700 text-gray-100 text-center p-0.5 border-b border-gray-700">
          <p>
            Seva By: <span>{order.seva_by_name}</span>
          </p>
        </div>
      )}

      {sevadarDetail && Object.keys(sevadarDetail).length > 0 && (
        <div className="text-xs font-semibold capitalize bg-gray-700 text-gray-100 text-center p-0.5 border-b border-gray-700">
          <p>
            Sevadar Name: <span>{sevadarDetail.sevadar_name}</span>
          </p>
          <p>
            Sevadar Mobile Number:{" "}
            <span>{sevadarDetail?.sevadar_mobile_no}</span>
          </p>
          <p>
            Sevadar Seva Location:{" "}
            <span>{sevadarDetail?.sevadar_seva_location}</span>
          </p>
        </div>
      )}
      <p className="text-xs bg-gray-500 text-gray-100 text-center p-0.5 border-b border-gray-700">
        {order?.national
          ? order?.emergency
            ? "Emergency Order"
            : "National Order"
          : "International Order"}
      </p>
      {order?.category != "proper" ? (
        <p className="capitalize text-xs bg-gray-500 text-gray-100 text-center p-0.5 border-b border-gray-700">
          {removeSymbols(order?.category as string)} Order
          <span className="ml-1">
            {(order.mobile_no == "" || order.mobile_no == null) &&
            (order.pincode == "" || order.pincode == null)
              ? "(Mobile and pincode are missing )"
              : order.mobile_no == "" || order.mobile_no == null
              ? "( Moblile Number is missing )"
              : order.pincode == "" || order.pincode == null
              ? "( Pincode is missing )"
              : ""}
          </span>
        </p>
      ) : null}
      <CardGridContainer className="gap-0.5">
        <CardDateStatus
          title={t("created_on", { item: "" })}
          date={order.order_at}
          dateFormat="DD/MM/YYYY hh:mm:ss A"
        />
      </CardGridContainer>
    </CardWrapper>
  );
};

export default CreatedOrderCard;
