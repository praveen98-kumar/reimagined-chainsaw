"use client";
import { Button, buttonVariants } from "@/components/v2/ui/button";
import { cn } from "@/utils/cn";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/v2/ui/alert-dialog";
import Image from "next/image";
import { useState } from "react";
import { LocationInputs } from "@/components/v2/LocationInputs";
import apiClient from "@/http";

const RemoveAlertDialog = ({ roleId }: { roleId: number }) => {
  const [open, setOpen] = useState(false);
  const removeExistingRole = async () => {
    try {
      await apiClient.delete(`remove_user_role/${roleId}`);
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={<Button variant="cancel" className={"font-semibold"} />}
      >
        Remove
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <Image
            width={40}
            height={40}
            src={"/icons/v2/warning3d.svg"}
            alt="warning"
          />
          <AlertDialogTitle
            style={{ color: "#FFCC00" }}
            className="text-[#FFCC00] text-2xl font-bold"
          >
            Are you sure?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to assign “Vikas Das s/o Father’s Name” SM
            Seva of Tehsil “Pune City” under Team Leader “Vikas Das s/o
            averybigname”?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="bg-white border-none pt-0 flex items-center flex-row justify-center">
          <AlertDialogAction
            onClick={removeExistingRole}
            variant="submit"
            className="w-1/3"
          >
            Continue
          </AlertDialogAction>
          <AlertDialogCancel variant="cancel" className="w-1/3">
            Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

interface AssignSevadarItemProps {
  roleId?: number;
  role: string;
  title?: string;
  children?: React.ReactNode;
  onAssign?: (data: { tehsil_id: number; roles: number[] }) => void;
}

function getSevaShortName(sevadarType: string) {
  switch (sevadarType) {
    case "social_media_sevadar":
      return "sm seva";
    case "book_order_sevadar":
      return "book order";
    case "trend_sevadar":
      return "trend seva";
    default:
      return "";
  }
}

export function AssignSevadarItem({
  role,
  title,
  children,
  onAssign,
  roleId,
}: AssignSevadarItemProps) {
  const [toggle, setToggle] = useState(false);
  const [formData, setFormData] = useState<Record<string, number>>({});
  return (
    <div className="bg-slate-200 p-0.5 rounded-lg space-y-0.5">
      <div className="flex items-center gap-1 text-xs">
        <div
          className={cn(
            buttonVariants({
              variant: "ghost",
              className:
                "bg-white uppercase text-[10px] font-bold text-slate-700",
            }),
          )}
        >
          {getSevaShortName(role)}
        </div>
        <div className="font-medium text-xs leading-2.5 flex-1 text-slate-500">
          {title ?? "Unassigned"}
        </div>
        <div>
          {onAssign ? (
            <Button
              variant="submit"
              onClick={() => setToggle((prev) => !prev)}
              className={cn("font-semibold", {
                hidden: toggle,
              })}
            >
              Assign
            </Button>
          ) : (
            <RemoveAlertDialog roleId={roleId as number} />
          )}
        </div>
      </div>
      {toggle && (
        <div className="space-y-1">
          <LocationInputs
            onChangeAction={(data) =>
              setFormData((prev) => ({ ...prev, ...data }))
            }
          />
          <div className="flex items-center">
            <Button
              onClick={() =>
                roleId &&
                onAssign?.({
                  tehsil_id: formData.tehsil_id,
                  roles: [roleId],
                })
              }
              variant={"submit"}
              size={"lg"}
              className={"flex-1 text-lg"}
            >
              Add Sevadar
            </Button>
            <Button
              onClick={() => setToggle(false)}
              variant={"cancel"}
              size={"lg"}
              className={"flex-1 text-lg"}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
