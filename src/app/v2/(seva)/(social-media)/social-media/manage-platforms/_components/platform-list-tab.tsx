"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { useMockPlatformStore } from "../_store/useMockPlatformStore";
import type {
  Platform,
  PlatformFormValues,
} from "../_types/manage-platforms.types";
import { buildPlatform } from "../_utils/platform.schema";
import { EditPlatformModal } from "./edit-platform-modal";
import { PlatformListCard } from "./platform-list-card";

export function PlatformListTab() {
  const platforms = useMockPlatformStore((state) => state.platforms);
  const { updatePlatform, removePlatform } = useMockPlatformStore(
    (state) => state.actions,
  );
  const [selected, setSelected] = useState<Platform | null>(null);

  const handleEdit = useCallback((platform: Platform) => {
    setSelected(platform);
  }, []);

  const handleSave = useCallback(
    (values: PlatformFormValues) => {
      if (!selected) return;
      updatePlatform(selected.id, buildPlatform(values, { id: selected.id }));
      setSelected(null);
      toast.success("Platform updated");
    },
    [selected, updatePlatform],
  );

  const handleDelete = useCallback(() => {
    if (!selected) return;
    removePlatform(selected.id);
    setSelected(null);
    toast.success("Platform deleted");
  }, [selected, removePlatform]);

  if (platforms.length === 0) {
    return (
      <div className="rounded-2xl bg-white/70 px-4 py-10 text-center text-sm text-[#8A93A8] shadow-md">
        No platforms yet
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {platforms.map((platform) => (
          <PlatformListCard
            key={platform.id}
            platform={platform}
            onEdit={handleEdit}
          />
        ))}
      </div>

      <EditPlatformModal
        platform={selected}
        open={selected !== null}
        onClose={() => setSelected(null)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </>
  );
}
