"use client";

import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { useAppSelector } from "@/redux/store";
import { useGetRoles, useRoleCreatePermissions } from "@/http/role";
import { regionHirarchy, regionHirarchyIndex } from "@/constants/app";
import { objectWithValues, capitalizeWords } from "@/shared/functions/utils";
import type { Option } from "@/shared/interfaces/option";
import type { Role } from "@/http/role";
import type {
  AllotmentPayload,
  ExistingRole,
  LocationField,
  LocationValues,
  RoleOption,
  UseAssignRoleOptions,
  UseAssignRoleReturn,
} from "./types";
import {
  useStatesQuery,
  useDistrictsQuery,
  useDivisionsQuery,
  useTehsilsQuery,
} from "@/query-options/queries/location";

const DEFAULT_COUNTRY_ID = 2;

const DEFAULT_LOCATION_VALUES: LocationValues = {
  country_id: DEFAULT_COUNTRY_ID,
  state_id: 0,
  division_id: 0,
  district_id: 0,
  tehsil_id: 0,
};

const FIELD_TO_ID_KEY: Record<LocationField, keyof LocationValues> = {
  country: "country_id",
  state: "state_id",
  division: "division_id",
  district: "district_id",
  tehsil: "tehsil_id",
};

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useAssignRole(
  options: UseAssignRoleOptions = {},
): UseAssignRoleReturn {
  const { allowedRoles, allowedGroups, enabled = true } = options;

  const activePermission = useAppSelector((s) => s.auth.active_permission);
  const activeRegion = useAppSelector((s) => s.auth.active_region);

  const currentUserLevel = useMemo(
    () =>
      activePermission?.role_region
        ? regionHirarchyIndex(activePermission.role_region)
        : -1,
    [activePermission?.role_region],
  );

  const { data: allRoles, isLoading: isRolesLoading } = useGetRoles({
    enabled,
  });
  const { data: createPermissions } = useRoleCreatePermissions(undefined, {
    enabled,
  });

  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formValues, setFormValues] = useState<LocationValues>(() => {
    const defaults = { ...DEFAULT_LOCATION_VALUES };
    if (activeRegion) {
      if (activeRegion.country_id)
        defaults.country_id = activeRegion.country_id;
      if (activeRegion.state_id) defaults.state_id = activeRegion.state_id;
      if (activeRegion.division_id)
        defaults.division_id = activeRegion.division_id;
      if (activeRegion.district_id)
        defaults.district_id = activeRegion.district_id;
      if (activeRegion.tehsil_id) defaults.tehsil_id = activeRegion.tehsil_id;
    }
    return defaults;
  });

  const { data: stateOptions = [], isLoading: isStatesLoading } =
    useStatesQuery(formValues.country_id);
  const { data: districtOptions = [], isLoading: isDistrictsLoading } =
    useDistrictsQuery(formValues.state_id);
  const { data: divisionOptions = [], isLoading: isDivisionsLoading } =
    useDivisionsQuery(formValues.state_id);
  const { data: tehsilOptions = [], isLoading: isTehsilsLoading } =
    useTehsilsQuery(formValues.district_id);

  const selectedRoleLevel = useMemo(
    () =>
      selectedRole?.region ? regionHirarchyIndex(selectedRole.region) : -1,
    [selectedRole?.region],
  );

  const roleOptions = useMemo((): RoleOption[] => {
    if (!allRoles) return [];

    let filtered = allRoles.filter((r) => {
      const roleLevel = regionHirarchyIndex(r.region);
      return roleLevel > currentUserLevel;
    });

    if (allowedRoles?.length) {
      filtered = filtered.filter((r) => allowedRoles.includes(r.id));
    } else if (allowedGroups?.length) {
      filtered = filtered.filter((r) => allowedGroups.includes(r.group));
    } else if (createPermissions?.length) {
      const permittedTargetIds = new Set(
        createPermissions.map((p) => p.target_role_id),
      );
      filtered = filtered.filter((r) => permittedTargetIds.has(r.id));
    }

    return filtered.map((r) => ({
      value: r.id,
      label: capitalizeWords(r.name.replace(/_/g, " ")),
      regionLevel: regionHirarchyIndex(r.region),
    }));
  }, [
    allRoles,
    currentUserLevel,
    allowedRoles,
    allowedGroups,
    createPermissions,
  ]);

  const visibleFields = useMemo((): LocationField[] => {
    if (selectedRoleLevel < 0 || currentUserLevel < 0) return [];
    return regionHirarchy.slice(
      currentUserLevel + 1,
      selectedRoleLevel + 1,
    ) as LocationField[];
  }, [currentUserLevel, selectedRoleLevel]);

  const reset = useCallback(() => {
    setSelectedRoleId(null);
    setSelectedRole(null);
    setFormValues(() => {
      const defaults = { ...DEFAULT_LOCATION_VALUES };
      if (activeRegion) {
        if (activeRegion.country_id)
          defaults.country_id = activeRegion.country_id;
        if (activeRegion.state_id) defaults.state_id = activeRegion.state_id;
        if (activeRegion.division_id)
          defaults.division_id = activeRegion.division_id;
        if (activeRegion.district_id)
          defaults.district_id = activeRegion.district_id;
        if (activeRegion.tehsil_id) defaults.tehsil_id = activeRegion.tehsil_id;
      }
      return defaults;
    });
  }, [activeRegion]);

  const checkDuplicate = useCallback(
    (
      existingRoles: ExistingRole[],
      allottedRoles: ExistingRole[],
      field: LocationField,
      value: number,
    ): boolean => {
      if (!selectedRoleId) return false;

      const fieldIdKey = FIELD_TO_ID_KEY[field];
      const combined = [...existingRoles, ...allottedRoles];

      return combined.some(
        (r) =>
          r.role_id === selectedRoleId &&
          r[fieldIdKey] !== undefined &&
          r[fieldIdKey] === value,
      );
    },
    [selectedRoleId],
  );

  const handleRoleChange = useCallback(
    (opt: Option | null) => {
      if (!opt) {
        reset();
        return;
      }

      const roleId = opt.value as number;
      const role = allRoles?.find((r) => r.id == roleId);
      if (!role) return;

      const level = role.region ? regionHirarchyIndex(role.region) : 0;

      setSelectedRoleId(roleId);
      setSelectedRole(role);

      const newFormValues: LocationValues = {
        country_id:
          level >= 1 ? (activeRegion?.country_id ?? DEFAULT_COUNTRY_ID) : 0,
        state_id: level >= 2 ? (activeRegion?.state_id ?? 0) : 0,
        division_id: level === 3 ? (activeRegion?.division_id ?? 0) : 0,
        district_id: level >= 4 ? (activeRegion?.district_id ?? 0) : 0,
        tehsil_id: level >= 5 ? (activeRegion?.tehsil_id ?? 0) : 0,
      };
      setFormValues(newFormValues);
    },
    [allRoles, activeRegion, reset],
  );

  const handleCountryChange = useCallback((opt: Option | null) => {
    if (!opt) return;
    const countryId = opt.value as number;
    setFormValues((prev) => ({
      ...prev,
      country_id: countryId,
      state_id: 0,
      division_id: 0,
      district_id: 0,
      tehsil_id: 0,
    }));
  }, []);

  const handleStateChange = useCallback((opt: Option | null) => {
    if (!opt) return;
    const stateId = opt.value as number;
    setFormValues((prev) => ({
      ...prev,
      state_id: stateId,
      division_id: 0,
      district_id: 0,
      tehsil_id: 0,
    }));
  }, []);

  const handleDistrictChange = useCallback((opt: Option | null) => {
    if (!opt) return;
    const districtId = opt.value as number;
    setFormValues((prev) => ({
      ...prev,
      district_id: districtId,
      tehsil_id: 0,
    }));
  }, []);

  const handleDivisionChange = useCallback((opt: Option | null) => {
    if (!opt) return;
    setFormValues((prev) => ({
      ...prev,
      division_id: opt!.value as number,
    }));
  }, []);

  const handleTehsilChange = useCallback((opt: Option | null) => {
    if (!opt) return;
    setFormValues((prev) => ({
      ...prev,
      tehsil_id: opt!.value as number,
    }));
  }, []);

  const getPayload = useCallback(
    (
      existingRoles: ExistingRole[],
      allottedRoles: ExistingRole[],
    ): { payload: AllotmentPayload | null; error: string | null } => {
      if (!selectedRoleId) {
        return { payload: null, error: "Select a role" };
      }

      for (const field of visibleFields) {
        const idKey = FIELD_TO_ID_KEY[field];
        const value = formValues[idKey];
        if (!value || value === 0) {
          return { payload: null, error: `Select ${field}` };
        }
        if (checkDuplicate(existingRoles, allottedRoles, field, value)) {
          return {
            payload: null,
            error: `${capitalizeWords(field)} is already assigned for this role`,
          };
        }
      }

      const title = buildTitle(selectedRole!, formValues, {
        state: stateOptions,
        district: districtOptions,
        division: divisionOptions,
        tehsil: tehsilOptions,
      });

      return {
        payload: {
          role_id: selectedRoleId,
          ...objectWithValues(formValues),
          title,
          key: selectedRole?.name,
        },
        error: null,
      };
    },
    [
      selectedRoleId,
      selectedRole,
      visibleFields,
      formValues,
      stateOptions,
      districtOptions,
      divisionOptions,
      tehsilOptions,
      checkDuplicate,
    ],
  );

  const isLocationLoading =
    isStatesLoading ||
    isDistrictsLoading ||
    isDivisionsLoading ||
    isTehsilsLoading;

  const returnValue = useMemo(
    () => ({
      selectedRoleId,
      selectedRole,
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
      isLocationLoading,
    }),
    [
      selectedRoleId,
      selectedRole,
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
      isLocationLoading,
    ],
  );

  return returnValue;
}

