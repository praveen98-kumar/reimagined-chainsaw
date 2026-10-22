"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/store";
import { cn } from "@/utils/cn";
import { getPageHeaderSubtitle } from "@/utils/page-header.utils";
import { BackButton } from "./BackButton";

interface PageHeaderProps {
  title: string;
  icon?: any;
  titleClassName?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  titleClassName,
  icon,
}) => {
  const [mounted, setMounted] = useState(false);
  const { active_permission, active_region, active_region_index } =
    useAppSelector((s) => s.auth);
  const subtitle = getPageHeaderSubtitle(
    active_permission,
    active_region,
    active_region_index,
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky h-19 top-0 z-100 inset-x-0 p-4 bg-white">
      <div className="flex w-full h-full items-center justify-between">
        <BackButton />
        <div className="text-center flex-1">
          <p className={cn("text-xl font-medium leading-6.5", titleClassName)}>
            {title}
          </p>
          {mounted && subtitle && (
            <p className="text-lg leading-tight text-slate-700 capitalize line-clamp-2 w-[70%] mx-auto">
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <Image
            alt={`facebook-2-media`}
            src={icon}
            className="absolute right-3 size-16"
            width={64}
            height={64}
          />
        )}
      </div>
    </header>
  );
};
