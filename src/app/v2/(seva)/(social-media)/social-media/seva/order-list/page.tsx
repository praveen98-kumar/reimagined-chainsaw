"use client";

import dayjs from "dayjs";
import { useCallback, useMemo, useState } from "react";
import { BookOrderCard } from "@/app/v2/(seva)/(social-media)/social-media/_components/book-order-card";
import { AppShell } from "@/components/v2/AppShell";
import { PaginatedList } from "@/components/v2/ui/list";
import { IMAGES } from "@/constants/images";
import { SEVA_PAGE_CONFIG } from "@/constants/roles";
import { useGetOrdersList } from "@/query-options/queries/get-orders";

import { objectWithValues } from "@/shared/functions/utils";
import type { OrderIn } from "@/shared/interfaces/order-in-card";
import { BottomSheet } from "@/components/v2/BottomSheet";
import {
  OrderSevaForm,
  type OrderType,
} from "../order-seva-form/order-seva-form";
import { useAppSelector } from "@/redux/store";
import { ResultDialog } from "@/components/v2/ResultDialog";
import { useActiveLocationContext } from "@/hooks/useActiveLocationContext";
import { useSevaContext } from "@/hooks/useSevaContext";

const BookIdToImageMap: Record<number, any> = {
  1: IMAGES.jkr,
  2: IMAGES.gg,
  4: IMAGES.gg,
};

const BOOK_ORDER_PERMISSIONS = ["book_order_seva", "create_book_order"];

export default function BookOrderList() {
  useSevaContext("book_order", BOOK_ORDER_PERMISSIONS);
  const { user } = useAppSelector((state) => state.auth);
  const location = useActiveLocationContext();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [resultDialog, setResultDialog] = useState<{
    mode: "success" | "error" | "warn";
    title: string;
    message?: string;
  }>({ mode: "success", title: "", message: undefined });

  const params = useMemo(
    () =>
      objectWithValues({
        from_date: dayjs().subtract(24, "hour").startOf("day").toISOString(),
        to_date: dayjs().toISOString(),
        created_by: user?.id,
        ...(location?.params ?? {}),
      }),
    [user?.id, location?.key, location?.params],
  );

  const {
    data: ordersList,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useGetOrdersList(params, {
    enabled: Boolean(location),
  });

  const orderItems = ordersList?.pages.flatMap((page) => page.data) ?? [];

  const renderItem = useCallback((item: OrderIn) => {
    const type = item?.national
      ? item?.emergency
        ? "national_emergency"
        : "national_regular"
      : "international_regular";
    return (
      <BookOrderCard
        key={item.id}
        type={type}
        mode={type.includes("emergency") ? "Emergency" : "Regular"}
        createdOn={item.order_at}
        name={item.name}
        phone={item.mobile_no}
        address={[item.message]}
        imgSrc={BookIdToImageMap[item.book_id as number] ?? IMAGES.gg}
        book={item.book_name}
        onEdit={() => {
          setSelectedOrder(item);
          setBottomSheetOpen(true);
        }}
      />
    );
  }, []);

  const selectedOrderType: OrderType = useMemo(() => {
    if (!selectedOrder) return "National";
    if (selectedOrder.emergency) return "Emergency";
    if (!selectedOrder.national) return "International";
    return "National";
  }, [selectedOrder]);

  return (
    <AppShell
      title="Order List"
      icon={IMAGES.file}
      sevas={SEVA_PAGE_CONFIG.bookOrderList}
    >
      <div className="space-y-4 px-4 py-4">
        <PaginatedList
          items={orderItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          fetchNextPage={fetchNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      </div>

      <BottomSheet
        open={bottomSheetOpen}
        onClose={() => setBottomSheetOpen(false)}
        title="Edit Order"
      >
        {selectedOrder && (
          <OrderSevaForm
            type={selectedOrderType}
            isEdit
            order={selectedOrder}
            clearFormOnSuccess={false}
            onClose={() => setBottomSheetOpen(false)}
            onShowResult={(mode, title, message) => {
              setBottomSheetOpen(false);
              setResultDialog({ mode, title, message: message ?? undefined });
              setResultDialogOpen(true);
            }}
          />
        )}
      </BottomSheet>

      <ResultDialog
        mode={resultDialog.mode}
        title={resultDialog.title}
        description={resultDialog.message}
        open={resultDialogOpen}
        onOpenChange={(open) => {
          setResultDialogOpen(open);
          if (!open) {
            refetch();
          }
        }}
      />
    </AppShell>
  );
}
