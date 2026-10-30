"use client";

import { AppShell } from "@/components/v2/AppShell";
import { IMAGES } from "@/constants/images";
import { SEVA_PAGE_CONFIG } from "@/constants/roles";
import { AllotSevadarPageComponent } from "./_components/allot-sevadar-component";

export default function Page() {
  return (
    <AppShell
      title="Manage Sevadar"
      icon={IMAGES.addSevadar}
      sevas={SEVA_PAGE_CONFIG.manageSevadar}
    >
      <AllotSevadarPageComponent />
    </AppShell>
  );
}
