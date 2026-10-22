import Avatar from "@/components/Avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatDate } from "@/shared/functions/utils";
import type { Disciple } from "@/shared/interfaces/user";

interface DiscipleCardProps {
  disciple: Disciple;
  onClick?: (e?: any) => void;
  showLevel?: boolean;
}

function NaamDikshaLeverlBar({ level }: { level: number }) {
  return (
    <ul className="flex flex-col absolute h-full top-0 right-0 bottom-0 items-center justify-around">
      {Array.from({ length: 4 })
        .fill(null)
        .map((_, i) => (
          <li
            className={cn(
              "w-8 h-1/4 font-bold flex items-center justify-center",
              i < level ? "text-white bg-primary" : "text-gray-700 bg-gray-300"
            )}
            key={`namdiksha_level_${i.toString()}`}
          >
            {i + 1}
          </li>
        ))}
    </ul>
  );
}

const DiscipleCard: React.FC<DiscipleCardProps> = ({
  disciple,
  onClick,
  showLevel = true,
}) => {
  const naamdikshaLevel = [
    true,
    disciple.satnam_date,
    disciple.sarnam_date,
    disciple.sarshabd_date,
  ].filter((t) => !!t).length;
  const address = [
    disciple?.tehsil?.name,
    disciple?.district?.name,
    disciple?.state?.name,
  ].join(", ");
  return (
    <Card onClick={() => onClick?.(disciple.id)} className="overflow-hidden">
      <CardContent className="p-0 relative">
        <div className="flex p-2">
          <Avatar label={disciple?.status} />

          <div
            className={cn("flex flex-col pl-1", showLevel ? "pr-9" : "pr-1")}
          >
            <p className="font-semibold text-md uppercase text-primary">
              {`${disciple.name} ${disciple.relation ?? ""} ${
                disciple.guardian_name ?? ""
              }`}
            </p>
            <p className="font-base text-md text-gray-500">
              {disciple.mobile_no}
            </p>
            {disciple?.created_at && (
              <p className="font-base text-sm text-gray-500">
                Created At: {formatDate(disciple?.created_at)}
              </p>
            )}
            <p className="font-base text-sm text-gray-500">{address}</p>
          </div>
        </div>
        {showLevel && <NaamDikshaLeverlBar level={naamdikshaLevel} />}
      </CardContent>
    </Card>
  );
};

export default DiscipleCard;
