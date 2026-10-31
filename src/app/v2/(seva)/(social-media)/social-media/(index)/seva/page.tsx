"use client";
import { Can } from "@/components/v2/Can";
import { IMAGES } from "@/constants/images";
import { SEVA_PAGE_CONFIG } from "@/constants/roles";
import BookOrderSevaFormCard from "../../_components/book-order-seva-form-card";
import { SocialMediaSevaListCard } from "../_components/social-media-seva-list-card";
import { TrendSevaListCard } from "../_components/trend-seva-list-card";
import { AppShell } from "@/components/v2/AppShell";
// import ActionsCard from "../../_components/actions-card";

export default function Page() {
  return (
    <AppShell
      title="Social Media Seva"
      icon={IMAGES.allSocial}
      sevas={SEVA_PAGE_CONFIG.socialMediaSeva}
    >
      <div className="p-4 space-y-4">
        <Can roleId={53} permissions="social_media_seva">
          <SocialMediaSevaListCard />
        </Can>
        <Can
          sevaType="trend_seva"
          permissions="trend_seva"
          render={({ userRole, userRoleId }) => (
            <TrendSevaListCard {...{ userRole, userRoleId }} />
          )}
        />
        <Can
          sevaType="book_order"
          permissions="create_book_order"
          render={({ userRole, userRoleId }) => (
            <BookOrderSevaFormCard {...{ userRole, userRoleId }} />
          )}
        />

        {/*<ActionsCard />*/}
      </div>
    </AppShell>
  );
}
