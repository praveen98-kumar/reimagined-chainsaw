import Button from "@/components/Button";
import Select from "@/components/input/Select";
import Layout from "@/components/Layout";
import apiClient from "@/http/index";
import {
  getStates,
  handleDistrictChange,
  handleStateChange,
  handleStateChangeForDivisions,
} from "@/shared/functions/location";
import {
  capitalizeWords,
  getOptionArray,
  objectWithValues,
} from "@/shared/functions/utils";
import { Option } from "@/shared/interfaces/option";
import { Formik, Form } from "formik";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ImCross } from "react-icons/im";
import * as Yup from "yup";
import Modal from "@/components/modal/Modal";
import { FaQuestionCircle } from "react-icons/fa";
import useLocalstorage from "../../../hooks/useLocalstorage";
import { defaultCountries, regionHirarchy } from "@/constants/app";
import { RoleCard } from "@/components/card/UserCard";
import { useAppSelector } from "@/redux/store";
import DiscipleCard from "@/components/card/DiscipleCard";

const schema = Yup.object({
  role_id: Yup.number()
    .required("Select Role")
    .test("role_id", "Select Role", (v: any) => Number(v) > 0),
  region_level: Yup.number(),
  country_id: Yup.number().when("region_level", (region_level, passSchema) =>
    typeof region_level === "number" && region_level >= 1
      ? passSchema
          .required("Country is required.")
          .test("country_id", "Country is required", (v: any) => Number(v) > 0)
      : passSchema,
  ),
  state_id: Yup.number().when("region_level", (region_level, passSchema) =>
    typeof region_level === "number" && region_level >= 2
      ? passSchema
          .required("State is required.")
          .test("state_id", "State is required", (v: any) => Number(v) > 0)
      : passSchema,
  ),
  division_id: Yup.number().when("region_level", (region_level, passSchema) =>
    typeof region_level === "number" && region_level == 3
      ? passSchema
          .required("Division is required.")
          .test(
            "division_id",
            "Division is required",
            (v: any) => Number(v) > 0,
          )
      : passSchema,
  ),
  district_id: Yup.number().when("region_level", (region_level, passSchema) =>
    typeof region_level === "number" && region_level > 3
      ? passSchema
          .required("District is required.")
          .test(
            "district_id",
            "District is required",
            (v: any) => Number(v) > 0,
          )
      : passSchema,
  ),
  tehsil_id: Yup.number().when("region_level", (region_level, passSchema) =>
    typeof region_level === "number" && region_level >= 5
      ? passSchema
          .required("Tehsil is required.")
          .test("tehsil_id", "Tehsil is required", (v: any) => Number(v) > 0)
      : passSchema,
  ),
});

