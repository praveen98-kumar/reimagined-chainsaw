import { useQueryClient } from "@tanstack/react-query";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { useCountFetch } from "@/hooks/useCountFetch";
import type { ICount, TCount } from "@/redux/features/countSlice";
import { useAppSelector } from "@/redux/store";
import { cn } from "@/shared/functions/utils";
import Button from "./Button";

interface StatusCardProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  path: string;
  type: TCount;
  sevadar_type: string;
  children?:
    | ReactNode
    | ((props: { values: ICount; isLoading?: boolean }) => ReactNode);
  refreshButtonFullWidth?: boolean;
}

const StatusCard = forwardRef<HTMLDivElement, StatusCardProps>(
  (
    {
      path,
      type,
      sevadar_type,
      children,
      className,
      refreshButtonFullWidth = false,
      ...props
    },
    ref,
  ) => {
    const queryClient = useQueryClient();
    const { active_permission } = useAppSelector((state) => state.auth);
    const values = useAppSelector((state) => state.counts[type]);

    const activeRole = active_permission?.role;
    const { isLoading, getCountsForSevadars } = useCountFetch({
      activeRole,
      path,
      type,
      sevadar_type,
    });

    return (
      <div
        ref={ref}
        className={cn(
          "w-full max-w-xl bg-white text-black text-center rounded-lg p-4 mb-4 drop-shadow-lg border border-gray-400 relative",
          className,
        )}
        {...props}
      >
        {activeRole != sevadar_type ? (
          <Button
            disabled={isLoading}
            onClick={() => {
              getCountsForSevadars();
              if (path === "social_media_seva_count") {
                queryClient.invalidateQueries({
                  queryKey: ["platform_report"],
                });
              }
            }}
            className={
              refreshButtonFullWidth
                ? "w-full mb-1 gap-2"
                : "p-0 absolute right-4 top-4 h-8 w-8"
            }
          >
            <FiRefreshCw
              className={cn("h-4 w-4", { "animate-spin": isLoading })}
            />
            {refreshButtonFullWidth && <p>Refresh</p>}
          </Button>
        ) : null}
        {typeof children === "function"
          ? children({ ...props, values, isLoading })
          : children}
      </div>
    );
  },
);

StatusCard.displayName = "StatusCard";

export const StatusCardTitle = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div className="flex justify-center align-center">
    <h3
      ref={ref}
      className={cn("font-bold text-xl text-center w-[86%]", className)}
      {...props}
    />
  </div>
));

StatusCardTitle.displayName = "StatusCardTitle";

export const StatusCardGrid = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("grid mt-3 grid-cols-2 gap-0.5 bg-gray-500", className)}
    {...props}
  />
));

StatusCardGrid.displayName = "StatusCardGrid";

const statusCardBoxVariants = cva("font-bold", {
  variants: {
    status: {
      default: "text-black",
      green: "text-green-600",
      red: "text-red-500",
      yellow: "text-yellow-500",
    },
  },
  defaultVariants: {
    status: "default",
  },
});

interface StatusCardBoxProps
  extends
    HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusCardBoxVariants> {
  count: number | string;
  label: string;
  isLoading?: boolean;
}

export const StatusCardBox = forwardRef<HTMLDivElement, StatusCardBoxProps>(
  ({ className, status, isLoading, label, count, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-white flex flex-col gap-2 justify-center min-h-25 items-center py-2",
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <div className="h-8 w-12 animate-pulse rounded-md bg-gray-300 duration-100" />
      ) : (
        <p className={cn(statusCardBoxVariants({ status }), "text-xl")}>
          {count || 0}
        </p>
      )}
      <p
        className={cn(
          statusCardBoxVariants({ status: "default" }),
          "font-semibold",
        )}
      >
        {label}
      </p>
    </div>
  ),
);

StatusCardBox.displayName = "StatusCardBox";

export default StatusCard;
