"use client";
import { Can } from "@/components/v2/Can";
import { PageHeader } from "@/components/v2/PageHeader";
import { IMAGES } from "@/constants/images";
import { BookOrderSevaStatusCard } from "../_components/book-order-seva-status-card";
import { SocialMediaSevaStatusCard } from "./_components/social-media-seva-status-card";

export default function Page() {
  return (
    <>
      <PageHeader title="Social Media Seva" icon={IMAGES.allSocial} />
      <div className="p-4 space-y-4">
        <Can
          sevadarType="social_media"
          permissions="social_media_seva"
          render={({ userRole, userRoleId }) => (
            <SocialMediaSevaStatusCard {...{ userRole, userRoleId }} />
          )}
        />
        <Can
          sevadarType="book_order"
          permissions="book_order_seva"
          render={({ userRole, userRoleId }) => (
            <BookOrderSevaStatusCard {...{ userRole, userRoleId }} />
          )}
        />
      </div>
    </>
  );
}
