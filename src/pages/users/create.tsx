import TextInput from "@/components/input/TextInput";
import Layout from "@/components/Layout";
import UserwiseDropdown from "@/components/UserwiseDropdown";
import { NextApplicationPage } from "@/shared/interfaces/app";
import { Form, Formik, FormikProps, FormikValues } from "formik";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "react-i18next";
import { FaMobileAlt } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import * as Yup from "yup";
import DatePicker from "@/components/input/DatePicker";
import FormErrorMessage from "@/components/input/FormErrorMessage";
import { Option } from "@/shared/interfaces/option";
import Select from "@/components/input/Select";
import Button from "@/components/Button";
import apiClient from "@/http/index";
import { getOptionArray, objectWithValues } from "@/shared/functions/utils";
import { useState, useCallback, useEffect, useRef } from "react";
import {
  handleCountryChange,
  handleStateChangeForDivisions,
  handleStateChange,
  handleDistrictChange,
} from "@/shared/functions/location";
import { useAppSelector } from "@/redux/store";
import { defaultCountries } from "@/constants/app";
import useLocalstorage from "@/hooks/useLocalstorage";
import toast from "react-hot-toast";

const relationOptions: Array<Option> = [
  { label: "S/O", value: "S/O" },
  { label: "D/O", value: "D/O" },
  { label: "W/O", value: "W/O" },
];

const schema = Yup.object({
  role_id: Yup.number()
    .required("Sevadar type is required.")
    .test(
      "test-sevadar-min",
      "Sevadar type is reqired",
      (v) => v != null && v > 0,
    ),
  name: Yup.string().required("Name is required."),
  guardian_name: Yup.string().required("Guardian's name is required."),
  relation: Yup.string()
    .required("Relation with guardian is required.")
    .default("S/O"),
  age: Yup.number().min(9).required("Age is required"),
  address: Yup.string().required("Address is required."),
  mobile_no: Yup.string().required("Mobile number is required."),
  form_date: Yup.date().required("Form date is required"),
  satnam_date: Yup.date().nullable(),
  country_id: Yup.number()
    .nullable()
    .required("Country is required.")
    .test("test-country-min", "Country is reqired", (v) => v != null && v > 0),
  state_id: Yup.number()
    .nullable()
    .required("State is required.")
    .test("test-state-min", "State is reqired", (v) => v != null && v > 0),
  district_id: Yup.number()
    .nullable()
    .required("District is required.")
    .test(
      "test-district-min",
      "District is reqired",
      (v) => v != null && v > 0,
    ),
  tehsil_id: Yup.number()
    .nullable()
    .required("Tehsil is required.")
    .test("test-tehsil-min", "Tehsil is reqired", (v) => v != null && v > 0),
});

const regionHirarchyMap: Record<string, number> = {
  ashram: 0,
  country: 1,
  state: 2,
  division: 3,
  district: 4,
  tehsil: 5,
};

const regionHirarchy = Object.keys(regionHirarchyMap);

