import { useAppSelector } from "@/redux/store";
import {
  getCountries,
  getDistricts,
  getDistrictsUnderDivision,
  getDivisions,
  getStates,
  getTehsils,
  handleCountryChange,
  handleDistrictChange,
  handleDivisionChange,
  handleStateChange,
  handleStateChangeForDivisions,
} from "@/shared/functions/location";
import { Option } from "@/shared/interfaces/option";
import { Region } from "@/shared/interfaces/user";
import { defaultCountries } from "@/constants/app";
import { useFormikContext } from "formik";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Select from "./input/Select";
import { useRouter } from "next/router";

interface ProfileFields {
  country_id: number;
  state_id: number;
  district_id: number;
  division_id: number;
  tehsil_id: number;
}

interface DisabledField {
  country_id?: boolean;
  state_id?: boolean;
  district_id?: boolean;
  division_id?: boolean;
  tehsil_id?: boolean;
}

type T = Partial<Record<keyof ProfileFields, boolean>>;

interface Props {
  conditionalFields?: T;
  isClearable?: boolean;
  useHirarchy?: boolean;
  required?: boolean;
  showDivision?: boolean;
  isOptionDisabled?: Partial<
    Record<keyof ProfileFields, (values: any) => boolean>
  >;
  isDisabled?: DisabledField;
  onChange?: Partial<Record<keyof ProfileFields, (values: Option) => void>>;
  fieldClass?: string;
}

interface OnFieldChangeProps {
  fields: string[];
  onChange: (values: object) => void;
}

export const OnFieldChange = memo(
  ({ onChange, fields }: OnFieldChangeProps) => {
    const { getFieldMeta } = useFormikContext<ProfileFields>();
    const didMount = useRef(false);
    useEffect(() => {
      if (didMount.current) {
        const values = fields.reduce((acc, fieldName) => {
          // @ts-ignore
          acc[fieldName] = getFieldMeta(fieldName)?.value;
          return acc;
        }, {});
        onChange(values);
      } else didMount.current = true;
    }, [...fields.map((field) => getFieldMeta(field).value)]);
    return null;
  },
);

