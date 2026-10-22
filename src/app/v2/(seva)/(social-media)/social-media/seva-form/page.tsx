"use client";

import { Suspense } from "react";
import { PageHeader } from "@/components/v2/PageHeader";
import { IMAGES } from "@/constants/images";

import { SevaFormView } from "./_components/seva-from-view";
import { useSearchParams } from "next/navigation";

function SevaFormPageContent() {
  const searchParams = useSearchParams();
  const isTrendSeva = searchParams?.get("trendSeva") !== null;

  return (
    <>
      <PageHeader
        title={`${isTrendSeva ? "Trend" : "SM"} Seva From`}
        icon={IMAGES.socialAction}
      />
      <div className="p-4 space-y-4">
        <SevaFormView />
      </div>
    </>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <PageHeader
          title="Seva Form"
          icon={IMAGES.socialAction}
        />
      }
    >
      <SevaFormPageContent />
    </Suspense>
  );
}
