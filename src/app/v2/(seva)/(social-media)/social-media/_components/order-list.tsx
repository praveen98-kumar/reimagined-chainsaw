"use client";

import { Card } from "@/components/v2/ui/card";
import { BookOrderCard } from "@/app/v2/(seva)/(social-media)/social-media/_components/book-order-card";
import { IMAGES } from "@/constants/images";
import { SEVA_PAGE_CONFIG } from "@/constants/roles";
import { PageHeader } from "@/components/v2/PageHeader";

export default function BookOrderList() {
  return (
    <>
      <PageHeader
        title="Order List"
        icon={IMAGES.file}
        sevas={SEVA_PAGE_CONFIG.bookOrderList}
      />
      <Card className="rounded-xl overflow-hidden shadow-md p-0 pb-2 relative bg-white/60">
        {/* EXPANDED LIST */}
      </Card>
    </>
  );
}
