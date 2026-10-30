"use client";

import { Suspense } from "react";
import { AppShell } from "@/components/v2/AppShell";
import { IMAGES } from "@/constants/images";
import { SEVA_PAGE_CONFIG } from "@/constants/roles";

import { SevaFormView } from "./_components/seva-from-view";
import { useSearchParams } from "next/navigation";

function SevaFormPageContent() {
  const searchParams = useSearchParams();
  const isTrendSeva = searchParams?.get("trendSeva") !== null;

  return (
    <AppShell
      title={`${isTrendSeva ? "Trend" : "SM"} Seva From`}
      icon={IMAGES.socialAction}
      sevas={SEVA_PAGE_CONFIG.socialMediaSevaForm}
    >
      <div className="p-4 space-y-4">
        <SevaFormView />
      </div>
    </AppShell>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <AppShell
          title="Seva Form"
          icon={IMAGES.socialAction}
          sevas={SEVA_PAGE_CONFIG.socialMediaSevaForm}
        />
      }
    >
      <SevaFormPageContent />
    </Suspense>
  );
}
