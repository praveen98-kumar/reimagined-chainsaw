import React from "react";
import { Call } from "@/shared/interfaces/calling";
import dayjs from "dayjs";

interface ByPostUpdatedCardProp {
  call: Call;
}

const CallingCompletedCard: React.FC<ByPostUpdatedCardProp> = ({ call }) => {
  const getStatusColor = () => {
    switch (call.calling_seva_status) {
      case "book_not_receive":
        return "text-gray-500";
      case "jyada_ruchi":
        return "text-green-500";
      case "not_interested":
        return "text-orange-500";
      case "got_initiation":
        return "text-blue-500";
      case "duplicate":
        return "text-pink-500";
      default:
        return "text-green-500";
    }
  };
  return (
    <div className="w-full mb-4 flex overflow-hidden flex-col border border-slate-600 drop-shadow-lg bg-white rounded-lg">
      <div className="flex-1 p-2 text-sm text-gray-600">
        {call.name ? <p>Name : {call.name}</p> : null}
        <p>Address : {call.message}</p>
        <p>Mobile no : {call.mobile_no}</p>
        <p>
          Book Name : {call.book_name} - {call.book_lang}
        </p>
      </div>
      <div className="bg-gray-500 flex items-center justify-around text-gray-200 text-xs p-1 text-center">
        <span>
          बुक डिलीवर हुई: {dayjs(call.delivered_at).format("DD/MM/YYYY")}
        </span>
        <div className="h-full w-0.5 bg-gray-300" />
        <span>
          बुक कॉलिंग अलोट:{" "}
          {dayjs(call.calling_allotted_at).format("DD/MM/YYYY")}
        </span>
      </div>
      <div className=" overflow-hidden rounded-b-lg">
        <button className={`w-full p-2 capitalize ${getStatusColor()}`}>
          {call.calling_seva_status.replace(/_/g, " ")} -
          {dayjs(call.calling_response_at).format("DD/MM/YYYY")}
        </button>
      </div>
    </div>
  );
};

export default CallingCompletedCard;
