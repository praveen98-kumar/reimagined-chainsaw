"use client";

import { useState } from "react";
import { OrderSevaForm, type OrderType } from "./order-seva-form";
export type { OrderType };
import { ResultDialog } from "@/components/v2/ResultDialog";

interface Props {
  type: OrderType;
  userRoleId?: number;
}

type DialogMode = "success" | "error" | "warn";

export function OrderSevaFormPage({ type, userRoleId }: Props) {
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [resultDialog, setResultDialog] = useState<{
    mode: DialogMode;
    title: string;
    message?: string;
  }>({ mode: "success", title: "", message: undefined });

  return (
    <>
      <OrderSevaForm
        type={type}
        userRoleId={userRoleId}
        onSubmitSuccess={(_data, message) => {
          setResultDialog({
            mode: "success",
            title: "Order Submitted!",
            message,
          });
          setResultDialogOpen(true);
        }}
        onShowResult={(mode, title, message) => {
          setResultDialog({ mode, title, message: message ?? undefined });
          setResultDialogOpen(true);
        }}
      />

      <ResultDialog
        mode={resultDialog.mode}
        title={resultDialog.title}
        description={resultDialog.message}
        open={resultDialogOpen}
        onOpenChange={setResultDialogOpen}
      />
    </>
  );
}
