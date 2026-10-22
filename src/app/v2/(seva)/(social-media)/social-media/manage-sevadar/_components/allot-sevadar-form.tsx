"use client";

import { AssignRoleFields } from "@/components/v2/AssignRoleFields";
import type { AllotmentPayload } from "@/components/v2/composables/types";
import { useAssignRole } from "@/components/v2/composables/useAssignRole";
import { ReactSelect } from "@/components/v2/ReactSelect";
import { Button } from "@/components/v2/ui/button";
import apiClient from "@/http";
import { useAllotRoles } from "@/query-options/mutations/allot-role";
import type { Option } from "@/shared/interfaces/option";
import { useQueryClient } from "@tanstack/react-query";
import { memo, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const DEFAULT_GROUPS: string[] = ["book_order", "social_media"];
const TEAM_LEADER_ROLE_ID = 60;

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

  const [teamLeaderOptions, setTeamLeaderOptions] = useState<Option[]>([]);
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

  useEffect(() => {
    if (selectedRoleId === TEAM_LEADER_ROLE_ID && formValues.district_id) {
      apiClient
        .get("users_with_role/60", {
          params: { district_id: formValues.district_id },
        })
        .then((res) => {
          setTeamLeaderOptions(
            res.data.data?.map((u: any) => ({
              label: u.name,
              value: u.id,
            })) ?? [],
          );
        })
        .catch(() => setTeamLeaderOptions([]));
    } else {
      setTeamLeaderOptions([]);
      setTeamLeaderId(0);
    }
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

      {selectedRoleId === TEAM_LEADER_ROLE_ID && (
        <ReactSelect
          options={teamLeaderOptions}
          value={
            teamLeaderOptions.find((o) => o.value === teamLeaderId) ?? null
          }
          onChange={(opt: any) => {
            if (!opt) return;
            setTeamLeaderId(opt.value as number);
          }}
          placeholder="Select team leader"
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
