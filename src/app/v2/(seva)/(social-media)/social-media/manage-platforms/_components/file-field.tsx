"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/utils/cn";

interface FileFieldProps {
  url?: string;
  name?: string;
  placeholder?: string;
  onChange: (next: { url: string; name: string }) => void;
}

export function FileField({
  url,
  name,
  placeholder = "Select Icon...",
  onChange,
}: FileFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    onChange({ url: URL.createObjectURL(file), name: file.name });
    event.target.value = "";
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#E5E5E5] bg-white px-2.5">
        {url ? (
          <img
            src={url}
            alt={name ?? "icon"}
            className="size-5 shrink-0 rounded object-contain"
          />
        ) : null}
        <span
          className={cn(
            "truncate text-[13px]",
            name ? "text-[#2A2F45]" : "text-[#8A93A8]",
          )}
        >
          {name || placeholder}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex h-9 shrink-0 items-center gap-1 rounded-xl border border-[#E5E5E5] bg-[#F1F5F9] px-3 text-[13px] font-semibold text-[#2A2F45]"
      >
        <Upload className="size-3.5" />
        Choose File
      </button>
    </div>
  );
}
