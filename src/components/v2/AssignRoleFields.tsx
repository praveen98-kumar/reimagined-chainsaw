"use client";

import { memo, useCallback } from "react";
import type {
  ExistingRole,
  LocationField,
  RoleOption,
} from "@/components/v2/composables/types";
import { ReactSelect } from "@/components/v2/ReactSelect";
import type { Option } from "@/shared/interfaces/option";

export interface AssignRoleFieldsProps {
  selectedRoleId: number | null;
  formValues: {
    country_id: number;
    state_id: number;
    division_id: number;
    district_id: number;
    tehsil_id: number;
  };
  roleOptions: RoleOption[];
  isRolesLoading?: boolean;
  existingRoles: ExistingRole[];
  allottedRoles: ExistingRole[];
  isLoading?: boolean;

  stateOptions: Option[];
  districtOptions: Option[];
  divisionOptions: Option[];
  tehsilOptions: Option[];

  currentUserLevel: number;
  visibleFields: LocationField[];

  checkDuplicate: (
    existingRoles: ExistingRole[],
    allottedRoles: ExistingRole[],
    field: LocationField,
    value: number,
  ) => boolean;

  handleRoleChange: (opt: Option | null) => void;
  handleCountryChange: (opt: Option | null) => void;
  handleStateChange: (opt: Option | null) => void;
  handleDistrictChange: (opt: Option | null) => void;
  handleDivisionChange: (opt: Option | null) => void;
  handleTehsilChange: (opt: Option | null) => void;
}

const AssignRoleFieldsInner = ({
  selectedRoleId,
  formValues,
  roleOptions,
  isRolesLoading,
  existingRoles,
  allottedRoles,
  isLoading,
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
}: AssignRoleFieldsProps) => {
  const isLoadingAny = isRolesLoading || isLoading;

  const getFieldOptions = useCallback(
    (field: LocationField) => {
      switch (field) {
        case "country":
          return [{ label: "India", value: 2 }];
        case "state":
          return stateOptions;
        case "district":
          return districtOptions;
        case "division":
          return divisionOptions;
        case "tehsil":
          return tehsilOptions;
        default:
          return [];
      }
    },
    [stateOptions, districtOptions, divisionOptions, tehsilOptions],
  );

  const getFieldValue = useCallback(
    (field: LocationField) => {
      const key = `${field}_id` as keyof typeof formValues;
      return formValues[key] as number;
    },
    [formValues],
  );

  const getFieldOnChange = useCallback(
    (field: LocationField) => {
      switch (field) {
        case "country":
          return handleCountryChange;
        case "state":
          return handleStateChange;
        case "district":
          return handleDistrictChange;
        case "division":
          return handleDivisionChange;
        case "tehsil":
          return handleTehsilChange;
        default:
          return () => {};
      }
    },
    [
      handleCountryChange,
      handleStateChange,
      handleDistrictChange,
      handleDivisionChange,
      handleTehsilChange,
    ],
  );

  const handleOptionDisabled = useCallback(
    (field: LocationField) => {
      if (!selectedRoleId) return () => false;
      return (opt: { value: number }) =>
        checkDuplicate(existingRoles, allottedRoles, field, opt.value);
    },
    [selectedRoleId, checkDuplicate, existingRoles, allottedRoles],
  );

  const handleOptionLabel = useCallback(
    (field: LocationField) => {
      if (!selectedRoleId) return (opt: { label: string }) => opt.label;
      return (opt: { label: string; value: number }) => {
        const isDuplicate = checkDuplicate(
          existingRoles,
          allottedRoles,
          field,
          opt.value,
        );
        return isDuplicate ? `${opt.label} (Already Assigned)` : opt.label;
      };
    },
    [selectedRoleId, checkDuplicate, existingRoles, allottedRoles],
  );

  return (
    <div className="space-y-1.5">
      <ReactSelect
        options={roleOptions as RoleOption[]}
        value={
          (roleOptions as RoleOption[]).find(
            (o) => o.value == selectedRoleId,
          ) ?? null
        }
        onChange={handleRoleChange as any}
        placeholder="Select role"
        isDisabled={isLoadingAny}
        isLoading={isRolesLoading}
      />

      {visibleFields.map((field) => {
        const opts = getFieldOptions(field);

        return (
          <ReactSelect
            key={field}
            options={opts}
            value={opts.find((o) => o.value == getFieldValue(field)) ?? null}
            onChange={getFieldOnChange(field) as any}
            placeholder={`Select ${field}`}
            isDisabled={isLoadingAny || opts.length === 0}
            isOptionDisabled={handleOptionDisabled(field) as any}
            getOptionLabel={handleOptionLabel(field) as any}
          />
        );
      })}
    </div>
  );
};

export const AssignRoleFields = memo(AssignRoleFieldsInner);
