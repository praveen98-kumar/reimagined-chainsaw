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
      className="cursor-pointer absolute left-3"
      variant={"ghost"}
      size={"icon-lg"}
    >
      <ArrowLeftIcon className="size-6" />
    </Button>
  );
}
