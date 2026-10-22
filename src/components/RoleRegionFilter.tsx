import { regionHirarchy, regionHirarchyMap } from "@/constants/app";
import {
  useCountries,
  useDistricts,
  useDivisions,
  useStates,
  useTehsils,
} from "@/hooks/useLocationAPI";
import React, { type FormEvent, useMemo, useState } from "react";
import ReactSelect from "react-select";
import Button from "@/components/Button";
import type { Option } from "@/shared/interfaces/option";

type RoleRegion = keyof typeof regionHirarchyMap;

interface FormValues {
  region: RoleRegion | undefined;
  country_id: number;
  state_id: number;
  division_id: number;
  district_id: number;
  tehsil_id: number;
  role_id: number;
  role: string;
}

interface RoleRegionFormProps {
  creatorRoleRegion: RoleRegion;
  formValues?: Partial<FormValues>;
  roles: Option[];
  submitBtnLabel?: string;
  onSubmit: (data: FormValues) => void;
  isLoading?: boolean;
}

const defaultFormValues: FormValues = {
  region: undefined,
  country_id: 0,
  state_id: 0,
  division_id: 0,
  district_id: 0,
  tehsil_id: 0,
  role_id: 0,
  role: "",
};

export const RoleRegionFilter: React.FC<RoleRegionFormProps> = ({
  creatorRoleRegion,
  formValues: initialFormValues = {},
  roles,
  submitBtnLabel,
  isLoading,
  onSubmit,
}) => {
  const currentUserLevel = regionHirarchyMap?.[creatorRoleRegion];
  const [formValues, setFormValues] = useState<FormValues>({
    ...defaultFormValues,
    ...initialFormValues,
  });

  const locationFieldsToShow = useMemo(() => {
    const targetRegion = formValues?.region as RoleRegion;
    const targetLevel = regionHirarchyMap?.[targetRegion];
    if (!currentUserLevel || !targetLevel) {
      return [];
    }
    return regionHirarchy
      .slice(currentUserLevel + 1, targetLevel + 1)
      .filter((locationField) =>
        targetRegion !== "division" ? locationField !== "division" : true,
      );
  }, [currentUserLevel, formValues?.region]);

  const { data: countries } = useCountries({
    enabled: locationFieldsToShow.includes("country"),
  });
  const { data: states } = useStates(formValues.country_id, {
    enabled: locationFieldsToShow.includes("state") && !!formValues.country_id,
  });

  const { data: divisions } = useDivisions(formValues.state_id, {
    enabled: locationFieldsToShow.includes("division") && !!formValues.state_id,
  });

  const { data: districts } = useDistricts(formValues.state_id, {
    enabled: locationFieldsToShow.includes("district") && !!formValues.state_id,
  });
  const { data: tehsils } = useTehsils(formValues.district_id, {
    enabled:
      locationFieldsToShow.includes("tehsil") && !!formValues.district_id,
  });

  const locationData: Record<string, Option[] | undefined> = {
    country: countries,
    state: states,
    division: divisions,
    district: districts,
    tehsil: tehsils,
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit?.(formValues);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div>
        <label
          htmlFor="role_id"
          className="block text-primary font-normal text-md"
        >
          Role
          <span className="ml-1 text-red-600">*</span>
        </label>
        <ReactSelect
          name="role_id"
          options={roles}
          required
          value={roles.find((c) => c.value === formValues.role_id) ?? null}
          styles={{
            menu: (base) => ({ ...base, zIndex: 99 }),
          }}
          onChange={(opt: any) => {
            setFormValues((prev) => ({
              ...prev,
              role_id: opt.value as number,
              role: opt.label,
              region: opt?.region,
            }));
          }}
        />
      </div>

      {locationFieldsToShow.map((field) => {
        const fieldName = `${field}_id` as keyof FormValues;
        const options = locationData[field];
        const isDisabled = !options || options.length === 0;

        return (
          <div key={field}>
            <label
              htmlFor={fieldName}
              className="block text-primary font-normal text-md capitalize"
            >
              {field}
              <span className="ml-1 text-red-600">*</span>
            </label>
            <ReactSelect
              name={fieldName}
              options={options}
              required
              value={
                options?.find((c) => c.value === formValues[fieldName]) ?? null
              }
              styles={{
                menu: (base) => ({ ...base, zIndex: 99 }),
              }}
              isDisabled={isDisabled}
              onChange={(opt: any) => {
                setFormValues((prev) => ({
                  ...prev,
                  [fieldName]: opt.value as number,
                }));
              }}
            />
          </div>
        );
      })}

      {locationFieldsToShow.length > 0 && (
        <Button
          type="submit"
          loading={isLoading}
          disabled={isLoading}
          className="mx-auto mt-4"
        >
          {submitBtnLabel ?? "Submit"}
        </Button>
      )}
    </form>
  );
};
