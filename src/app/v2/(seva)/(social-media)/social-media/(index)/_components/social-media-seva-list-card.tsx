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

const blueBg = "bg-linear-to-r from-[#000c45] to-[#0C3BE3]";

export function SocialMediaSevaListCard() {
  return (
    <Card
      aria-label="social-media-seva-form"
      className="rounded-lg bg-white/60 pt-0 gap-2 pb-2"
    >
      <CardHeader
        className={cn(
          "relative py-1.25 text-white text-xs leading-tight flex items-center justify-between",
          blueBg,
        )}
      >
        <CardTitle className="font-semibold mb-0">
          Social Media Seva Form
        </CardTitle>
        <Image
          className="absolute top-3 right-2"
          src={"/icons/v2/social-media-update.svg"}
          alt="Social media update"
          width={30}
          height={30}
        />
      </CardHeader>
      <CardContent className="px-3 gap-0">
        <div className="grid grid-cols-3 gap-2">
          <Link href={"/v2/social-media/seva-form"}>
            <div className="bg-white rounded-md p-1.5 aspect-square flex flex-col items-center justify-center">
              <Image
                alt={`sm-seva-media`}
                src={IMAGES.socialAction}
                width={50}
                height={50}
              />
              <p className="text-slate-800 text-[14px]">SM Seva</p>
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
