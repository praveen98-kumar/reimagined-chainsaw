"use client";

import { memo, useCallback, useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/v2/ui/button";
import { AllotSevadarForm } from "./allot-sevadar-form";

interface AddRoleButtonProps {
  user: any;
  onSuccess?: () => void;
}

const AddRoleButtonInner = ({ user, onSuccess }: AddRoleButtonProps) => {
  const [open, setOpen] = useState(false);

  const handleCancel = useCallback(() => setOpen(false), []);
  const handleSuccess = useCallback(() => {
    setOpen(false);
    onSuccess?.();
  }, [onSuccess]);

  if (open) {
    return (
      <AllotSevadarForm
        user={user}
        onCancel={handleCancel}
        onSuccess={handleSuccess}
      />
    );
  }

  return (
    <Button
      type="button"
      onClick={() => setOpen(true)}
      variant="outline"
      className="w-full rounded-lg text-lg text-slate-500 font-semibold"
    >
      <PlusCircle className="size-4" />
      Add Role
    </Button>
  );
};

export const AddRoleButton = memo(AddRoleButtonInner);
