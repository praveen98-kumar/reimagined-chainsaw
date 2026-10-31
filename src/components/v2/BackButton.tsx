"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { ArrowLeftIcon } from "lucide-react";

export function BackButton() {
  const router = useRouter();
  const handleBack = () => {
    router.back();
  };
  return (
    <Button
      onClick={handleBack}
      className="absolute left-4 flex size-11 items-center justify-center rounded-full bg-white text-brand-ink shadow-[0_8px_20px_-6px_rgba(76,29,149,0.35)]"
      variant={"ghost"}
      size={"icon-lg"}
    >
      <ArrowLeftIcon className="size-6" />
    </Button>
  );
}
