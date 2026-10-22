import type { GetStaticPaths, GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import ReactSelect from "react-select";

import Button from "@/components/Button";
import UserCard from "@/components/card/UserCard";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import apiClient from "@/http/index";
import { useGetPermissionGroup } from "@/http/permission";
import { useGetRoles, useRoleCreatePermissions } from "@/http/role";
import { useAppSelector } from "@/redux/store";
import { capitalizeWords, cn } from "@/shared/functions/utils";
import type { Option } from "@/shared/interfaces/option";
import { useMutation } from "@tanstack/react-query";
import useLocalstorage from "@/hooks/useLocalstorage";

export interface Root {
  group: string;
  creator_role_id: number;
  roles: Role[];
}

export interface Role {
  target_role_id: number;
  all_state: boolean;
}

const RestrictedGroups = [
  "common",
  "ramaini_seva",
  "masters",
  "roles_permissions",
];

type MAP = {
  [k: number]: {
    all_state: boolean;
    own_state: boolean;
  };
};

const UserPermissionById = () => {
  const { active_permission } = useAppSelector((s) => s.auth);
  const [permissionMap, setPermissionMap] = useState<MAP>({});
  const [group, setGroup] = useState<string>("");
  const { t } = useTranslation("home");
  const [disciple, ,] = useLocalstorage("selectedDisciple", undefined);

  const { data: groups, isLoading: _isloading } = useGetPermissionGroup();
  const { data: roles } = useGetRoles();
  const { data: roleCreatPermissions } = useRoleCreatePermissions(
    {
      group: group,
      creator_role_id: active_permission?.role_id,
    },
    {
      enabled: group !== "",
    },
  );

  const filteredGroups = useMemo(() => {
    return groups?.filter(
      (group) => !RestrictedGroups.includes(group.value as string),
    );
  }, [groups]);

  const filteredRole = useMemo(() => {
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

  const { mutate: _createRolePermission, isPending } = useMutation({
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

    // Validate that at least one role is selected
    if (payloadRoles.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    // Validate that group is selected
    if (!group) {
      toast.error("Please select a group");
      return;
    }

    // Validate that disciple is selected
    if (!disciple?.["id"]) {
      toast.error("User not found");
      return;
    }

    const payload = {
      creator_user_id: disciple?.["id"],
      group,
      roles: payloadRoles,
    };

    console.log("Submitting payload:", payload);
    _createRolePermission(payload);
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
        heading: t("seva.title.user_permission") ?? "Sevadar Permission",
      }}
    >
      <div className="space-y-4 p-4">
        <Suspense
          fallback={
            <LoadingSpinner className="w-16 h-16 fill-blue-50 mx-auto" />
          }
        >
          {/* User Card */}
          {/* @ts-ignore */}
          <UserCard user={{ ...disciple, ...disciple.disciple }} />

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

          {/* Permission Table */}
          {Boolean(filteredRole?.length) && group !== "" && (
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
                  {filteredRole?.map((role, i) => (
                    <tr
                      key={`${role.id}-${i.toString()}`}
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
            onClick={handleSubmit}
            disabled={isPending}
            loading={isPending}
            className="bg-green-400 mx-auto py-2 w-1/2"
          >
            {isPending ? "Submitting..." : "Submit"}
          </Button>
        </Suspense>
      </div>
    </Layout>
  );
};

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "home"])),
    },
  };
};

export default UserPermissionById;
