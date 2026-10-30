import { CardHeader } from "@/components/ui/card";
import { Card, CardContent, CardTitle } from "@/components/v2/ui/card";
import { cn } from "@/shared/functions/utils";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const listItems = [
  {
    url: "/v2/social-media/manage-sevadar",
    title: "Manage Sevadar",
    imageSource: "/icons/v2/add-sevadar.svg",
  },
  {
    url: "/v2/social-media/manage-questions",
    title: "Manage Questions",
    imageSource: "/icons/v2/questions.svg",
  },
  {
    url: "/v2/social-media/daily-questions",
    title: "Daily Questions",
    imageSource: "/icons/v2/questions.svg",
  },
  {
    url: "/v2/social-media/manage-platforms",
    title: "Manage Platforms",
    imageSource: "/icons/v2/platforms.svg",
  },
];

export default function ActionsCard() {
  return (
    <Card className="rounded-xl overflow-hidden shadow-md p-0 relative bg-white/60">
      {/* HEADER */}
      <CardHeader
        className={cn(
          "px-4 py-1.25 text-white text-center",
          "bg-linear-to-r from-[#06259B] via-[#3B1090] to-[#440251]",
        )}
      >
        <CardTitle className="font-semibold mb-0 text-center">
          Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-4">
        <ul className="space-y-1.5">
          {listItems.map(({ url, title, imageSource }) => (
            <li key={url}>
              <Link
                href={url}
                className="bg-linear-to-r from-slate-50 via-slate-100 to-slate-50 rounded-2xl border border-slate-300 shadow-md flex items-center justify-between px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <Image src={imageSource} alt={title} width={32} height={32} />
                  <span className="font-medium text-[16px] text-slate-700">
                    {title}
                  </span>
                </div>
                <ChevronRight className="text-slate-800 size-5" />
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
