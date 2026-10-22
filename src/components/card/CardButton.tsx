import { cn } from "@/shared/functions/utils";
import React, { ButtonHTMLAttributes } from "react";

type CardButtonProrps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  Icon?: React.ReactNode;
  className?: string;
};

const CardButton: React.FC<CardButtonProrps> = ({
  Icon,
  label,
  className,
  ...rest
}) => {
  return (
    <button
      className={cn("flex px-2 py-1.5 items-center justify-center", className)}
      {...rest}
    >
      {Icon && Icon}
      {label}
    </button>
  );
};

export default CardButton;