const UserwiseDropdown = ({
  conditionalFields = {},
  isClearable = true,
  useHirarchy = true,
  required,
  showDivision,
  isDisabled,
  isOptionDisabled,
  onChange,
  fieldClass = "",
}: Props) => {
  const { t } = useTranslation("common");
  const [fieldsToShow] = useState<T>(conditionalFields);
  const {
    active_permission,
    active_region_index,
    user: currentUser,
  } = useAppSelector((state) => state.auth);
  const regionLength = (active_permission?.region as Region[])?.length ?? 0;
  const role_region = active_permission?.role_region ?? "ashram";
  const [countries, setCountries] = useState<Option[]>([]);
  const [states, setStates] = useState<Option[]>([]);
  const [tehsils, setTehsils] = useState<Option[]>([]);
  const [districts, setDistricts] = useState<Option[]>([]);
  const [divisions, setDivisions] = useState<Option[]>([]);
  const { values, setFieldValue, errors, touched } =
    useFormikContext<ProfileFields>();
  const router = useRouter();
  const regionHirarcy: {
    name: string;
    labelVar: keyof Region;
    valueVar: keyof Region;
    cb: (e?: any) => void;
    fn: (e?: any) => Promise<Option[]>;
  }[] = [
    {
      name: "ashram",
      labelVar: "country_name",
      valueVar: "country_id",
      fn: getCountries,
      cb: setCountries,
    },
    {
      name: "country",
      labelVar: "country_name",
      valueVar: "country_id",
      cb: setCountries,
      fn: getCountries,
    },
    {
      name: "state",
      labelVar: "state_name",
      valueVar: "state_id",
      fn: getStates,
      cb: setStates,
    },
    {
      name: "division",
      labelVar: "division_name",
      valueVar: "division_id",
      fn: getDivisions,
      cb: setDivisions,
    },
    {
      name: "district",
      labelVar: "district_name",
      valueVar: "district_id",
      cb: setDistricts,
      fn: showDivision ? getDistrictsUnderDivision : getDistricts,
    },
    {
      name: "tehsil",
      labelVar: "tehsil_name",
      valueVar: "tehsil_id",
      cb: setTehsils,
      fn: getTehsils,
    },
  ];
  const index = regionHirarcy.findIndex((r) => r.name == role_region);

  useEffect(() => {
    if (useHirarchy) {
      (async () => {
        try {
          let locationArr: Option[] = [];
          if (regionLength > 0) {
            //   locationArr = [...(active_permission?.region ?? [])].map((t) => ({
            //     label: t[regionHirarcy[index].labelVar] as string,
            //     value: t[regionHirarcy[index].valueVar],
            //   }));
            //
            //   regionHirarcy[index].cb(locationArr);
            // } else {
            const tempRegion = active_permission?.region[
              active_region_index
            ] as Region;
            if (index == 0) {
              // Show india only
              if (currentUser?.mobile_no == "+919812056767") {
                locationArr = defaultCountries.filter((c) => c.value == 2);
              } else {
                locationArr = defaultCountries;
              }
            } else {
              const newIndex =
                index == 2 ? (showDivision ? index + 1 : index + 2) : index + 1;
              locationArr = await regionHirarcy[newIndex].fn(
                tempRegion[regionHirarcy[index].valueVar],
              );
            }

            setFieldValue(
              regionHirarcy[index].valueVar,
              tempRegion[regionHirarcy[index].valueVar],
            );
            if (index < regionHirarcy.length - 1) {
              if (index == 0) {
                const locationArr2 = await getStates(
                  tempRegion[regionHirarcy[1].valueVar],
                );
                if (currentUser?.mobile_no == "+919812056767") {
                  regionHirarcy[2].cb(
                    locationArr2.filter((s) =>
                      [5, 9, 22, 24].includes(Number(s.value)),
                    ),
                  );
                } else {
                  regionHirarcy[2].cb(locationArr2);
                }
              } else {
                const newIndex =
                  index == 2
                    ? showDivision
                      ? index + 1
                      : index + 2
                    : index + 1;
                regionHirarcy[newIndex].cb(locationArr);
              }
            }
          }
        } catch (error) {
          console.error(error);
        }
      })();
    } else {
      (async () => {
        // Show india only
        if (router.query.url !== "download_international_orders") {
          if (currentUser?.mobile_no == "+919812056767") {
            setCountries(defaultCountries.filter((c) => c.value == 2));
          } else {
            setCountries(defaultCountries);
          }
          setFieldValue("country_id", defaultCountries[0].value as string);
          const states = await getStates(defaultCountries[0].value as string);
          if (currentUser?.mobile_no == "+919812056767") {
            setStates(
              states.filter((s) => [5, 9, 22, 24].includes(Number(s.value))),
            );
          } else {
            setStates(states);
          }
        }
      })();
    }
  }, [useHirarchy]);

  const visible = useMemo(() => {
    return Object.entries(fieldsToShow).reduce(
      (a, [key, value]) => ({ ...a, [key]: value }),
      {
        country_id: true,
        state_id: true,
        division_id: true,
        district_id: true,
        tehsil_id: true,
      },
    );
  }, [fieldsToShow]);

  useEffect(() => {
    if (values.country_id == undefined) {
      setStates([]);
    }
    setDivisions([]);
    setDistricts([]);
    setTehsils([]);
    setFieldValue("state_id", 0);
    setFieldValue("division_id", 0);
    setFieldValue("district_id", 0);
    setFieldValue("tehsil_id", 0);
  }, [values.country_id]);

  useEffect(() => {
    if (values.state_id == undefined) {
      setDistricts([]);
    }
    setTehsils([]);
    setFieldValue("division_id", 0);
    setFieldValue("district_id", 0);
    setFieldValue("tehsil_id", 0);
  }, [values.state_id]);

  useEffect(() => {
    if (values.district_id == undefined) {
      setTehsils([]);
    }
    setFieldValue("tehsil_id", 0);
  }, [values.district_id]);

  return (
    <>
      {visible.country_id &&
        (index < 1 || (index == 1 && regionLength > 1) || !useHirarchy) && (
          <Select
            options={defaultCountries}
            label={t("country")!}
            name="country_id"
            placeholder={t("select_country") ?? "Select Country"}
            value={
              defaultCountries.find((c) => c.value == values.country_id) ?? null
            }
            onChange={(opt: any) => {
              setFieldValue("country_id", opt?.value);
              if (visible.state_id) {
                if (currentUser?.mobile_no == "+919812056767") {
                  handleCountryChange(opt?.value, setStates, [5, 9, 22, 24]);
                } else {
                  handleCountryChange(opt?.value, setStates);
                }
              }
              onChange?.country_id?.(opt);
            }}
            isDisabled={isDisabled?.country_id}
            required={required}
            error={errors.country_id}
            touched={touched.country_id}
            isClearable={isClearable}
            isOptionDisabled={isOptionDisabled?.country_id}
            fieldClass={fieldClass}
          />
        )}
      {visible.state_id && (index < 2 || !useHirarchy) && (
        <Select
          options={states}
          label={t("state")!}
          name="state_id"
          placeholder={t("select_state") ?? "Select State"}
          value={states.find((c) => c.value == values.state_id) ?? null}
          onChange={(opt: any) => {
            setFieldValue("state_id", opt?.value ?? null);
            if (opt?.value) {
              if (visible.division_id && showDivision) {
                handleStateChangeForDivisions(opt.value, setDivisions);
              } else if (visible.district_id) {
                handleStateChange(opt.value, setDistricts);
              } else if (
                active_permission &&
                active_permission.role_region === "division"
              ) {
                handleStateChangeForDivisions(opt.value, setDivisions);
              }
            }
            onChange?.state_id?.(opt);
          }}
          required={required}
          error={errors.state_id}
          touched={touched.state_id}
          isClearable={isClearable}
          isDisabled={isDisabled?.state_id}
          isOptionDisabled={isOptionDisabled?.state_id}
          fieldClass={fieldClass}
        />
      )}
      {showDivision && visible.division_id && (index < 3 || !useHirarchy) && (
        <Select
          options={divisions}
          label={t("division")!}
          name="division_id"
          placeholder={t("select_division") ?? "Select Division"}
          value={divisions.find((c) => c.value == values.division_id) ?? null}
          onChange={(opt: any) => {
            setFieldValue("division_id", opt?.value ?? null);
            if (visible.district_id && opt?.value) {
              handleDivisionChange(opt.value, setDistricts);
            }
            onChange?.division_id?.(opt);
          }}
          required={required}
          error={errors.division_id}
          touched={touched.division_id}
          isClearable={isClearable}
          isDisabled={isDisabled?.division_id}
          isOptionDisabled={isOptionDisabled?.division_id}
          fieldClass={fieldClass}
        />
      )}
      {visible.district_id && (index < 4 || !useHirarchy) && (
        <Select
          options={districts}
          label={t("district")!}
          name="district_id"
          placeholder={t("select_district") ?? "Select District"}
          value={districts.find((c) => c.value == values.district_id) ?? null}
          onChange={(opt: any) => {
            setFieldValue("district_id", opt?.value ?? null);
            if (visible.tehsil_id && opt?.value) {
              handleDistrictChange(opt.value, setTehsils);
            }
            onChange?.district_id?.(opt);
          }}
          required={required}
          error={errors.district_id}
          touched={touched.district_id}
          isClearable={isClearable}
          isDisabled={isDisabled?.district_id}
          isOptionDisabled={isOptionDisabled?.district_id}
          fieldClass={fieldClass}
        />
      )}
      {visible.tehsil_id && (
        <Select
          options={tehsils}
          label={t("tehsil")!}
          name="tehsil_id"
          placeholder={t("select_tehsil") ?? "Select Tehsil"}
          fieldClass={fieldClass + (index < 5 ? "" : "hidden")}
          value={tehsils.find((c) => c.value == values.tehsil_id) ?? null}
          onChange={(opt: any) => {
            setFieldValue("tehsil_id", opt?.value);
            onChange?.tehsil_id?.(opt);
          }}
          required={required}
          error={errors.tehsil_id}
          touched={touched.tehsil_id}
          isClearable={isClearable}
          isDisabled={isDisabled?.tehsil_id}
          isOptionDisabled={isOptionDisabled?.tehsil_id}
        />
      )}
    </>
  );
};

export default UserwiseDropdown;
