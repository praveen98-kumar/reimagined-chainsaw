import { memo } from "react";
import { Button } from "@/components/v2/ui/button";
import { cn } from "@/utils/cn";
import {
  SEVA_COLOR_MAP,
  TITLE_CONF,
} from "./_constants/existing-roles.constants";
import {
  type ExistingRole,
  groupExistingRoles,
} from "./_utils/existing-roles.utils";

interface ExistingRolesListProps {
  roles: ExistingRole[];
}

const ExistingRolesListInner = ({ roles }: ExistingRolesListProps) => {
  const grouped = groupExistingRoles(roles);

  return (
    <>
      {Object.entries(grouped).map(([key, rolesArray]) => (
        <div key={key} className="space-y-0.5 bg-white">
          {rolesArray.map((item, idx) => {
            const conf = TITLE_CONF[item.role.name] ?? {};
            const { shortName, title, color } = conf;

            return (
              <div
                key={`${item.role.id}_${item.role.group}_${idx.toString()}`}
                className={cn(
                  "flex flex-col first:rounded-t-lg last:rounded-b-lg overflow-hidden",
                  SEVA_COLOR_MAP[key] ?? "bg-slate-500",
                )}
              >
                <div className="flex justify-center items-center px-2 py-0.5">
                  <span className="text-[10px] text-center text-white/80 font-medium uppercase tracking-wider">
                    {[item.state, item.division, item.district, item.tehsil]
                      .filter((t): t is { name: string } => t != null)
                      .map((t) => t.name)
                      .join(", ")}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white/10 rounded-b-lg px-1.5 py-1.5 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    {shortName && (
                      <div
                        className={cn(
                          "size-6 rounded-sm uppercase flex justify-center items-center text-lg font-bold text-slate-800",
                          color,
                        )}
                      >
                        {shortName}
                      </div>
                    )}
                    <span className="text-sm font-bold capitalize text-white">
                      {title}
                    </span>
                  </div>
                  <Button size="sm" variant="secondary" className="rounded-lg">
                    Edit
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
};

export const ExistingRolesList = memo(ExistingRolesListInner);
