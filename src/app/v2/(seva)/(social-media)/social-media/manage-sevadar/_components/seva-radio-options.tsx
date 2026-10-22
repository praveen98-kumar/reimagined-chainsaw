"use client";
import type { Dispatch, SetStateAction } from "react";
import { useId } from "react";
import { Checkbox } from "@/components/v2/ui/checkbox";
import { Label } from "@/components/v2/ui/label";
import { CheckboxGroup } from "@base-ui/react";

const roleIds = [53, 25, 0]; // social_media_sevadar, book_order_sevadar, trend_sevadar

export function SevaRadioOptions({
  sevaGroup,
  setSevaGroup,
}: {
  sevaGroup: string[];
  setSevaGroup: Dispatch<SetStateAction<string[]>>;
}) {
  const id = useId();
  return (
    <div className="bg-slate-200 px-3 py-2 rounded-lg">
      <CheckboxGroup
        onValueChange={setSevaGroup}
        id={id}
        value={sevaGroup}
        allValues={roleIds.map((r) => r.toString())}
      >
        <div className=" grid grid-cols-2 gap-2">
          <Label className="flex items-center text-xs gap-2">
            <Checkbox name="seva-options" value={roleIds[0].toString()} />
            Social Media Seva
          </Label>
          <Label className="flex items-center text-xs gap-2">
            <Checkbox name="seva-options" value={roleIds[1].toString()} />
            Book Order Seva
          </Label>
          <Label className="flex items-center text-xs gap-2">
            <Checkbox name="seva-options" value={roleIds[2].toString()} />
            Trend Seva
          </Label>
        </div>
      </CheckboxGroup>
    </div>
  );
}
