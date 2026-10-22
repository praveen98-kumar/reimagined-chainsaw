"use client";

import Image from "next/image";
import { IMAGES } from "@/constants/images";
import { cn } from "@/utils/cn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog";

type Mode = "warn" | "error" | "success";

const ModeToImageMap: Record<Mode, any> = {
  warn: IMAGES.warning,
  error: IMAGES.errorCross,
  success: IMAGES.successCheck,
};

interface Props extends React.ComponentProps<typeof Dialog> {
  mode: Mode;
  title: string;
  description?: string;
}

export function ResultDialog({ mode, title, description, ...props }: Props) {
  const titleColor =
    mode === "success" ? "#018401" : mode === "warn" ? "#FFCC00" : "#FF383C";
  return (
    <Dialog {...props}>
      <DialogContent className="top-1/3 min-h-24 max-w-68 flex flex-col items-center gap-0 justify-center">
        <Image src={ModeToImageMap[mode]} alt={mode} width={50} height={50} />
        <DialogTitle
          className={cn("text-2xl font-semibold")}
          style={{ color: titleColor }}
        >
          {title}
        </DialogTitle>
        {description && (
          <DialogDescription className="text-xs text-slate-800 max-w-68 text-center">
            {description}
          </DialogDescription>
        )}
      </DialogContent>
    </Dialog>
  );
}
