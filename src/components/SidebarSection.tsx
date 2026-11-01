import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, type LucideIcon } from "lucide-react";
import type React from "react";

import { cn } from "@/shared/functions/utils";

export const sidebarCardClass =
  "rounded-2xl border bg-white/90 shadow-[0_8px_24px_-14px_rgba(76,29,149,0.35)] overflow-hidden";

export const sidebarOptionClass = (active: boolean) =>
  cn(
    "flex w-full items-center justify-between rounded-xl border px-4 py-2 text-left text-lg font-semibold text-brand-ink cursor-pointer",
    active
      ? "border-indigo-200 bg-indigo-50"
      : "border-transparent hover:bg-indigo-50/50",
  );

export const SidebarIcon = ({ Icon }: { Icon: LucideIcon }) => (
  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-50 to-violet-100 text-brand-ink">
    <Icon className="size-5" />
  </span>
);

export const ActiveCheck = () => (
  <Check className="size-5 shrink-0 text-green-700" />
);

interface SidebarSectionProps {
  Icon: LucideIcon;
  title: React.ReactNode;
  badge?: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  contentClassName?: string;
  children: React.ReactNode;
}

const SidebarSection = ({
  Icon,
  title,
  badge,
  open,
  onToggle,
  contentClassName,
  children,
}: SidebarSectionProps) => (
  <div
    className={cn(
      sidebarCardClass,
      open ? "border-indigo-200" : "border-white",
    )}
  >
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full items-center gap-3 px-3 py-2 text-left",
        open && "bg-linear-to-r from-violet-100 to-pink-100",
      )}
    >
      <SidebarIcon Icon={Icon} />
      <span className="flex-1 text-lg font-semibold text-brand-ink">
        {title}
      </span>
      {badge}
      <ChevronDown
        className={cn(
          "size-5 text-brand-ink transition-transform",
          open && "rotate-180",
        )}
      />
    </button>
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          className="overflow-hidden"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="border-t border-dashed border-indigo-200" />
          <div className={cn("space-y-1 p-1.5", contentClassName)}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default SidebarSection;
