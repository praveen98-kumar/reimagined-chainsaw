import type React from "react";
import { cn } from "@/utils/cn";

interface OrderCardProps {
  title: string;
  gradientClass: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  title,
  gradientClass,
  children,
  className,
  headerClassName,
  bodyClassName,
}) => {
  return (
    <div
      className={cn("overflow-hidden rounded-xl bg-white shadow-xl", className)}
    >
      <div
        className={cn(
          "px-4 py-2 text-white font-bold text-lg bg-linear-to-r",
          gradientClass,
          headerClassName,
        )}
      >
        {title}
      </div>
      <div className={cn("space-y-1.5", bodyClassName)}>{children}</div>
    </div>
  );
};
