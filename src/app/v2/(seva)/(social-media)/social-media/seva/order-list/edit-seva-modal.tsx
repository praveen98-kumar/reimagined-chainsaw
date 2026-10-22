"use client";

import { Dialog } from "@base-ui/react/dialog";
import { OrderSevaForm } from "@/app/v2/(seva)/(social-media)/social-media/seva/order-seva-form/order-seva-form";
import {
  OrderSevaKey,
  orderSevaConfig,
} from "@/app/v2/(seva)/(social-media)/social-media/seva/order-seva-form/order-seva-config";
import { notFound } from "next/navigation";

function isOrderSevaKey(value: string): value is OrderSevaKey {
  return [
    "national_regular",
    "national_emergency",
    "international_regular",
  ].includes(value);
}

export function EditSevaModal({ open, onClose, order, type }: any) {
  if (!order) return null;

  const keyParam = order.type;

  if (!keyParam || !isOrderSevaKey(keyParam)) {
    notFound();
  }

  const key: OrderSevaKey = keyParam;
  const config = orderSevaConfig[key];

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/40 z-50" />

        <Dialog.Popup className="fixed z-50 bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md bg-white rounded-[28px] shadow-2xl max-h-[80vh] overflow-y-auto">
          <div className="px-4 pt-2 pb-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[26px] font-normal text-slate-900 h-8">
                  Edit Order
                </p>
                <p className="text-sm text-slate-700 capitalize">
                  {order.type.replace("_", " ")}
                </p>
              </div>

              <Dialog.Close className="w-6 h-6 rounded-full border-2 border-slate-700 flex items-center justify-center text-[#334155] font-bold hover:bg-slate-100">
                ✕
              </Dialog.Close>
            </div>
          </div>

          <OrderSevaForm type={type} />

          {/* FOOTER */}
          <div className="p-4 border-t flex gap-3">
            <button className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl py-2 font-semibold">
              Submit
            </button>

            <Dialog.Close className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl py-2 font-semibold">
              Cancel
            </Dialog.Close>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
