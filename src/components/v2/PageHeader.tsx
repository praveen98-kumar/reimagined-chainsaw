"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { SevaType } from "@/config/roles";
import { cn } from "@/utils/cn";
import { BackButton } from "./BackButton";
import { SevaRegionPopover } from "./SevaRegionPopover";

export interface PageHeaderProps {
  title: string;
  icon?: any;
  titleClassName?: string;
  sevas?: readonly SevaType[];
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  titleClassName,
  icon,
  sevas,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-100 inset-x-0 min-h-19 p-4">
      <div className="flex w-full min-h-11 items-center justify-between">
        <BackButton />
        <div className="text-center flex-1">
          <p className={cn("text-2xl font-medium leading-6.5", titleClassName)}>
            {title}
          </p>
          {mounted && (
            <div className="w-[78%] mx-auto">
              <SevaRegionPopover sevas={sevas} />
            </div>
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
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { SevaType } from "@/config/roles";
import { useScrolled } from "@/hooks/useScrolled";
import { cn } from "@/utils/cn";
import { BackButton } from "./BackButton";
import { SevaRegionPopover } from "./SevaRegionPopover";

export interface PageHeaderProps {
  title: string;
  icon?: any;
  titleClassName?: string;
  sevas?: readonly SevaType[];
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  titleClassName,
  icon,
  sevas,
}) => {
  const [mounted, setMounted] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const scrolled = useScrolled(headerRef);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 z-100 inset-x-0 min-h-19 p-4 transition-[background-color,box-shadow,border-color] duration-200",
        scrolled
          ? "border-b border-black/5 bg-white/80 shadow-sm backdrop-blur-md supports-backdrop-filter:bg-white/70"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="flex w-full min-h-11 items-center justify-between">
        <BackButton />
        <div className="text-center flex-1">
          <p className={cn("text-2xl font-medium leading-6.5", titleClassName)}>
            {title}
          </p>
          {mounted && (
            <div className="w-[78%] mx-auto">
              <SevaRegionPopover sevas={sevas} />
            </div>
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
