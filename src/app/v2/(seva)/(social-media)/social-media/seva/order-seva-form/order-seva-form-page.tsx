"use client";

import { useState } from "react";
import { OrderSevaForm, type OrderType } from "./order-seva-form";
export type { OrderType };
import { ResultDialog } from "@/components/v2/ResultDialog";
import { useSevaContext } from "@/hooks/useSevaContext";

interface Props {
  type: OrderType;
  userRoleId?: number;
}

type DialogMode = "success" | "error" | "warn";

const BOOK_ORDER_PERMISSIONS = ["book_order_seva", "create_book_order"];

export function OrderSevaFormPage({ type, userRoleId }: Props) {
  const bookOrderMatch = useSevaContext("book_order", BOOK_ORDER_PERMISSIONS);
  const currentUserRoleId = bookOrderMatch?.userRoleId ?? userRoleId;
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [resultDialog, setResultDialog] = useState<{
    mode: DialogMode;
    title: string;
    message?: string;
  }>({ mode: "success", title: "", message: undefined });

  return (
    <>
      <OrderSevaForm
        key={currentUserRoleId ?? "pending"}
        type={type}
        userRoleId={currentUserRoleId}
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
