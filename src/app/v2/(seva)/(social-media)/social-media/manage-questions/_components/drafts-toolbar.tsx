"use client";

import { useEffect, useState } from "react";
import { Filter, Search } from "lucide-react";
import { Input } from "@/components/v2/ui/input";
import { useDebounce } from "@/hooks/useDebounce";

interface DraftsToolbarProps {
  onSearch: (term: string) => void;
  onFilterClick?: () => void;
  delay?: number;
}

export function DraftsToolbar({
  onSearch,
  onFilterClick,
  delay = 300,
}: DraftsToolbarProps) {
  const [term, setTerm] = useState("");
  const debouncedTerm = useDebounce(term, delay);

  useEffect(() => {
    onSearch(debouncedTerm);
  }, [debouncedTerm, onSearch]);

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search Keyword..."
          className="h-10 rounded-xl border-[#E5E5E5] bg-white pr-12"
        />
        <button
          type="button"
          aria-label="Search"
          className="absolute top-1 right-1 flex size-8 items-center justify-center rounded-lg bg-[#2554FF] text-white"
        >
          <Search className="size-4" />
        </button>
      </div>
      <button
        type="button"
        aria-label="Filter"
        onClick={onFilterClick}
        className="flex size-10 items-center justify-center rounded-xl bg-white text-[#0B1A6B] shadow-[0_2px_8px_rgba(24,35,90,0.08)]"
      >
        <Filter className="size-4" />
      </button>
    </div>
  );
}
