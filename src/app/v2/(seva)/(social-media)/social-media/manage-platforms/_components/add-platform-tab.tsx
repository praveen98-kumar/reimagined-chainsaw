"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  createPlatformId,
  useMockPlatformStore,
} from "../_store/useMockPlatformStore";
import type { PlatformFormValues } from "../_types/manage-platforms.types";
import { buildPlatform } from "../_utils/platform.schema";
import { PlatformFormCard } from "./platform-form-card";

export function AddPlatformTab() {
  const addPlatform = useMockPlatformStore(
    (state) => state.actions.addPlatform,
  );
  const [formKey, setFormKey] = useState(0);

  const handleSubmit = (values: PlatformFormValues) => {
    addPlatform(buildPlatform(values, { id: createPlatformId() }));
    toast.success("Platform added");
  };

  return (
    <PlatformFormCard
      key={formKey}
      mode="create"
      onSubmit={handleSubmit}
      onCancel={() => setFormKey((key) => key + 1)}
    />
  );
}
