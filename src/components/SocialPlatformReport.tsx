import Image from "next/image";
import { socialImages } from "@/constants/images";
import { useSMPlatformReport } from "@/hooks/useSMPlatformReport";
import { SOCIAL_MEDIA_TITLE_MAPPER } from "@/utils/social_whatsapp_msg.utils";

function formatValue(value: string | number) {
  return value.toString().padStart(2, "0");
}

export function SocialPlatformReport() {
  const { platforms, total_sevadar } = useSMPlatformReport();
  return (
    <div>
      <h1 className="text-sm uppercase font-bold">Platform Report</h1>
      <div className="border rounded p-1 space-y-1">
        {platforms.map(({ platform, count }) => (
          <div
            key={platform}
            className="flex items-center justify-between p-1 border rounded-md"
          >
            <div className="flex items-center gap-2">
              <Image
                height={28}
                width={28}
                style={{ width: "32px", height: "auto" }}
                src={socialImages[platform || "facebook"]}
                alt={`facebook_satsang_seva_alt_image`}
                className="cursor-pointer max-h-8 w-auto h-auto"
                priority
              />
              <p className="text-md font-bold capitalize">
                {SOCIAL_MEDIA_TITLE_MAPPER[platform]}
              </p>
            </div>
            <div className="text-xl font-semibold">
              <span className="text-green-400">{formatValue(count)}</span>
              <span>/{total_sevadar}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