const CreateSevadarPage: NextApplicationPage = () => {
  const [countries] = useState<Option[]>(defaultCountries);
  const [states, setStates] = useState<Option[]>([]);
  const [districts, setDistricts] = useState<Option[]>([]);
  const [divisions, setDivisions] = useState<Option[]>([]);
  const [tehsils, setTehsils] = useState<Option[]>([]);
  const { t: tc } = useTranslation("common");
  const [roles, setRoles] = useState<Option[]>([]);
  const [allroles, setAllroles] = useState<any[]>([]);
  const [regionLevel, setRegionLevel] = useState(0);
  const { active_permission } = useAppSelector((state) => state.auth);
  const [sevaType] = useLocalstorage("sevaType");
  const [loading, setLoading] = useState(false);
  const formRef = useRef<FormikProps<FormikValues>>(null);

  const activeRegion = active_permission?.role_region;

  async function onSubmit(values: FormikValues) {
    setLoading(true);
    try {
      await apiClient.post("add_disciple", objectWithValues(values));
      toast.success("User created successfully");
      formRef?.current?.resetForm();
      formRef?.current?.setFieldValue("country_id", defaultCountries[0].value);
    } catch (error: any) {
      toast.error(error?.response?.data?.error);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const getRoles = useCallback(async () => {
    try {
      const { data } = await apiClient.get("roles");
      const dataWithIndex = data?.data
        ?.map((m: any) => ({
          ...m,
          index: regionHirarchyMap[m.region as string],
        }))
        .filter(
          (d: any) =>
            d.index > regionHirarchyMap[activeRegion as string] &&
            d.name.includes(sevaType),
        );
      let temp = getOptionArray(dataWithIndex, "name", "id");
      setRoles(temp);
      setAllroles(dataWithIndex);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    getRoles();
    handleCountryChange(defaultCountries[0].value, setStates);
  }, []);

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: "Create Sevadar",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <Formik
          innerRef={formRef}
          validationSchema={schema}
          initialValues={{
            role_id: 0,
            name: "",
            mobile_no: "",
            alt_mobile_no: "",
            address: "",
            relation: "S/O",
            age: 0,
            guardian_name: "",
            form_date: undefined,
            satnam_date: undefined,
            sarnam_date: undefined,

            country_id: 0,
            state_id: 0,
            district_id: 0,
            tehsil_id: 0,

            seva_country_id: defaultCountries[0].value,
            seva_state_id: 0,
            seva_district_id: 0,
            seva_tehsil_id: 0,
            seva_division_id: 0,
          }}
          onSubmit={onSubmit}
        >
          {({ values, errors, setFieldValue }) => (
            <Form className="pb-16">
              <Select
                label="Role"
                options={roles}
                required
                placeholder={"Select Role"}
                name={"role_id"}
                value={roles.find((r) => r.value == values.role_id) ?? null}
                onChange={(e: any) => {
                  setFieldValue("role_id", e.value);
                  const temp = allroles.find((r) => Number(e.value) == r.id);
                  const index = regionHirarchy.findIndex(
                    (item) => item == temp.region,
                  );
                  setRegionLevel(index);
                }}
              />
              {/* Name */}
              <TextInput name="name" label={tc("name") ?? "Name"} required />

              {/* Relation */}
              <Select
                options={relationOptions}
                label="Relation"
                required
                name="relation"
                placeholder={"Select Relation"}
                value={relationOptions.find((s) => s.value == values.relation)}
                onChange={(e: any) => {
                  setFieldValue("relation", e.value);
                }}
              />

              {/* Guardian Name */}
              <TextInput
                name="guardian_name"
                label="Guardian's Name"
                placeholder="Enter guardian's name"
                required
              />

              {/* Age */}
              <TextInput
                name="age"
                required
                label="Age"
                placeholder="Enter your age"
                type={"number"}
                min={9}
              />

              {/* Address */}
              <TextInput
                name="address"
                label={"Address"}
                placeholder="Enter your address"
                type={"text"}
                required
              />

              {/* Mobile number */}
              <TextInput
                name="mobile_no"
                label={tc("mobile_no") ?? "Mobile Number"}
                inputMode="numeric"
                required
                prependEle={
                  <div className="flex absolute space-x-1 items-center -translate-y-1/2 top-1/2 right-4">
                    {values.mobile_no.length > 0 && (
                      <MdClose
                        onClick={() => setFieldValue("mobile_no", "")}
                        className="w-5 h-5 text-gray-500 cursor-pointer"
                      />
                    )}
                    <FaMobileAlt className="w-6 h-6 text-gray-500 pointer-events-none" />
                  </div>
                }
              />

              {/* Pratham Date */}
              <div className="flex-1">
                <DatePicker
                  label="Pratham Naam Date"
                  name="form_date"
                  onChange={(e: any) => setFieldValue("form_date", e)}
                  maxDate={new Date()}
                  placeholderText="Enter form date"
                  required
                  dateFormat="dd-MM-yyyy"
                />
                {errors.form_date && (
                  <FormErrorMessage>
                    {errors.form_date as string}
                  </FormErrorMessage>
                )}
              </div>

              {/* Satnam Date */}
              <div className="flex-1">
                <DatePicker
                  label="Satnam Date"
                  name="satnam_date"
                  onChange={(e: any) => setFieldValue("satnam_date", e)}
                  maxDate={new Date()}
                  placeholderText="Enter satnam date"
                  dateFormat="dd-MM-yyyy"
                />
                {errors.satnam_date && (
                  <FormErrorMessage>
                    {errors.satnam_date as string}
                  </FormErrorMessage>
                )}
              </div>

              {/* Sarnam Date */}
              <div className="flex-1">
                <DatePicker
                  label="Sarnam Date"
                  name="sarnam_date"
                  onChange={(e: any) => setFieldValue("sarnam_date", e)}
                  maxDate={new Date()}
                  placeholderText="Enter sarnam date"
                  dateFormat="dd-MM-yyyy"
                />
                {errors.sarnam_date && (
                  <FormErrorMessage>
                    {errors.sarnam_date as string}
                  </FormErrorMessage>
                )}
              </div>

              <h3 className="font-bold text-lg pt-4">
                Enter Current Address Location
              </h3>
              {/* Location */}
              <UserwiseDropdown
                useHirarchy={false}
                conditionalFields={{ country_id: false }}
                required
              />

              {values.role_id !== 0 && (
                <>
                  <h3 className="font-bold text-lg pt-4">
                    Enter Seva Location
                  </h3>

                  {regionLevel >= 1 && (
                    <Select
                      label="Country"
                      placeholder={"Select Country/देश चुनें"}
                      options={countries}
                      required
                      isDisabled
                      value={
                        countries.find(
                          (r) => r.value == values.seva_country_id,
                        ) ?? null
                      }
                      name={"seva_country_id"}
                      onChange={(e: any) => {
                        setFieldValue("seva_country_id", e.value);
                        if (regionLevel > 1) {
                          handleCountryChange(e.value, setStates);
                        }
                      }}
                    />
                  )}
                  {regionLevel >= 2 && (
                    <Select
                      label="State"
                      options={states}
                      placeholder={"Select State/राज्य चुनें"}
                      required
                      value={
                        states.find((r) => r.value == values.seva_state_id) ??
                        null
                      }
                      name={"seva_state_id"}
                      onChange={(e: any) => {
                        setFieldValue("seva_state_id", e.value);
                        if (regionLevel == 3) {
                          handleStateChangeForDivisions(e.value, setDivisions);
                        } else if (regionLevel > 3) {
                          handleStateChange(e.value, setDistricts);
                        }
                      }}
                    />
                  )}
                  {regionLevel == 3 && (
                    <Select
                      label="Division"
                      options={divisions}
                      value={
                        divisions.find(
                          (r) => r.value == values.seva_division_id,
                        ) ?? null
                      }
                      name={"seva_division_id"}
                      required
                      onChange={(e: any) => {
                        setFieldValue("seva_division_id", e.value);
                      }}
                    />
                  )}
                  {regionLevel >= 4 && (
                    <Select
                      label="District"
                      value={
                        districts.find(
                          (r) => r.value == values.seva_district_id,
                        ) ?? null
                      }
                      placeholder="Select District/ज़िला चुनें"
                      options={districts}
                      name={"seva_district_id"}
                      required
                      onChange={(e: any) => {
                        setFieldValue("seva_district_id", e.value);
                        if (regionLevel > 4) {
                          handleDistrictChange(e.value, setTehsils);
                        }
                      }}
                    />
                  )}
                  {regionLevel >= 5 && (
                    <Select
                      label="Tehsil"
                      options={tehsils}
                      value={
                        tehsils.find((r) => r.value == values.seva_tehsil_id) ??
                        null
                      }
                      required
                      name={"seva_tehsil_id"}
                      onChange={(e: any) => {
                        setFieldValue("seva_tehsil_id", e.value);
                      }}
                    />
                  )}
                </>
              )}
              <Button
                className="w-full"
                type="submit"
                loading={loading}
                disabled={loading}
              >
                Submit
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </Layout>
  );
};

CreateSevadarPage.requireAuth = true;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "order"])),
    },
  };
};

export default CreateSevadarPage;
