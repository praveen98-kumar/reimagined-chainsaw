"use client";

import { Dialog } from "@base-ui/react/dialog";
import type {
  Platform,
  PlatformFormValues,
} from "../_types/manage-platforms.types";
import { PlatformFormCard } from "./platform-form-card";

interface EditPlatformModalProps {
  platform: Platform | null;
  open: boolean;
  onClose: () => void;
  onSave: (values: PlatformFormValues) => void;
  onDelete: () => void;
}

export function EditPlatformModal({
  platform,
  open,
  onClose,
  onSave,
  onDelete,
}: EditPlatformModalProps) {
  if (!platform) return null;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 max-h-[85vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border-2 border-[#2554FF] bg-white shadow-2xl">
          <PlatformFormCard
            key={platform.id}
            mode="edit"
            defaultValues={platform}
            onSubmit={onSave}
            onCancel={onClose}
            onDelete={onDelete}
          />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
