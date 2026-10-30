"use client";

import { useState } from "react";
import { Tabs, TabsContent } from "@/components/v2/ui/tabs";
import type { PlatformTab } from "../_types/manage-platforms.types";
import { AddPlatformTab } from "./add-platform-tab";
import { PlatformListTab } from "./platform-list-tab";
import { PlatformTabs } from "./platform-tabs";

export function ManagePlatformsView() {
  const [tab, setTab] = useState<PlatformTab>("add");

  return (
    <Tabs
      value={tab}
      onValueChange={(value: PlatformTab) => setTab(value)}
      className="flex-col"
    >
      <PlatformTabs />
      <TabsContent value="add">
        <AddPlatformTab />
      </TabsContent>
      <TabsContent value="list">
        <PlatformListTab />
      </TabsContent>
    </Tabs>
  );
}
