"use client";

import { PageHeader } from "@/components/v2/PageHeader";
import { IMAGES } from "@/constants/images";
import { AllotSevadarPageComponent } from "./_components/allot-sevadar-component";

export default function Page() {
  return (
    <>
      <PageHeader
        title="Manage Sevadar"
        icon={IMAGES.addSevadar}
      />
      <AllotSevadarPageComponent />
    </>
  );
}
