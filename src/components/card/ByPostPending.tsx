import React, { useState } from "react";
import toast from "react-hot-toast";
import CardButton from "./CardButton";
import dayjs from "dayjs";
import apiClient from "@/http/index";
import { filterOrders, prepandOrder } from "@/redux/features/orderSlice";
import { useAppDispatch } from "@/redux/store";
import { IoLogoWhatsapp } from "react-icons/io";
import { FiPhoneCall } from "react-icons/fi";
import { ByPost } from "@/shared/interfaces/order-in-card";
import dynamic from "next/dynamic";
const TrackingIdModal: any = dynamic(
  () => import("@/components/modal/SetTrackingIdModal"),
  { ssr: false }
);

interface ByPostPendingCardProp {
  post: ByPost;
  pending: boolean;
}

const ByPostPendingCard: React.FC<ByPostPendingCardProp> = ({
  post,
  pending,
}) => {
  const dispatch = useAppDispatch();
  const [showUpdateTracking, setshowUpdateTracking] = useState<boolean>(false);

  const closeModal = () => setshowUpdateTracking(false);

  const handleConfirm = async (values?: object) => {
    try {
      const data = {
        id: post.id,
        ...(values && values),
      };
      const response = await apiClient.post("post_orders_set_tracking", data);
      toast.success(response.data?.message);
      dispatch(filterOrders({ type: "pendingOrders", id: post.id }));
      if (pending) {
        dispatch(prepandOrder({ key: "completedOrders", data: post }));
      }
      closeModal();
    } catch (e: any) {
      toast.error(e?.response.data.error);
    }
  };
  return (
    <>
      <div
        className={`w-full flex relative overflow-hidden border border-slate-600 bg-white drop-shadow-xl flex-col rounded-lg mb-4`}
      >
        {pending && (
          <>
            <a
              href={`tel:${post.mobile_no}`}
              className={
                "absolute w-12 flex items-center rounded-lg justify-center h-12 top-0 right-0"
              }
            >
              <FiPhoneCall className="text-black text-2xl" />
            </a>
            <a
              href={`https://wa.me/91${
                post.mobile_no?.substring(post.mobile_no.length - 10) || ""
              }`}
              target="_blank"
              rel="noopener noreferrer"
              className={
                "absolute w-12 flex items-center rounded-lg justify-center h-12 top-11 right-0"
              }
              onClick={(e) => {
                if (!post.mobile_no || post.mobile_no.length < 10) {
                  e.preventDefault();
                }
              }}
            >
              <IoLogoWhatsapp className="text-green-600 text-3xl" />
            </a>
          </>
        )}
        <div
          style={{ minHeight: "130px" }}
          className={`flex-1 p-2 text-sm text-gray-600 pr-10`}
        >
          <p>Sr. No : {post.id}</p>
          {post.name ? <p>Name : {post.name}</p> : null}
          <p className="w-80">Address : {post.message}</p>
          <p>Mobile no : {post.mobile_no}</p>
          <p>
            Book Name : {post.book_name} - {post.book_lang}
          </p>
        </div>
        <div className="bg-gray-500 flex items-center justify-around border-t text-white text-xs p-1 text-center">
          <span>
            बुक ऑर्डर प्राप्त: {dayjs(post.created_at).format("DD/MM/YYYY")}
          </span>
        </div>
        {pending && (
          <div className="grid overflow-hidden grid-cols-1 border-gray-500 border-t rounded-b-lg">
            <CardButton
              onClick={() => setshowUpdateTracking(true)}
              label="Update Tracking Details"
              className="text-gray-600 transition active:border-transparent duration-300 active:bg-gray-600 active:text-white active:shadow-lg font-bold  border-gray-400"
            />
          </div>
        )}
        {!pending && (
          <>
            <div className="grid grid-cols gap-0.5 text-center text-xs border-t border-gray-600">
              <p className="p-1">Tracking Id: {post.tracking_id}</p>
            </div>
            <div className="grid grid-cols gap-0.5 text-center text-green-600 text-xs border-t border-gray-600">
              <p className="p-1">
                Updated: {dayjs(post.response_at).format("DD/MM/YYYY")}
              </p>
            </div>
          </>
        )}
      </div>
      <TrackingIdModal
        title={`Update tracking order details for:`}
        show={showUpdateTracking}
        onClose={closeModal}
        message={post.message}
        onConfirm={(values: any) => handleConfirm(values)}
      />
    </>
  );
};

export default ByPostPendingCard;
