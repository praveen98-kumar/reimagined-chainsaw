import React from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/shared/functions/utils";

interface CountCardProps {
  children?: React.ReactNode;
  pendingCount?: string | number;
  title?: string;
  showPending?: boolean;
}

const CountCard: React.FC<CountCardProps> = ({
  children,
  pendingCount,
  title,
  showPending = false,
}) => {
  const { t } = useTranslation("common");
  return (
    <div className=" w-full max-w-xl bg-white text-black text-center rounded-lg p-4 mb-4 drop-shadow-lg border border-gray-400">
      <h3 className="font-bold text-xl">{title}</h3>
      {showPending && (
        <p className="font-semibold flex justify-center items-center space-x-2">
          <span>{t("pending")}</span>
          <span className="text-red-500 font-bold text-xl">
            {Number(pendingCount)}
          </span>
        </p>
      )}
      <div className="bg-gray-500 grid mt-3 grid-cols-2 gap-0.5">
        {children}
      </div>
    </div>
  );
};

interface CountCardBoxProps {
  title: string;
  count: string | number;
  className?: string;
  statusColor?: "yellow" | "green" | "red";
}
export const CountCardBox: React.FC<CountCardBoxProps> = ({
  title,
  count,
  className,
  statusColor = "green",
}) => {
  const textColor =
    statusColor == "green" ? "text-green-600" : `text-${statusColor}-500`;
  return (
    <div className={cn("bg-white py-2", className)}>
      <p className={`font-bold text-xl ${textColor}`}>{count}</p>
      <p className="font-semibold">{title}</p>
    </div>
  );
};

export default CountCard;
