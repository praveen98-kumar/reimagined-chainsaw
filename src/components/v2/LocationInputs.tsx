"use client";

import { regionHirarchy, regionHirarchyMap } from "@/constants/app";
import {
  useCountries,
  useDistricts,
  useDivisions,
  useStates,
  useTehsils,
} from "@/hooks/useLocationAPI";
import type { Option } from "@/shared/interfaces/option";
import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/redux/store";
import { useFilterActions } from "@/store/useFilterStore";
import { ReactSelect } from "./ReactSelect";

type RoleRegion = keyof typeof regionHirarchyMap;

interface LocationValues {
  country_id: number;
  state_id: number;
  division_id: number;
  district_id: number;
  tehsil_id: number;
}

export function LocationInputs({
  showLabel = false,
  useGlobalFilters = false,
  onChangeAction,
}: {
  showLabel?: boolean;
  useGlobalFilters?: boolean;
  onChangeAction?: (data: Partial<LocationValues>) => void;
}) {
  const { setFilters } = useFilterActions();
  const { active_permission, active_region_index } = useAppSelector(
    (s) => s.auth,
  );
  const activeRoleRegion = active_permission?.role_region as RoleRegion;
  const activeRegion = active_permission?.region[active_region_index];
  const currentUserLevel = regionHirarchyMap?.[activeRoleRegion];

  const [formValues, setFormValues] = useState<LocationValues>({
    country_id: activeRegion?.country_id ?? 0,
    state_id: activeRegion?.state_id ?? 0,
    district_id: activeRegion?.district_id ?? 0,
    division_id: activeRegion?.division_id ?? 0,
    tehsil_id: activeRegion?.tehsil_id ?? 0,
  });

  const fields = useMemo(() => {
    return regionHirarchy.slice(currentUserLevel + 1);
  }, [currentUserLevel]);

  const { data: countries } = useCountries({
    enabled: fields.includes("country"),
  });
  const { data: states } = useStates(formValues.country_id, {
    enabled: fields.includes("state") && !!formValues.country_id,
  });

  const { data: divisions } = useDivisions(formValues.state_id, {
    enabled: fields.includes("division") && !!formValues.state_id,
  });

  const { data: districts } = useDistricts(formValues.state_id, {
    enabled: fields.includes("district") && !!formValues.state_id,
  });
  const { data: tehsils } = useTehsils(formValues.district_id, {
    enabled: fields.includes("tehsil") && !!formValues.district_id,
  });

  const locationData: Record<string, Option[] | undefined> = {
    country: countries,
    state: states,
    division: divisions,
    district: districts,
    tehsil: tehsils,
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-1.5">
      {fields.map((field) => {
        const fieldName = `${field}_id` as keyof LocationValues;
        const options = locationData[field];
        const isDisabled = !options || options.length === 0;

        return (
          <div key={field} className="flex items-center gap-2">
            {showLabel ? (
              <div className="flex items-center flex-1">
                <p className="text-lg text-slate-700 leading-4 shrink capitalize">
                  {field}
                </p>
              </div>
            ) : null}
            <ReactSelect
              name={field}
              className="flex-2"
              placeholder={`Select ${field}`}
              isDisabled={isDisabled}
              options={options}
              onChange={(opt: any) => {
                setFormValues((prev) => ({
                  ...prev,
                  [fieldName]: opt.value as number,
                }));
                if (useGlobalFilters) {
                  setFilters({
                    [fieldName]: opt.value as number,
                  });
                }
                if (onChangeAction) {
                  onChangeAction({
                    [fieldName]: opt.value as number,
                  });
                }
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
