"use client";

import { Share2Icon, CopyIcon } from "lucide-react";
import { Button } from "@/components/v2/ui/button";
import toast from "react-hot-toast";
import Image from "next/image";
import { socialImages3d } from "@/constants/images";

interface CopyBarProps {
  messages: string[];
}

function shareOrCopy(text: string) {
  if (typeof navigator !== "undefined" && navigator.share) {
    navigator.share({ text }).catch(console.error);
  } else if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Copied to clipboard"))
      .catch(console.error);
  }
}

export function CopyBar({ messages }: CopyBarProps) {
  if (!messages.length) return null;
  const canShare = typeof navigator !== "undefined" && !!navigator.share;
  const label = canShare ? "Share" : "Copy";

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg border border-border p-2">
      <Image
        src={socialImages3d.whatsapp}
        alt={`whatsapp-platform-icon`}
        width={32}
        height={32}
        className="shrink-0 object-contain mr-auto"
      />
      {messages.map((msg, i) => (
        <Button
          key={i}
          variant="outline"
          className="min-w-1/4 text-sm bg-white text-foreground gap-1"
          onClick={() => shareOrCopy(msg)}
        >
          {label} {i + 1}
        </Button>
      ))}
    </div>
  );
}
