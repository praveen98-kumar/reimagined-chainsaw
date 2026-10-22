import React from "react";
import { BiStopwatch } from "react-icons/bi";

interface TimerProps {
  value: number;
  totalValue?: number;
  bg?: string;
}

const Timer: React.FC<TimerProps> = ({ value, totalValue = 15, bg }) => {
  //Order Delivery Seva > Regular - Out >  1-5 red,  6-10  yellow and 11-15 green
  //Order Delivery Seva > Regular - In >   1-5 red, 6-10 yellow and 11-15 green

  let bgColor = bg
    ? bg
    : value < 0
    ? "bg-red-900"
    : value <= totalValue / 3
    ? "bg-red-500"
    : value >= totalValue / 3 + 1 && value <= (totalValue / 3) * 2
    ? "bg-yellow-500"
    : "bg-green-600";
  return (
    <div
      className={`w-12 flex items-center rounded-bl-lg justify-center h-12 ${bgColor}`}
    >
      <BiStopwatch color="white" className="w-12 h-12 absolute" />
      <span
        className={`text-white font-bold text-xs w-6 h-6 mt-1 flex items-center justify-center rounded-full z-10 ${bgColor}`}
      >
        {value < 0 ? value * -1 : value}
      </span>
    </div>
  );
};

export default Timer;
