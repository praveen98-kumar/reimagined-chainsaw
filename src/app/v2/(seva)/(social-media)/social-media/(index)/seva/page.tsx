"use client";
import { Can } from "@/components/v2/Can";
import { PageHeader } from "@/components/v2/PageHeader";
import { IMAGES } from "@/constants/images";
import BookOrderSevaFormCard from "../../_components/book-order-seva-form-card";
import { SocialMediaSevaListCard } from "../_components/social-media-seva-list-card";
import { TrendSevaListCard } from "../_components/trend-seva-list-card";

export default function Page() {
  return (
    <>
      <PageHeader title="Social Media Seva" icon={IMAGES.allSocial} />
     <div className="p-4 space-y-2">
        <Can roleId={53} permissions="social_media_seva">
          <SocialMediaSevaListCard />
        </Can>
        <Can
          sevadarType="trend_seva"
          permissions="trend_seva"
          render={({ userRole, userRoleId }) => (
            <TrendSevaListCard {...{ userRole, userRoleId }} />
          )}
        />
        <Can
          sevadarType="book_order"
          permissions="create_book_order"
          render={({ userRole, userRoleId }) => (
            <BookOrderSevaFormCard {...{ userRole, userRoleId }} />
          )}
        />
      </div>  
    </>
  );
}
