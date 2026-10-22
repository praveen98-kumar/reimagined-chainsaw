import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import ReactSelect from "react-select";

import Button from "@/components/Button";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import apiClient from "@/http/index";
import { useGetPermissionGroup } from "@/http/permission";
import { useGetRoles, useRoleCreatePermissions } from "@/http/role";
import { capitalizeWords, cn, getOptionArray } from "@/shared/functions/utils";
import type { Option } from "@/shared/interfaces/option";
import { useMutation } from "@tanstack/react-query";
import ConfirmModal from "@/components/modal/ConfirmModal";

export interface Root {
  group: string;
  creator_role_id: number;
  roles: Role[];
}

export interface Role {
  target_role_id: number;
  all_state: boolean;
}

type MAP = {
  [k: number]: {
    all_state: boolean;
    own_state: boolean;
  };
};

const RestrictedGroups = [
  "common",
  "ramaini_seva",
  "masters",
  "roles_permissions",
];
const RolePermissionn = () => {
  const [permissionMap, setPermissionMap] = useState<MAP>({});
  const [group, setGroup] = useState<string>("");
  const [role, setRole] = useState<null | number>(null);
  const { t } = useTranslation("home");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { data: groups, isLoading: _isloading } = useGetPermissionGroup();
  const { data: roles } = useGetRoles();
  const { data: roleCreatPermissions } = useRoleCreatePermissions(
    {
      group: group,
      creator_role_id: role,
    },
    {
      enabled: group !== "" && role !== null,
    },
  );

  const filteredGroups = useMemo(() => {
    return groups?.filter(
      (group) => !RestrictedGroups.includes(group.value as string),
    );
  }, [groups]);

  const filteredRolesOptions = useMemo(() => {
    let tempRoles = roles;
    if (group !== "") {
      tempRoles = roles?.filter(
        (role) => role.group === group || role.group === "common",
      );
    }
    return getOptionArray(tempRoles || [], "name", "id");
  }, [roles, group]);

  const filteredRoles = useMemo(() => {
    if (group !== "") {
      return roles?.filter((role) => role.group === group);
    }
    return roles;
  }, [roles, group]);

  useEffect(() => {
    const tempMap = roleCreatPermissions?.reduce((a: MAP, c) => {
      a[c.target_role_id] = {
        all_state: c.all_state,
        own_state: !c.all_state,
      };
      return a;
    }, {});
    setPermissionMap(tempMap ?? {});
  }, [roleCreatPermissions]);

  const { mutate: createRolePermission, isPending } = useMutation({
    mutationFn: async (payload: any) => {
      await apiClient.post("role_creation_permission", payload);
    },
    onError: (error) => {
      toast.error(error.message ?? "Something went wrong");
    },
    onSuccess: () => {
      toast.success("Permissions updated successfully");
    },
  });

  const handleConfirm = () => {
    if (!group) {
      toast.error("Please select a group");
      return;
    }
    if (!role) {
      toast.error("Please select a role");
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleSubmit = () => {
    // Filter out roles where both checkboxes are unchecked
    const payloadRoles: { target_role_id: number; all_state: boolean }[] = [];

    if (permissionMap) {
      Object.entries(permissionMap).forEach(([key, value]) => {
        // Only include if at least one checkbox is checked
        if (value.all_state || value.own_state) {
          payloadRoles.push({
            target_role_id: parseInt(key),
            all_state: value.all_state, // true if "All State" is checked, false if "Own State" is checked
          });
        }
      });
    }

    // Validate that group is selected
    if (!group) {
      toast.error("Please select a group");
      return;
    }

    const payload = {
      creator_role_id: role,
      group,
      roles: payloadRoles,
    };

    createRolePermission(payload);
  };

  function handleToggleCheckbox(
    e: React.ChangeEvent<HTMLInputElement>,
    roleId: number,
    key: "all_state" | "own_state",
  ) {
    const isChecked = e.target.checked;

    setPermissionMap((prev) => {
      const currentState = prev?.[roleId] || {
        all_state: false,
        own_state: false,
      };

      // If checking a checkbox, uncheck the other one in the same row
      if (isChecked) {
        return {
          ...prev,
          [roleId]: {
            all_state: key === "all_state",
            own_state: key === "own_state",
          },
        };
      } else {
        // If unchecking, just update that specific checkbox
        // This allows both to be unchecked
        return {
          ...prev,
          [roleId]: {
            ...currentState,
            [key]: false,
          },
        };
      }
    });
  }
  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: t("seva.title.role_permission") ?? "Role Wise Permission",
      }}
    >
      <div className="space-y-4 p-4">
        <Suspense
          fallback={
            <LoadingSpinner className="w-16 h-16 fill-blue-50 mx-auto" />
          }
        >
          {/* Group Select */}
          <div>
            <label
              htmlFor="group"
              className="block text-primary font-normal text-md"
            >
              Group
              <span className="ml-1 text-red-600">*</span>
            </label>
            <ReactSelect
              name="group"
              options={filteredGroups}
              required
              value={filteredGroups?.find((g) => g.value === group) ?? null}
              styles={{
                menu: (base) => ({ ...base, zIndex: 99 }),
              }}
              onChange={(opt: any) => {
                setGroup(opt.value as string);
              }}
            />
          </div>

          {/* Role Select */}
          {group !== "" && (
            <div>
              <label
                htmlFor="group"
                className="block text-primary font-normal text-md"
              >
                Role
                <span className="ml-1 text-red-600">*</span>
              </label>
              <ReactSelect
                name="role"
                options={filteredRolesOptions}
                required
                value={
                  filteredRolesOptions?.find((g) => g.value === role) ?? null
                }
                styles={{
                  menu: (base) => ({ ...base, zIndex: 99 }),
                }}
                onChange={(opt: any) => {
                  setRole(opt.value as number);
                }}
              />
            </div>
          )}

          {/* Permission Table */}
          {Boolean(filteredRoles?.length) && group !== "" && role && (
            <div className="w-full max-h-screen overflow-x-scroll">
              <table className="w-full">
                <thead
                  style={{ zIndex: 1 }}
                  className="w-full sticky top-0 bg-black text-white font-semibold text-md p-2"
                >
                  <tr>
                    <th className="w-3/4 px-2 sticky left-0 bg-black">Roles</th>
                    <th className="px-2">All State</th>
                    <th className="px-2">Own State</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoles?.map((role, i) => (
                    <tr
                      key={`${role.name}-${i.toString()}`}
                      className="even:bg-blue-100"
                    >
                      <td
                        className={cn(
                          "sticky left-0 border-r-2 border-blue-300 ",
                          {
                            "bg-blue-200": i % 2 !== 0,
                            "bg-white": i % 2 === 0,
                          },
                        )}
                      >
                        <span>
                          {capitalizeWords(role.name.replace(/_/g, " "))}
                        </span>
                      </td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          className="rounded"
                          name={`${role.name}all_state`}
                          id={`${role.name}all_state`}
                          checked={permissionMap?.[role.id]?.all_state ?? false}
                          onChange={(e) =>
                            handleToggleCheckbox(e, role.id, "all_state")
                          }
                        />
                      </td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          className="rounded"
                          name={`${role.name}own_state`}
                          id={`${role.name}own_state`}
                          checked={permissionMap?.[role.id]?.own_state ?? false}
                          onChange={(e) =>
                            handleToggleCheckbox(e, role.id, "own_state")
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/*Submit Button*/}
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            loading={isPending}
            className="bg-green-400 mx-auto py-2 w-1/2"
          >
            {isPending ? "Submitting..." : "Submit"}
          </Button>
          <ConfirmModal
            show={showConfirmDialog}
            onClose={() => setShowConfirmDialog(false)}
            onConfirm={handleSubmit}
            title="Do you want to save these permissions?"
          />
        </Suspense>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "home"])),
    },
  };
};

export default RolePermissionn;
