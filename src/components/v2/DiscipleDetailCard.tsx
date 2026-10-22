import { formatDate } from "@/shared/functions/utils";
import { DiscipleAvatar } from "./DiscipleAvatar";

interface Props {
  name: string;
  avatar: string;
  relation: string;
  guardian_name: string;
  mobile_no: string;
  created_at: string;
  district: string;
  state: string;
}

export function DiscipleDetailCard({
  name,
  avatar,
  relation,
  guardian_name,
  mobile_no,
  district,
  state,
  created_at,
}: Props) {
  return (
    <div className="flex items-start bg-white capitalize gap-2">
      {/*Image*/}
      <DiscipleAvatar name={name} image={avatar} />
      {/*2 Column Detail*/}
      <div className="flex flex-1 items-start justify-between">
        {/**/}
        <div className="flex flex-col">
          <p className="text-xl leading-5 text-slate-700 line-clamp-1">
            {name}
          </p>
          <p className="text-xs text-slate-500">{`${relation.toUpperCase()} ${guardian_name}`}</p>
          <p className="text-sm text-slate-500">{mobile_no}</p>
        </div>
        {/**/}
      </div>
      <div className="flex flex-col text-[10px] leading-2.5 gap-1">
        <div className="flex flex-col">
          <p className="text-slate-400">Location</p>
          <p className="text-slate-500">{district}</p>
          <p className="text-slate-500">{state}</p>
        </div>
        <div className="flex flex-col">
          <p className="text-slate-400">Created At</p>
          <p className="text-slate-500">{formatDate(new Date(created_at))}</p>
        </div>
      </div>
    </div>
  );
}
