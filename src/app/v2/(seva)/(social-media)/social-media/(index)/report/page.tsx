"use client";

import { PageHeader } from "@/components/v2/PageHeader";
import { IMAGES } from "@/constants/images";
import { ReportFilters } from "./_components/report-filters";
import { ReportResults } from "./_components/report-results";

export default function Page() {
  return (
    <>
      <PageHeader title="Social Media Seva" icon={IMAGES.allSocial} />
      <div className="p-4 space-y-4">
        <ReportFilters />
        <ReportResults />
      </div>
    </>
  );
}
