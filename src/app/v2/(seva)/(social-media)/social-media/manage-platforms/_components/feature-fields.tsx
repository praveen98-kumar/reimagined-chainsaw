"use client";

import { X } from "lucide-react";
import { useFormikContext } from "formik";
import { Input } from "@/components/v2/ui/input";
import { Label } from "@/components/v2/ui/label";
import type {
  PlatformFeatureValues,
  PlatformFormValues,
} from "../_types/manage-platforms.types";
import { FileField } from "./file-field";

interface FeatureFieldsProps {
  index: number;
  onRemove: () => void;
}

export function FeatureFields({ index, onRemove }: FeatureFieldsProps) {
  const { values, setFieldValue } = useFormikContext<PlatformFormValues>();
  const feature = values.features[index];

  const update = (patch: Partial<PlatformFeatureValues>) =>
    setFieldValue(
      "features",
      values.features.map((item, position) =>
        position === index ? { ...item, ...patch } : item,
      ),
    );

  if (!feature) return null;

  return (
    <div className="relative space-y-2 rounded-xl border border-[#2554FF]/50 bg-[#EEF4FF] p-2.5 pr-8">
      <button
        type="button"
        aria-label="Remove feature"
        onClick={onRemove}
        className="absolute top-2 right-2 text-[#8A93A8] transition-colors hover:text-[#DC2626]"
      >
        <X className="size-4" />
      </button>

      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-1">
          <Label className="text-[11px] text-[#8A93A8]">
            Platform Feature Title
          </Label>
          <Input
            value={feature.title}
            onChange={(event) => update({ title: event.target.value })}
            placeholder="Enter Feature Title"
            className="h-9 rounded-xl border-[#E5E5E5] bg-white"
          />
        </div>
        <div className="w-24 space-y-1">
          <Label className="text-[11px] text-[#2554FF]">Sequence Number</Label>
          <Input
            value={feature.sequence}
            onChange={(event) => update({ sequence: event.target.value })}
            placeholder="Enter No."
            inputMode="numeric"
            className="h-9 rounded-xl border-[#E5E5E5] bg-white"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-[11px] text-[#8A93A8]">Feature Icon</Label>
        <FileField
          url={feature.icon}
          name={feature.iconName}
          onChange={({ url, name }) => update({ icon: url, iconName: name })}
        />
      </div>
    </div>
  );
}
