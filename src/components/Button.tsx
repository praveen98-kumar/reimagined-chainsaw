import { cn } from "@/shared/functions/utils";
import type * as React from "react";
import LoadingSpinner from "./LoadingSpinner";

type ButtonProps = React.ComponentProps<"button"> & {
  loading?: boolean;
  variant?: "primary" | "secondary" | "primary-reverse" | "gradient";
};

const Button = ({
  children,
  className,
  variant = "primary",
  loading = false,
  ...props
}: ButtonProps) => {
  const style =
    variant === "primary"
      ? "bg-primary text-white disabled:bg-black/80 disabled:text-white/50 disabled:cursor-not-allowed"
      : variant === "primary-reverse"
        ? "bg-white text-black border border-black"
        : variant === "gradient"
          ? "rounded-full bg-linear-to-r from-brand-900 to-brand-700 text-white text-lg font-bold py-3 shadow-[0_10px_24px_-8px_rgba(59,15,110,0.6)] disabled:opacity-60 disabled:cursor-not-allowed"
          : "text-gray-800 bg-gray-300";
  return (
    <button
      className={cn(
        `flex items-center justify-center px-8 py-2 rounded-lg font-semibold text-md  ${style}`,
        className,
      )}
      disabled={loading}
      {...props}
    >
      {loading && (
        <LoadingSpinner
          className={`w-4 h-4 mr-2 ${
            variant === "primary" || variant === "gradient"
              ? "fill-white"
              : "fill-black"
          }`}
        />
      )}
      {children}
    </button>
  );
};

export default Button;
