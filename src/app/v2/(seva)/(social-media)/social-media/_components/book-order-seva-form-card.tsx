"use client";

import Image from "next/image";
import Link from "next/link";
import { CardHeader } from "@/components/ui/card";
import { Card, CardContent, CardTitle } from "@/components/v2/ui/card";
import { cn } from "@/utils/cn";
import { ChevronRight } from "lucide-react";

export default function BookOrderSevaFormCard({
  userRole,
  userRoleId,
}: {
  userRole: string;
  userRoleId: number;
}) {
  return (
    <Card className="rounded-xl overflow-hidden shadow-md p-0 relative bg-white/60">
      {/* HEADER */}
      <CardHeader
        className={cn(
          "flex px-4 py-1.25 flex-row items-center justify-between text-white",
          "bg-linear-to-r from-[#2C0033] to-[#5B036C]",
        )}
      >
        <CardTitle className="font-semibold mb-0">
          Book Order Seva Form
        </CardTitle>

        <Image
          className="absolute top-0.5 right-0"
          src="/icons/v2/Book.svg"
          alt="Book"
          width={44}
          height={44}
        />
      </CardHeader>

      {/* CARDS */}
      <CardContent className="px-3">
        <div className="grid grid-cols-3 gap-2">
          {/* National Regular */}
          <Link
            href={`/v2/social-media/seva/order-seva-form?type=National&userRoleId=${userRoleId}`}
          >
            <div className="bg-white border border-slate-300 rounded-md p-1.5 aspect-square flex flex-col items-center justify-center cursor-pointer hover:shadow-lg">
              <div className="pb-1">National</div>
              <Image
                src="/icons/v2/india-flag.svg"
                alt=""
                width={50}
                height={50}
              />
              <p className="pt-1 text-[14px]">Regular</p>
            </div>
          </Link>

          {/* National Emergency */}
          <Link
            href={`/v2/social-media/seva/order-seva-form?type=Emergency&userRoleId=${userRoleId}`}
          >
            <div className="bg-white border border-slate-300 rounded-md p-1.5 aspect-square flex flex-col items-center justify-center cursor-pointer hover:shadow-lg">
              <div className="pb-1">National</div>
              <div className="relative">
                <Image
                  src="/icons/v2/india-flag.svg"
                  alt=""
                  width={50}
                  height={50}
                />
                <Image
                  src="/icons/v2/emergency-light.svg"
                  alt="Emergency"
                  width={36}
                  height={36}
                  className="absolute -right-1 top-4"
                />
              </div>
              <p className="pt-1 text-[14px]">Emergency</p>
            </div>
          </Link>

          {/* International Regular */}
          <Link
            href={`/v2/social-media/seva/order-seva-form?type=International&userRoleId=${userRoleId}`}
          >
            <div className="bg-white border border-slate-300 rounded-md p-1.5 aspect-square flex flex-col items-center justify-center cursor-pointer hover:shadow-lg">
              <div className="pb-1">International</div>
              <Image src="/icons/v2/world.svg" alt="" width={50} height={50} />
              <p className="pt-1 text-[14px]">Regular</p>
            </div>
          </Link>
        </div>
      </CardContent>

      {/* ORDER LIST */}
      <div className="px-4 pb-4">
        <Link
          href="/v2/social-media/seva/order-list"
          className="bg-linear-to-r from-slate-50 via-slate-100 to-slate-50 rounded-2xl border border-slate-300 shadow-md flex items-center justify-between px-3 py-2"
        >
          <div className="flex items-center gap-3">
            <Image
              src="/icons/v2/file.svg"
              alt="Folder"
              width={32}
              height={32}
            />
            <span className="font-medium text-[16px] text-slate-700">Order List</span>
          </div>
          <ChevronRight className="text-slate-800 size-5" />
        </Link>
      </div>
    </Card>
  );
}
