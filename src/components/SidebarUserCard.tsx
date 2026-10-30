import { MdCalendarToday, MdLocationOn, MdPhone } from "react-icons/md";

import Avatar from "@/components/Avatar";
import { formatDate } from "@/shared/functions/utils";
import type { Disciple } from "@/shared/interfaces/user";

interface SidebarUserCardProps {
  disciple: Disciple;
}

/** Light user card shown at the top of the sidebar (Saffron & Ivory). */
const SidebarUserCard: React.FC<SidebarUserCardProps> = ({ disciple }) => {
  const fullName = [disciple?.name, disciple?.relation, disciple?.guardian_name]
    .filter(Boolean)
    .join(" ");
  const address = [
    disciple?.tehsil?.name,
    disciple?.district?.name,
    disciple?.state?.name,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex items-start gap-1 rounded-[22px] border border-orange-200 bg-gradient-to-b from-orange-50 to-amber-50 px-3 py-3.5 shadow-[0_6px_16px_rgba(154,52,18,0.12)]">
      <div className="-mx-1 shrink-0">
        <Avatar
          label={disciple?.status}
          showLabel={false}
          containerSize="h-12 w-12"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="break-words pr-9 text-[15px] font-bold uppercase leading-tight text-[#9a3412]">
          {fullName}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[13px] text-[#7c2d12]">
          {disciple?.mobile_no && (
            <span className="flex items-center gap-1">
              <MdPhone className="size-4 text-[#c2410c]" aria-hidden />
              {disciple.mobile_no}
            </span>
          )}
          {disciple?.created_at && (
            <span className="flex items-center gap-1">
              <MdCalendarToday
                className="size-4 text-[#c2410c]"
                aria-label="Created At"
              />
              {formatDate(disciple.created_at)}
            </span>
          )}
        </div>
        {address && (
          <p className="mt-1 flex items-start gap-1 text-[13px] leading-snug text-[#7c2d12]">
            <MdLocationOn
              className="mt-0.5 size-4 shrink-0 text-[#c2410c]"
              aria-hidden
            />
            <span>{address}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default SidebarUserCard;
