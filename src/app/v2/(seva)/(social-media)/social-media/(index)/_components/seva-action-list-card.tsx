"use client";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/v2/ui/card";
import { IMAGES } from "@/constants/images";
import { cn } from "@/utils/cn";

const blueIndigoBg = "bg-linear-to-r from-[#06259B] via-[#3B1090] to-[#440251]";

export function SevaActionListCard() {
  return (
    <Card className="rounded-lg bg-white/60 pt-0 gap-2 pb-2">
      <CardHeader
        className={cn(
          "py-1.25 text-white text-center text-xs leading-tight",
          blueIndigoBg,
        )}
      >
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="px-3 gap-0">
        <Link href={"/v2/social-media/manage-sevadar"}>
          <div className="h-12 rounded-lg bg-slate-50 border border-slate-300 flex items-center gap-4 p-4 ">
            <Image
              alt={`manage-sevadar-media`}
              src={IMAGES.addSevadar}
              width={25}
              height={25}
            />
            <p className="text-slate-700 text-lg">Manage Sevadar</p>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
