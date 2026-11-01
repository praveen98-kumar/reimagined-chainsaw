"use client";

import { AssignRoleFields } from "@/components/v2/AssignRoleFields";
import type { AllotmentPayload } from "@/components/v2/composables/types";
import { useAssignRole } from "@/components/v2/composables/useAssignRole";
import { ReactSelect } from "@/components/v2/ReactSelect";
import { Button } from "@/components/v2/ui/button";
import { useUsersWithRole } from "@/hooks/useUsersWithRole";
import { useAllotRoles } from "@/query-options/mutations/allot-role";
import type { Option } from "@/shared/interfaces/option";
import { useQueryClient } from "@tanstack/react-query";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const DEFAULT_GROUPS: string[] = ["book_order", "social_media"];
const SEVADAR_ROLE_ID = 53; // social_media_sevadar
const TEAM_LEADER_ROLE_ID = 60; // social_media_team_leader

interface AllotSevadarFormProps {
  user: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const AllotSevadarFormInner = ({
  user,
  onSuccess,
  onCancel,
}: AllotSevadarFormProps) => {
  const queryClient = useQueryClient();

  const [teamLeaderId, setTeamLeaderId] = useState<number>(0);
  const [allottedRoles, setAllottedRoles] = useState<AllotmentPayload[]>([]);

  const {
    selectedRoleId,
    formValues,
    roleOptions,
    isRolesLoading,
    stateOptions,
    districtOptions,
    divisionOptions,
    tehsilOptions,
    currentUserLevel,
    visibleFields,
    checkDuplicate,
    handleRoleChange,
    handleCountryChange,
    handleStateChange,
    handleDistrictChange,
    handleDivisionChange,
    handleTehsilChange,
    getPayload,
    reset,
  } = useAssignRole({
    allowedGroups: DEFAULT_GROUPS,
  });

  const { mutate, isPending } = useAllotRoles({
    onSuccess: () => {
      toast.success("Role allotted successfully");
      queryClient.invalidateQueries({ queryKey: ["disciples_with_role"] });
      setAllottedRoles([]);
      reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error ?? "Failed to allot role");
    },
  });

  // A social media sevadar can optionally be placed under a team leader of the
  // same district. Sevadars directly under a tehsil sevadar / district have none.
  const showTeamLeader =
    selectedRoleId === SEVADAR_ROLE_ID && !!formValues.district_id;
  const { data: teamLeaders = [] } = useUsersWithRole(
    TEAM_LEADER_ROLE_ID,
    { districtId: formValues.district_id },
    { enabled: showTeamLeader },
  );
  const teamLeaderOptions: Option[] = useMemo(
    () =>
      showTeamLeader
        ? teamLeaders.map((u) => ({
            label: u.team_leader_code
              ? `${u.name} (${u.team_leader_code})`
              : u.name,
            value: u.id,
          }))
        : [],
    [showTeamLeader, teamLeaders],
  );

  useEffect(() => {
    setTeamLeaderId(0);
  }, [selectedRoleId, formValues.district_id]);

  const handleSubmit = useCallback(() => {
    const { payload, error } = getPayload([], allottedRoles);
    if (error) {
      toast.error(error);
      return;
    }

    if (!payload) return;

    const { key, title, ...rest } = payload;
    const { user: userData, ...restUser } = user;
    const rolesPayload = [
      { ...rest, ...(teamLeaderId && { team_leader_id: teamLeaderId }) },
    ];
    mutate({
      user_id: userData?.id ?? 0,
      roles: rolesPayload,
      ...restUser,
    });
  }, [allottedRoles, teamLeaderId, getPayload, user, mutate]);

  const handleCancel = useCallback(() => {
    setAllottedRoles([]);
    setTeamLeaderId(0);
    reset();
    onCancel?.();
  }, [reset, onCancel]);

  return (
    <div className="space-y-2">
      <AssignRoleFields
        selectedRoleId={selectedRoleId}
        formValues={formValues}
        roleOptions={roleOptions}
        isRolesLoading={isRolesLoading}
        existingRoles={[]}
        allottedRoles={allottedRoles}
        isLoading={isPending}
        stateOptions={stateOptions}
        districtOptions={districtOptions}
        divisionOptions={divisionOptions}
        tehsilOptions={tehsilOptions}
        currentUserLevel={currentUserLevel}
        visibleFields={visibleFields}
        checkDuplicate={checkDuplicate}
        handleRoleChange={handleRoleChange}
        handleCountryChange={handleCountryChange}
        handleStateChange={handleStateChange}
        handleDistrictChange={handleDistrictChange}
        handleDivisionChange={handleDivisionChange}
        handleTehsilChange={handleTehsilChange}
      />

      {showTeamLeader && (
        <ReactSelect
          options={teamLeaderOptions}
          value={
            teamLeaderOptions.find((o) => o.value === teamLeaderId) ?? null
          }
          onChange={(opt: any) => setTeamLeaderId((opt?.value as number) ?? 0)}
          isClearable
          placeholder={
            teamLeaderOptions.length
              ? "Select team leader (optional)"
              : "No team leader in this district"
          }
          isDisabled={isPending || teamLeaderOptions.length === 0}
        />
      )}

      {allottedRoles.length > 0 && (
        <div className="space-y-2 border-t pt-3">
          <p className="font-bold text-primary">New Roles To Be Added</p>
          {allottedRoles.map((el: AllotmentPayload, i: number) => (
            <div
              key={i.toString()}
              className="flex items-center justify-between px-2"
            >
              <p>
                {el.key?.replace(/_/g, " ")} ({el.title})
              </p>
              <button
                type="button"
                onClick={() =>
                  setAllottedRoles((prev) => prev.filter((_, idx) => idx !== i))
                }
                className="text-red-400 cursor-pointer hover:text-red-600 text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="submit"
          className="rounded-md flex-1 text-lg"
          onClick={handleSubmit}
          disabled={isPending}
        >
          {isPending ? "Adding..." : "Add Role"}
        </Button>
        <Button
          variant="cancel"
          className="rounded-md flex-1 text-lg"
          onClick={handleCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export const AllotSevadarForm = memo(AllotSevadarFormInner);
