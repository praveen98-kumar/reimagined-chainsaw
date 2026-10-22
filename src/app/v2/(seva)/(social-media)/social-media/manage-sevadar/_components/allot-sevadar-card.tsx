"use client";

import { memo } from "react";
import { DiscipleDetailCard } from "@/components/v2/DiscipleDetailCard";
import { Card, CardContent } from "@/components/v2/ui/card";
import { ExistingRolesList } from "./existing-roles-list";
import type { ExistingRole } from "./_utils/existing-roles.utils";
import { AddRoleButton } from "./add-role-btn";

interface AllotSevadarCardProps {
  user: any;
  onSuccess?: () => void;
}

const AllotSevadarCardInner = ({ user, onSuccess }: AllotSevadarCardProps) => {
  const discipleDetail = user?.disciple
    ? { ...user?.disciple, mobile_no: user?.mobile_no }
    : user;

  const existingRoles = (user?.user?.user_roles ?? []) as ExistingRole[];

  return (
    <Card className="py-1.5 rounded-xl border border-slate-300">
      <CardContent className="space-y-1 px-1.5">
        <DiscipleDetailCard {...discipleDetail} />
        <ExistingRolesList roles={existingRoles} />
        <AddRoleButton user={user} onSuccess={onSuccess} />
      </CardContent>
    </Card>
  );
};

export const AllotSevadarCard = memo(AllotSevadarCardInner);