const AllotRoleProfile = () => {
  const [roles, setRoles] = useState<Option[]>([]);
  const [show, setShow] = useState<boolean>(false);
  const [allroles, setAllroles] = useState<any[]>([]);
  const [countries] = useState<Option[]>(defaultCountries);
  const [allStates, setAllStates] = useState<Option[]>([]);
  const [states, setStates] = useState<Option[]>([]);
  const [districts, setDistricts] = useState<Option[]>([]);
  const [divisions, setDivisions] = useState<Option[]>([]);
  const [tehsils, setTehsils] = useState<Option[]>([]);
  const router = useRouter();
  const [allottedRoles, setAllottedRoles] = useState<any[]>([]);
  const [selectedDisciple] = useLocalstorage<any>("selectedDisciple") ?? null;
  const [user, setUser] = useState<Record<string, any> | null>(null);
  const [existingRoles, setExistingRoles] = useState<any[]>([]);
  const [userExist, setUserExist] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const { active_permission, active_region_index } = useAppSelector(
    (state) => state.auth,
  );
  const userRegionHirarchyIndex = regionHirarchy.findIndex(
    (r) => r === (active_permission?.role_region ?? "country"),
  );

  // Roles (and their allowed states) come from the user's role creation permissions
  const filterStatesForRole = (stateOptions: Option[], roleId: number) => {
    const stateIds: number[] | null | undefined = allroles.find(
      (r) => r.id == roleId,
    )?.state_ids;
    return stateIds
      ? stateOptions.filter((s) => stateIds.includes(Number(s.value)))
      : stateOptions;
  };

  const getRoles = useCallback(async () => {
    try {
      const { data } = await apiClient.get("roles", {
        params: { for_add: 1 },
      });
      let temp = getOptionArray(data.data, "name", "id");
      temp = temp.map(({ label, value }) => ({
        value,
        label: capitalizeWords(label.replace(/_/g, " ")),
      }));
      setRoles(temp);
      setAllroles(data.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getUserProfile = useCallback(async () => {
    try {
      const { data } = await apiClient.get(
        `user/${router.query?.userId ?? 0}`,
        {
          // for_add: only roles the current user is permitted to manage
          params: { disciple_id: router.query.profileId, for_add: 1 },
        },
      );
      setUser(data.data);
      setUserExist(true);
      setExistingRoles(data.data.allotted_tehsil);
    } catch (error) {
      console.log(error);
      setUser(selectedDisciple);
    }
  }, [router.query.profileId, router.query?.userId]);

  const removeSeva = (index: number) => {
    const temp = [...allottedRoles].filter((_, i) => i !== index);
    setAllottedRoles(temp);
  };

  useEffect(() => {
    if (router.query.profileId) {
      getUserProfile();
    }
  }, [router.isReady]);

  const addRole = (values: any) => {
    const roleName = roles.find(({ value }) => value == values.role_id);
    const tempRole = { ...values, key: roleName?.label };
    setAllottedRoles([...allottedRoles, tempRole]);
  };
  const closeModal = () => {
    setShow(false);
  };
  const removeExistingRole = async (e: any) => {
    try {
      const { data } = await apiClient.delete(`remove_user_role/${e.id}`);
      getUserProfile();
      toast.success(data.message);
    } catch (error) {
      console.error(error);
    }
    setShow(false);
  };

  const onUpdate = async () => {
    const roles = allottedRoles.map(({ key, title, ...rest }) => rest);
    if (!roles.length) {
      toast.error("Please add role.");
      return;
    }
    try {
      const response = await apiClient.post("allot_roles", {
        user_id: !userExist ? 0 : user?.id,
        roles,
        ...(!userExist && selectedDisciple),
      });
      toast.success(response.data?.message);
      router.back();
    } catch (error: any) {
      toast.error(error.response?.data?.error);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await getRoles();
        const tempStates = await getStates(defaultCountries[0].value);
        setAllStates(tempStates);
        setStates(tempStates);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);
  return (
    <Layout headerProps={{ isBack: true, heading: "Sevadar Profile" }}>
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        {user != null && (
          <DiscipleCard disciple={{ ...user, ...user?.disciple }} />
        )}
        <div>
          {user != null && existingRoles.length > 0 && (
            <div className="space-y-2">
              <p className="font-bold text-primary">Existing Roles</p>
              {existingRoles.map((el: any, i: number) => (
                <RoleCard
                  role={el}
                  key={`existing_role_${i}`}
                  showDelete
                  onDeleteClick={() => {
                    setSelectedRole(el);
                    setShow(true);
                  }}
                />
              ))}
            </div>
          )}
          {allottedRoles.length > 0 && (
            <div
              className={`space-y-2 mt-2 ${
                existingRoles.length > 0 ? "border-t-2 border-gray-500" : ""
              }`}
            >
              <p className="font-bold mt-2 text-primary">
                New Roles To be Added
              </p>
              {allottedRoles.map((el, i) => (
                <div key={i} className="flex items-center justify-between px-2">
                  <p>{`${el.key} (${el.title})`}</p>
                  <ImCross
                    onClick={() => removeSeva(i)}
                    className="text-primary cursor-pointer text-red-400"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <Formik
          initialValues={{
            region_level: 0,
            role_id: 0,
            country_id: defaultCountries[0].value,
            state_id:
              active_permission?.region?.[active_region_index]?.state_id ?? 0,
            division_id: 0,
            district_id: 0,
            tehsil_id: 0,
            title: "",
          }}
          validationSchema={schema}
          onSubmit={(values, { resetForm }) => {
            const { region_level, ...rest } = values;
            addRole(objectWithValues(rest));
            resetForm();
          }}
        >
          {({ values, setFieldValue }) => (
            <Form>
              <Select
                label="Role"
                options={roles}
                placeholder={"Select Role"}
                name={"role_id"}
                value={roles.find((r) => r.value == values.role_id) ?? null}
                onChange={(e: any) => {
                  setFieldValue("role_id", e.value);
                  const temp = allroles.find((r) => Number(e.value) == r.id);
                  const index = regionHirarchy.findIndex(
                    (item) => item == temp.region,
                  );
                  setFieldValue("region_level", index);
                  const roleStates = filterStatesForRole(allStates, e.value);
                  setStates(roleStates);
                  if (
                    userRegionHirarchyIndex < 2 &&
                    !roleStates.some((s) => s.value == values.state_id)
                  ) {
                    setFieldValue("state_id", 0);
                  }
                  if (index == 0) {
                    const temp = countries.find(
                      (c) => c.value == values.country_id,
                    )?.label;
                    setFieldValue("title", temp);
                  }
                  if (
                    userRegionHirarchyIndex == 2 &&
                    active_permission?.region?.[active_region_index]?.state_id
                  ) {
                    if (index == 3) {
                      handleStateChangeForDivisions(
                        active_permission?.region?.[active_region_index]
                          ?.state_id,
                        setDivisions,
                      );
                    } else {
                      handleStateChange(
                        active_permission?.region?.[active_region_index]
                          ?.state_id,
                        setDistricts,
                      );
                    }
                  }
                }}
              />
              {values.role_id !== 0 && (
                <>
                  <Select
                    fieldClass={
                      values.region_level >= 1 && userRegionHirarchyIndex < 1
                        ? ""
                        : "hidden"
                    }
                    label="Country"
                    placeholder={"Select Country/देश चुनें"}
                    options={countries}
                    value={
                      countries.find((r) => r.value == values.country_id) ??
                      null
                    }
                    name={"country_id"}
                    onChange={(e: any) => {
                      setFieldValue("country_id", e.value);
                      if (values.region_level > 1) {
                        getStates(e.value).then((countryStates) => {
                          setAllStates(countryStates);
                          setStates(
                            filterStatesForRole(countryStates, values.role_id),
                          );
                        });
                      }
                      if (values.region_level == 1) {
                        const temp = countries.find(
                          (c) => c.value == e.value,
                        )?.label;
                        setFieldValue("title", temp);
                      }
                    }}
                    isOptionDisabled={(option: any) =>
                      values?.region_level === 1
                        ? [...existingRoles, ...allottedRoles].some(
                            (role) =>
                              role?.country_id === option.value &&
                              role?.id === values.role_id,
                          )
                        : false
                    }
                  />
                  <Select
                    fieldClass={
                      values.region_level >= 2 && userRegionHirarchyIndex < 2
                        ? ""
                        : "hidden"
                    }
                    label="State"
                    options={states}
                    placeholder={"Select State/राज्य चुनें"}
                    value={
                      states.find((r) => r.value == values.state_id) ?? null
                    }
                    name={"state_id"}
                    onChange={(e: any) => {
                      setFieldValue("state_id", e.value);
                      if (values.region_level == 3) {
                        handleStateChangeForDivisions(e.value, setDivisions);
                      } else if (values.region_level > 3) {
                        handleStateChange(e.value, setDistricts);
                      }
                      if (values.region_level == 2) {
                        const temp = states.find(
                          (c) => c.value == e.value,
                        )?.label;
                        setFieldValue("title", temp);
                      }
                    }}
                    isOptionDisabled={(option: any) =>
                      values?.region_level === 2
                        ? [...existingRoles, ...allottedRoles].some(
                            (role) =>
                              role?.state_id === option.value &&
                              role?.id === values.role_id,
                          )
                        : false
                    }
                  />

                  <Select
                    fieldClass={values.region_level == 3 ? "" : "hidden"}
                    label="Division"
                    options={divisions}
                    value={
                      divisions.find((r) => r.value == values.division_id) ??
                      null
                    }
                    name={"division_id"}
                    onChange={(e: any) => {
                      setFieldValue("division_id", e.value);
                      if (values.region_level == 3) {
                        const temp = divisions.find(
                          (c) => c.value == e.value,
                        )?.label;
                        setFieldValue("title", temp);
                      }
                    }}
                    isOptionDisabled={(option: any) =>
                      values?.region_level === 3
                        ? [...existingRoles, ...allottedRoles].some(
                            (role) =>
                              role?.division_id === option.value &&
                              role?.id === values.role_id,
                          )
                        : false
                    }
                  />
                  <Select
                    fieldClass={values.region_level >= 4 ? "" : "hidden"}
                    label="District"
                    value={
                      districts.find((r) => r.value == values.district_id) ??
                      null
                    }
                    placeholder="Select District/ज़िला चुनें"
                    options={districts}
                    name={"district_id"}
                    onChange={(e: any) => {
                      setFieldValue("district_id", e.value);
                      if (values.region_level > 4 || values.role_id == 55) {
                        handleDistrictChange(e.value, setTehsils);
                      }
                      if (values.region_level == 4) {
                        const temp = districts.find(
                          (c) => c.value == e.value,
                        )?.label;
                        setFieldValue("title", temp);
                      }
                    }}
                    isOptionDisabled={(option: any) =>
                      values?.region_level === 4
                        ? [...existingRoles, ...allottedRoles].some(
                            (role) =>
                              role?.district_id === option.value &&
                              role?.id === values.role_id,
                          )
                        : false
                    }
                  />
                  <Select
                    fieldClass={
                      values.region_level >= 5 || values.role_id == 55
                        ? ""
                        : "hidden"
                    }
                    label="Tehsil"
                    options={tehsils}
                    value={
                      tehsils.find((r) => r.value == values.tehsil_id) ?? null
                    }
                    name={"tehsil_id"}
                    onChange={(e: any) => {
                      setFieldValue("tehsil_id", e.value);
                      if (values.region_level == 5) {
                        const temp = tehsils.find(
                          (c) => c.value == e.value,
                        )?.label;
                        setFieldValue("title", temp);
                      }
                    }}
                    isOptionDisabled={(option: any) =>
                      values?.region_level === 5
                        ? [...existingRoles, ...allottedRoles].some(
                            (role) =>
                              role?.tehsil_id === option.value &&
                              role?.id === values.role_id,
                          )
                        : false
                    }
                  />
                </>
              )}
              <div className="text-center mt-4">
                <Button type="submit" className="mx-auto py-2">
                  + Add Role
                </Button>
              </div>
            </Form>
          )}
        </Formik>
        <div className="flex items-center justify-center space-x-6 pt-8 pb-6">
          <button
            className="bg-green-600 w-1/2 text-white inline-block font-bold px-7 py-3 rounded-xl"
            type="button"
            onClick={onUpdate}
          >
            Update
          </button>
          <button
            className="bg-red-600 text-white w-1/2 font-bold px-7 inline-block py-3 rounded-xl"
            type="reset"
            onClick={() => setAllottedRoles([])}
          >
            Cancel
          </button>
        </div>
        <Modal
          show={show}
          onClose={closeModal}
          onConfirm={() => removeExistingRole(selectedRole)}
        >
          <div className="space-y-8 mb-8 text-center">
            <FaQuestionCircle className=" mx-auto w-20 h-20 text-primary" />
            <p className="font-normal text-xl">Are you sure to remove role?</p>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default AllotRoleProfile;
