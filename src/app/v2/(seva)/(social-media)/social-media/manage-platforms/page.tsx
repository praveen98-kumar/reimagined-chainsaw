import { IMAGES } from "@/constants/images";
import { AppShell } from "@/components/v2/AppShell";
import { SEVA_PAGE_CONFIG } from "@/constants/roles";
import { ManagePlatformsView } from "./_components/manage-platforms-view";

export default function ManagePlatformsPage() {
  return (
    <AppShell
      title="Manage Platforms"
      icon={IMAGES.allSocial}
      sevas={SEVA_PAGE_CONFIG.managePlatforms}
    >
      <div className="p-4 space-y-4">
        <ManagePlatformsView />
      </div>
    </AppShell>
  );
}
