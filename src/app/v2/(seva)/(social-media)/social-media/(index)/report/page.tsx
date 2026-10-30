"use client";

import { AppShell } from "@/components/v2/AppShell";
import { IMAGES } from "@/constants/images";
import { SEVA_PAGE_CONFIG } from "@/constants/roles";
import { useEnsureActiveContext } from "@/hooks/useEnsureActiveContext";
import { ReportFilters } from "./_components/report-filters";
import { ReportResults } from "./_components/report-results";

export default function Page() {
  useEnsureActiveContext(SEVA_PAGE_CONFIG.socialMediaReport);

  return (
    <AppShell
      title="Social Media Seva"
      icon={IMAGES.allSocial}
      sevas={SEVA_PAGE_CONFIG.socialMediaReport}
    >
      <div className="p-4 space-y-4">
        <ReportFilters />
        <ReportResults />
      </div>
    </AppShell>
  );
}
