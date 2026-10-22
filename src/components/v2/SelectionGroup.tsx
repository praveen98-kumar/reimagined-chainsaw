import type React from "react";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

interface SelectionItemProps {
  id: string;
  name: string;
  label: string;
  value: string | number;
  checked?: boolean;
  onChange: (value: string | number) => void;
}

export const SelectionItem: React.FC<SelectionItemProps> = ({
  id,
  name,
  label,
  value,
  checked,
  onChange,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={id}
        name={name}
        checked={checked}
        onCheckedChange={() => onChange(value)}
      />
      <Label htmlFor={id} className="text-base cursor-pointer">
        {label}
      </Label>
    </div>
  );
};

interface SelectionGroupProps {
  title: string;
  items: { label: string; value: string | number }[];
  name: string;
  value: string | number;
  onChange: (value: string | number) => void;
  required?: boolean;
  columns?: number;
}

export const SelectionGroup: React.FC<SelectionGroupProps> = ({
  title,
  items,
  name,
  value,
  onChange,
  required,
  columns = 2,
}) => {
  return (
    <div className="flex flex-col gap-2 px-4 py-1.5 pb-2">
      <h3 className="text-lg text-slate-800 flex items-center">
        {title}
        {required && <span className="text-red-400 text-[28px]">*</span>}
      </h3>
      <div className={`grid grid-cols-${columns} gap-y-2 gap-x-4`}>
        {items.map((item) => (
          <SelectionItem
            key={item.value}
            id={`${name}-${item.value}`}
            name={name}
            label={item.label}
            value={item.value}
            checked={String(item.value) === String(value)}
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  );
};