function buildTitle(
  role: Role | null,
  formValues: LocationValues,
  locationOptions: Record<string, Option[]>,
): string {
  if (!role) return "";

  const level = role.region ? regionHirarchyIndex(role.region) : 0;
  const parts: string[] = [];

  if (level >= 1 && formValues.country_id) {
    const opt = locationOptions.country?.find(
      (o) => o.value === formValues.country_id,
    );
    if (opt) parts.push(opt.label);
  }
  if (level >= 2 && formValues.state_id) {
    const opt = locationOptions.state?.find(
      (o) => o.value === formValues.state_id,
    );
    if (opt) parts.push(opt.label);
  }
  if (level === 3 && formValues.division_id) {
    const opt = locationOptions.division?.find(
      (o) => o.value === formValues.division_id,
    );
    if (opt) parts.push(opt.label);
  }
  if (level >= 4 && formValues.district_id) {
    const opt = locationOptions.district?.find(
      (o) => o.value === formValues.district_id,
    );
    if (opt) parts.push(opt.label);
  }
  if (level >= 5 && formValues.tehsil_id) {
    const opt = locationOptions.tehsil?.find(
      (o) => o.value === formValues.tehsil_id,
    );
    if (opt) parts.push(opt.label);
  }

  return parts.join(", ");
}
