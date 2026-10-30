"use client";
import { Can } from "@/components/v2/Can";
import { IMAGES } from "@/constants/images";
import { SEVA_PAGE_CONFIG } from "@/constants/roles";
import { BookOrderSevaStatusCard } from "../_components/book-order-seva-status-card";
import { SocialMediaSevaStatusCard } from "./_components/social-media-seva-status-card";
import { AppShell } from "@/components/v2/AppShell";

export default function Page() {
  return (
    <AppShell
      title="Social Media Seva"
      icon={IMAGES.allSocial}
      sevas={SEVA_PAGE_CONFIG.socialMediaDashboard}
    >
      <div className="p-4 space-y-4">
        <Can
          sevaType="social_media"
          permissions="social_media_seva"
          render={({ userRole, userRoleId, roleRegion, region }) => (
            <SocialMediaSevaStatusCard
              {...{ userRole, userRoleId, roleRegion, region }}
            />
          )}
        />
        <Can
          sevaType="book_order"
          permissions="book_order_seva"
          render={({ userRole, userRoleId, roleRegion, region }) => (
            <BookOrderSevaStatusCard
              {...{ userRole, userRoleId, roleRegion, region }}
            />
          )}
        />
      </div>
    </AppShell>
  );
}
