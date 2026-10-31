import Icon from "@/components/Icon";
import { cn, queryString } from "@/shared/functions/utils";
import useValidUser from "@/hooks/useValidUser";
import { useRouter } from "next/router";
import React from "react";

interface Props {
  href: string;
  title: string;
  permission: string;
  iconSrc: string;
  params?: Record<string, string>;
  iconContainerClass?: string;
  className?: string;
}

export const LinkButtonContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("grid gap-2 grid-cols-2 auto-cols-max mt-4", className)}>
      {children}
    </div>
  );
};

const LinkButton = ({
  title,
  href,
  permission,
  iconSrc,
  params = {},
  iconContainerClass,
  className,
}: Props) => {
  const router = useRouter();
  const hasPermission = useValidUser(permission);
  const containerClass = iconContainerClass ?? "w-5 h-5";
  const paramString = queryString(params);
  const onClick = () => {
    router.push(`${href}${paramString}`, undefined, { locale: router.locale });
  };
  if (!hasPermission) return null;
  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "space-x-2 cursor-pointer text-white bg-black font-bold px-2 h-14 rounded-lg flex items-center justify-center",
        className,
      )}
    >
      <Icon src={iconSrc} containerClass={containerClass} />
      <span>{title}</span>
    </button>
  );
};

export default LinkButton;
