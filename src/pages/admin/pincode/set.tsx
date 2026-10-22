import Button from "@/components/Button";
import Select from "@/components/input/Select";
import TextInput from "@/components/input/TextInput";
import Layout from "@/components/Layout";
import Modal from "@/components/modal/Modal";
import apiClient from "@/http/index";
import {
  getDistricts,
  getDistrictsUnderDivision,
  getDivisions,
  getStates,
  getTehsils,
} from "@/shared/functions/location";
import { getOptionArray } from "@/shared/functions/utils";
import { Option } from "@/shared/interfaces/option";
import { defaultCountries } from "@/constants/app";
import { Form, Formik, FormikProps, FormikValues } from "formik";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  Fragment,
} from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FaQuestionCircle } from "react-icons/fa";
import { IoMdTrash } from "react-icons/io";
import { MdAddCircle, MdEdit } from "react-icons/md";
import * as yup from "yup";

type Entry = { [k: string]: number | string | boolean };

const schema = yup.object({
  pincode: yup.string().required("Pincode is required"),
  country_id: yup.number().when("incorrect", {
    is: false,
    then: (schema) =>
      schema
        .required("Country is required")
        .test("test-country", "Country is required", (v) => Number(v) > 0),
    otherwise: (schema) => schema,
  }),
  state_id: yup.number().when("incorrect", {
    is: false,
    then: (schema) =>
      schema
        .required("State is required")
        .test("test-state", "State is required", (v) => Number(v) > 0),
    otherwise: (schema) => schema,
  }),
  district_id: yup.number().when("incorrect", {
    is: false,
    then: (schema) =>
      schema
        .required("District is required")
        .test("test-district", "District is required", (v) => Number(v) > 0),
    otherwise: (schema) => schema,
  }),
  tehsil_id: yup.number().when("incorrect", {
    is: false,
    then: (schema) =>
      schema
        .required("Tehsil is required")
        .test("test-tehsil", "Tehsil is required", (v) => Number(v) > 0),
    otherwise: (schema) => schema,
  }),
  incorrect: yup.boolean(),
});

type Payload = {
  pincode: string;
  region: {
    country_id: number;
    state_id: number;
    district_id: number;
    tehsil_id: number;
  }[];
  incorrect?: boolean;
}[];

type ModalType =
  | "editState"
  | "deleteState"
  | "editTehsil"
  | "addTehsil"
  | "deleteTehsil"
  | "addDistrict"
  | "editDistrict"
  | "deleteDistrict"
  | "editDivision"
  | "addDivision"
  | "deleteDivision"
  | undefined;

const SetPincodePage = () => {
  const [entries, setEntries] = useState<Array<Entry>>([]);
  const [pincodes, setPincodes] = useState<Array<Option>>([]);
  const [countries] = useState<Array<Option>>(defaultCountries);
  const [states, setStates] = useState<Array<Option>>([]);
  const [districts, setDistricts] = useState<Array<Option>>([]);
  const [stateDistricts, setStateDistricts] = useState<Array<Option>>([]);
  const [divisions, setDivision] = useState<Array<Option>>([]);
  const [tehsils, setTehsils] = useState<Array<Option>>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const { t: th } = useTranslation("home");
  const { t: tc } = useTranslation("common");
  const [showModal, setShowModal] = useState(false);
  const formRef = useRef<FormikProps<FormikValues>>(null);
  const [modalType, setModalType] = useState<ModalType>(undefined);

  async function updateOrDeleteState(data: any) {
    setAdding(true);
    try {
      if (modalType === "editState") {
        await apiClient.put(
          `state/${formRef?.current?.values?.state_id}`,
          data,
        );
      } else {
        await apiClient.delete(`state/${formRef?.current?.values?.state_id}`);
      }
      await handleCountryChange(data?.country_id);
      formRef?.current?.setFieldValue("state_id", data?.state_id);
      toast.success(
        modalType === "editState" ? "State is updatd." : "State is deleted",
      );
      setModalType(undefined);
    } catch (error: any) {
      console.error(error);
      if (error?.response?.status === 406) {
        return toast.error(error?.response?.data?.error);
      } else if (error?.response?.status === 401) {
        return toast.error("Not authorized");
      } else {
        toast.error(
          modalType === "editState"
            ? "Could not edit state."
            : "Could not delete state.",
        );
      }
    } finally {
      setAdding(false);
    }
  }

  const addOrUpdateOrDeleteDivision = async (data: any) => {
    setAdding(true);
    try {
      if (modalType == "editDivision") {
        await apiClient.put(
          `division/${formRef?.current?.values?.division_id}`,
          data,
        );
      } else if (modalType === "addDivision") {
        await apiClient.post("division_list", data);
      } else if (modalType === "deleteDivision") {
        await apiClient.delete(
          `division/${formRef?.current?.values?.division_id}`,
        );
      }
      await handleStateChange(data?.state_id);
      toast.success(
        modalType == "addDivision"
          ? `Division is added.`
          : modalType == "deleteDivision"
            ? "Division is deleted"
            : "Division is updatd.",
      );
      setModalType(undefined);
    } catch (error: any) {
      console.error(error);
      if (error?.response?.status === 406) {
        return toast.error(error?.response?.data?.error);
      } else if (error?.response?.status === 401) {
        return toast.error("Not authorized");
      } else {
        toast.error(
          modalType == "addDivision"
            ? "Could not add division."
            : modalType == "deleteDivision"
              ? "Could not delete division"
              : "Could not edit division.",
        );
      }
    } finally {
      setAdding(false);
    }
  };

  const addOrUpdateOrDeleteTehsil = async (data: any) => {
    setAdding(true);
    try {
      if (modalType == "editTehsil") {
        await apiClient.put(
          `tehsil/${formRef?.current?.values?.tehsil_id}`,
          data,
        );
      } else if (modalType === "addTehsil") {
        await apiClient.post("tehsil_list", data);
      } else if (modalType === "deleteTehsil") {
        await apiClient.delete(`tehsil/${formRef?.current?.values?.tehsil_id}`);
      }
      handleDistrictChange(data?.district_id);
      toast.success(
        modalType == "addTehsil"
          ? `Tehsil is added.`
          : modalType == "deleteTehsil"
            ? "Tehsil is deleted"
            : "Tehsil is updatd.",
      );
      setModalType(undefined);
    } catch (error: any) {
      console.error(error);
      if (error?.response?.status === 406) {
        return toast.error(error?.response?.data?.error);
      } else if (error?.response?.status === 401) {
        return toast.error("Not authorized");
      } else {
        toast.error(
          modalType == "addTehsil"
            ? "Could not add tehsil."
            : modalType == "deleteTehsil"
              ? "Could not delete tehsil"
              : "Could not edit tehsil.",
        );
      }
    } finally {
      setAdding(false);
    }
  };

  const addOrUpdateDistrict = async (data: any) => {
    setAdding(true);
    try {
      if (modalType == "editDistrict") {
        if (formRef?.current?.values?.showDivision) {
          await apiClient.put("division_district", data);
        } else {
          await apiClient.put(
            `district/${formRef?.current?.values?.district_id}`,
            data,
          );
        }
      } else if (modalType === "addDistrict") {
        if (formRef?.current?.values?.showDivision) {
          await apiClient.post("division_district", data);
        } else {
          await apiClient.post("districts", data);
        }
      } else if (modalType == "deleteDistrict") {
        if (formRef?.current?.values?.showDivision) {
          await apiClient.delete("division_district", { data });
        } else {
          await apiClient.delete(
            `district/${formRef?.current?.values?.district_id}`,
          );
        }
      }
      if (formRef?.current?.values?.showDivision) {
        await handleDivisionChange(data?.division_id);
      } else {
        await handleStateChange(data?.state_id);
      }
      if (modalType === "editDistrict") {
        formRef?.current?.setFieldValue("district_id", data?.district_id);
      }
      toast.success(
        modalType == "addDistrict"
          ? `District is added.`
          : modalType == "deleteDistrict"
            ? "District is deleted"
            : "District is updatd.",
      );

      setModalType(undefined);
    } catch (error: any) {
      console.error(error);
      if (error?.response?.status === 406) {
        return toast.error(error?.response?.data?.error);
      } else if (error?.response?.status === 401) {
        return toast.error("Not authorized");
      } else {
        toast.error(
          modalType == "addDistrict"
            ? "Could not add district."
            : modalType == "deleteDistrict"
              ? "Could not delete district"
              : "Could not edit district.",
        );
      }
    } finally {
      setAdding(false);
    }
  };

  const getPincodes = useCallback(async () => {
    try {
      const { data } = await apiClient.get("pincode_from_pincode_orders");
      setPincodes(getOptionArray(data.data, "pincode", "pincode"));
    } catch (error) {
      console.error(error);
    }
  }, []);

  const loadStates = useCallback(async () => {
    try {
      if (formRef?.current) {
        handleCountryChange(2);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    loadStates();
    getPincodes();
  }, []);

  const handleCountryChange = async (country_id: number) => {
    try {
      const tempS = await getStates(country_id);
      const c_name = countries.find((s) => s.value == country_id)?.label;
      if (formRef?.current) {
        formRef.current.setFieldValue("country_name", c_name);
      }
      setStates(tempS);
    } catch (error) {
      console.error(error);
    }
  };

  const handleStateChange = async (
    state_id: number,
    showDivision?: boolean,
  ) => {
    try {
      const isDivisionVisible =
        showDivision ?? formRef?.current?.values?.showDivision;
      let tempD: Array<Option>;
      if (isDivisionVisible) {
        tempD = await getDivisions(state_id);
        setDivision(tempD);
        setDistricts([]);
      } else {
        tempD = await getDistricts(state_id);
        setDistricts(tempD);
        setStateDistricts(tempD);
      }
      const s_name = states.find((s) => s.value == state_id)?.label;
      setTehsils([]);
      if (formRef?.current) {
        formRef.current.setFieldValue("state_name", s_name);
        formRef.current.setFieldValue("division_id", 0);
        formRef.current.setFieldValue("division_name", "");
        formRef.current.setFieldValue("district_id", 0);
        formRef.current.setFieldValue("district_name", "");
        formRef.current.setFieldValue("tehsil_id", 0);
        formRef.current.setFieldValue("tehsil_name", "");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDistrictChange = async (district_id: number) => {
    try {
      const tempD = await getTehsils(district_id);
      setTehsils(tempD);
      const d_name = districts.find((s) => s.value == district_id)?.label;
      if (formRef?.current) {
        formRef.current.setFieldValue("district_name", d_name);
        formRef.current.setFieldValue("tehsil_id", 0);
        formRef.current.setFieldValue("tehsil_name", "");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDivisionChange = async (division_id: number) => {
    try {
      const tempD = await getDistrictsUnderDivision(division_id);
      setDistricts(tempD);
      const d_name = divisions.find((s) => s.value == division_id)?.label;
      if (formRef?.current) {
        formRef.current.setFieldValue("division_name", d_name);
        formRef.current.setFieldValue("district_id", 0);
        formRef.current.setFieldValue("district_name", "");
        formRef.current.setFieldValue("tehsil_id", 0);
        formRef.current.setFieldValue("tehsil_name", "");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    if (entries.length == 0) {
      toast.error("Add atleast one entry");
      return;
    }
    setLoading(true);
    const payload: Payload = entries.reduce((acc: Payload, curr: Entry) => {
      const index = acc.findIndex((a) => a.pincode == curr.pincode);
      // if pincode is already in acc
      if (index !== -1) {
        acc[index].region.push({
          country_id: curr.country_id as number,
          state_id: curr.state_id as number,
          district_id: curr.district_id as number,
          tehsil_id: curr.tehsil_id as number,
        });
      } else {
        acc.push({
          pincode: curr.pincode as string,
          region: curr.incorrect
            ? []
            : [
                {
                  country_id: curr.country_id as number,
                  state_id: curr.state_id as number,
                  district_id: curr.district_id as number,
                  tehsil_id: curr.tehsil_id as number,
                },
              ],
          ...(curr.incorrect === true && {
            incorrect: curr.incorrect as boolean,
          }),
        });
      }

      return acc;
    }, []);

    const payloadData = [...payload].map((p) =>
      p.incorrect ? { ...p, incorrect: 1 } : p,
    );

    try {
      const response = await apiClient.post(
        "pincode_from_pincode_orders",
        payloadData,
      );
      toast.success(response?.data?.message);
      resetPage();
      setPincodes(
        pincodes.filter(
          (pincode) =>
            !payloadData
              .map((pin) => pin["pincode"])
              .includes(pincode.value.toString()),
        ),
      );
    } catch (error) {
      toast.error("Could not add pincode");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetPage = () => {
    setDistricts([]);
    setTehsils([]);
    setEntries([]);
    // getPincodes();
  };

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: th("seva.title.set_pincode") ?? "Set Pincode",
      }}
    >
      <div className="p-4">
        <div className="w-full mb-4 flex items-center justify-between border-b-2 border-slate-500">
          <p className="text-lg font-semibold">Remaining Pincodes</p>
          <p className="text-md">{pincodes.length}</p>
        </div>
        <Formik
          innerRef={formRef}
          initialValues={{
            pincode: "",
            country_id: defaultCountries[0].value,
            state_id: 0,
            district_id: 0,
            division_id: 0,
            tehsil_id: 0,
            country_name: defaultCountries[0].label,
            state_name: "",
            district_name: "",
            division_name: "",
            tehsil_name: "",
            incorrect: false,
            showDivision: false,
          }}
          validationSchema={schema}
          onSubmit={(v, { resetForm, setFieldValue }) => {
            setEntries((prev) => [...prev, v]);
            if (v.incorrect) {
              resetForm();
              setFieldValue("country_id", 2);
              setFieldValue("country_name", "India");
            } else {
              setFieldValue("tehsil_id", 0);
              setFieldValue("tehsil_name", "");
            }
          }}
        >
          {({ values, setFieldValue, errors, touched }) => (
            <Form>
              <Select
                options={pincodes}
                label={"Select Pincode"}
                name="pincode"
                value={pincodes.find((c) => c.value == values.pincode) ?? null}
                onChange={(opt: any) => {
                  setFieldValue("pincode", opt?.value);
                }}
                isOptionDisabled={(option: any) =>
                  entries.some((e) => e.incorrect && e.pincode == option.value)
                }
                touched={!!touched.pincode}
                error={errors.pincode as string}
              />
              <div className="w-full flex items-center space-x-2 mb-1">
                <input
                  id="incorrect"
                  className="rounded"
                  type={"checkbox"}
                  name="incorrect"
                  disabled={!values.pincode}
                  checked={values.incorrect}
                  onChange={(e) => setFieldValue("incorrect", e.target.checked)}
                />
                <label htmlFor="incorrect">Incorrect Pincode</label>
              </div>
              <Select
                options={countries}
                label={"Select country"}
                name="country_id"
                isDisabled
                value={
                  countries.find((c) => c.value == values.country_id) ?? null
                }
                onChange={(opt: any) => {
                  setFieldValue("country_id", opt?.value);
                  handleCountryChange(opt?.value);
                }}
                touched={!!touched.country_id}
                error={errors.country_id as string}
              />
              <div className="grid grid-cols-4 sm:grid-cols-5">
                <Select
                  options={states}
                  label={"Select state"}
                  isDisabled={values.incorrect}
                  fieldClass="col-span-3 sm:col-span-4"
                  name="state_id"
                  value={states.find((c) => c.value == values.state_id) ?? null}
                  onChange={(opt: any) => {
                    setFieldValue("state_id", opt?.value);
                    handleStateChange(opt?.value);
                  }}
                  touched={!!touched.state_id}
                  error={errors.state_id as string}
                />
                <div className="flex justify-around h-full pt-8 items-start gap-2">
                  <button
                    type="button"
                    disabled={
                      !values.state_id ||
                      values.state_id == 0 ||
                      values.incorrect
                    }
                    onClick={() => {
                      setModalType("editState");
                      setShowModal(true);
                    }}
                    className="text-blue-500 disabled:text-blue-200"
                  >
                    <MdEdit className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    disabled={
                      !values.state_id ||
                      values.state_id == 0 ||
                      values.incorrect
                    }
                    onClick={() => {
                      setModalType("deleteState");
                      setShowModal(true);
                    }}
                    className="text-red-500 disabled:text-red-200"
                  >
                    <IoMdTrash className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="w-full flex items-center space-x-2 mb-1">
                <input
                  id="showDivision"
                  className="rounded"
                  type={"checkbox"}
                  name="showDivision"
                  checked={values.showDivision}
                  onChange={(e) => {
                    setFieldValue("showDivision", e.target.checked);
                    if (values.state_id) {
                      handleStateChange(values.state_id, e.target.checked);
                    }
                  }}
                />
                <label htmlFor="showDivision">Show division</label>
              </div>

              {values.showDivision && (
                <div className="grid grid-cols-4 sm:grid-cols-5">
                  <Select
                    options={divisions}
                    label={"Select division"}
                    name="division_id"
                    isDisabled={!values.showDivision}
                    value={
                      divisions.find((c) => c.value == values.division_id) ??
                      null
                    }
                    fieldClass="col-span-3 sm:col-span-4"
                    onChange={(opt: any) => {
                      setFieldValue("division_id", opt?.value);
                      handleDivisionChange(opt?.value);
                    }}
                    touched={!!touched.division_id}
                    error={errors.division_id as string}
                  />
                  <div className="flex justify-around h-full pt-8 items-start gap-2">
                    <button
                      type="button"
                      className="text-emerald-500 disabled:text-emerald-200"
                      disabled={values.incorrect || !values.state_id}
                      onClick={() => {
                        setModalType("addDivision");
                        setShowModal(true);
                      }}
                    >
                      <MdAddCircle className="w-6 h-6" />
                    </button>
                    <button
                      type="button"
                      disabled={
                        !values.division_id ||
                        values.division_id == 0 ||
                        values.incorrect
                      }
                      onClick={() => {
                        setModalType("editDivision");
                        setShowModal(true);
                      }}
                      className="text-blue-500 disabled:text-blue-200"
                    >
                      <MdEdit className="w-6 h-6" />
                    </button>
                    <button
                      type="button"
                      disabled={
                        !values.division_id ||
                        values.division_id == 0 ||
                        values.incorrect
                      }
                      onClick={() => {
                        setModalType("deleteDivision");
                        setShowModal(true);
                      }}
                      className="text-red-500 disabled:text-red-200"
                    >
                      <IoMdTrash className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-4 sm:grid-cols-5">
                <Select
                  options={districts}
                  label={"Select district"}
                  name="district_id"
                  isDisabled={values.incorrect}
                  value={
                    districts.find((c) => c.value == values.district_id) ?? null
                  }
                  fieldClass="col-span-3 sm:col-span-4"
                  onChange={(opt: any) => {
                    setFieldValue("district_id", opt?.value);
                    handleDistrictChange(opt?.value);
                  }}
                  touched={!!touched.district_id}
                  error={errors.district_id as string}
                />
                <div className="flex justify-around h-full pt-8 items-start gap-2">
                  <button
                    type="button"
                    className="text-emerald-500 disabled:text-emerald-200"
                    disabled={
                      values.incorrect ||
                      !values.state_id ||
                      (values.showDivision && !values.division_id)
                    }
                    onClick={() => {
                      setModalType("addDistrict");
                      setShowModal(true);
                    }}
                  >
                    <MdAddCircle className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    disabled={
                      !values.district_id ||
                      values.district_id == 0 ||
                      (values.showDivision &&
                        (!values.division_id || values.division_id == 0)) ||
                      values.incorrect
                    }
                    onClick={() => {
                      setModalType("editDistrict");
                      setShowModal(true);
                    }}
                    className="text-blue-500 disabled:text-blue-200"
                  >
                    <MdEdit className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    disabled={
                      !values.district_id ||
                      values.district_id == 0 ||
                      (values.showDivision &&
                        (!values.division_id || values.division_id == 0)) ||
                      values.incorrect
                    }
                    onClick={() => {
                      setModalType("deleteDistrict");
                      setShowModal(true);
                    }}
                    className="text-red-500 disabled:text-red-200"
                  >
                    <IoMdTrash className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5">
                <Select
                  options={tehsils}
                  label={"Select tehsil"}
                  name="tehsil_id"
                  value={
                    tehsils.find((c) => c.value == values.tehsil_id) ?? null
                  }
                  fieldClass="col-span-3 sm:col-span-4"
                  onChange={(opt: any) => {
                    setFieldValue("tehsil_id", opt?.value);
                    const d_name = tehsils.find(
                      (s) => s.value == opt?.value,
                    )?.label;
                    setFieldValue("tehsil_name", d_name);
                  }}
                  isOptionDisabled={(option: any) =>
                    entries.some(
                      (e) =>
                        e.tehsil_id == option.value &&
                        e.pincode == values.pincode,
                    )
                  }
                  isDisabled={values.incorrect}
                  touched={!!touched.tehsil_id}
                  error={errors.tehsil_id as string}
                />
                <div className="flex justify-around h-full pt-8 items-start gap-2">
                  <button
                    type="button"
                    className="text-emerald-500 disabled:text-emerald-200"
                    disabled={values.incorrect || !values.district_id}
                    onClick={() => {
                      setModalType("addTehsil");
                      setShowModal(true);
                    }}
                  >
                    <MdAddCircle className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    disabled={
                      !values.tehsil_id ||
                      values.tehsil_id == 0 ||
                      values.incorrect
                    }
                    onClick={() => {
                      setModalType("editTehsil");
                      setShowModal(true);
                    }}
                    className="text-blue-500 disabled:text-blue-200"
                  >
                    <MdEdit className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    disabled={
                      !values.tehsil_id ||
                      values.tehsil_id == 0 ||
                      values.incorrect
                    }
                    onClick={() => {
                      setModalType("deleteTehsil");
                      setShowModal(true);
                    }}
                    className="text-red-500 disabled:text-red-200"
                  >
                    <IoMdTrash className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <Button className="mx-auto w-1/2 sm:w-fit" type="submit">
                {tc("add")}
              </Button>
            </Form>
          )}
        </Formik>
        <div className="w-full my-4 max-h-screen overflow-x-scroll">
          <table className="w-full">
            <thead
              style={{ zIndex: 1 }}
              className="w-full sticky top-0 bg-black text-white"
            >
              <tr>
                <th className="px-1.5">#</th>
                <th className="px-1.5">Pincode</th>
                <th className="px-1.5">Incorrect</th>
                <th className="px-1.5">State</th>
                <th className="px-1.5">District</th>
                <th className="px-1.5">Tehsil</th>
                <th className="px-1.5">Action</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry: Entry, index: number) => (
                <tr
                  key={index}
                  className=" border-b border-gray-400 last:border-none odd:bg-blue-100"
                >
                  <td className="text-center px-1.5">{index + 1}</td>
                  <td className="text-center px-1.5">{entry.pincode}</td>
                  <td className="text-center px-1.5">
                    {entry.incorrect ? (
                      <input
                        type="checkbox"
                        id={`check-${index}`}
                        checked={entry.pincode as boolean}
                        className="rounded disabled:bg-gray-400"
                        disabled
                        readOnly
                      />
                    ) : null}
                  </td>
                  <td className="text-center px-1.5">
                    {entry.incorrect ? "-" : entry.state_name}
                  </td>
                  <td className="text-center px-1.5">
                    {entry.incorrect ? "-" : entry.district_name}
                  </td>
                  <td className="text-center px-1.5">
                    {entry.incorrect ? "-" : entry.tehsil_name}
                  </td>
                  <td className="text-center px-1.5 py-2">
                    <button
                      onClick={() => {
                        const temp = [...entries].filter(
                          (e) => e.tehsil_id !== entry.tehsil_id,
                        );
                        setEntries(temp);
                      }}
                    >
                      <IoMdTrash className="w-5 h-5 text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button
          type="button"
          className="mx-auto w-1/2 sm:w-fit"
          onClick={handleSubmit}
          loading={loading}
          disabled={loading}
        >
          {tc("submit")}
        </Button>
      </div>
      {(modalType == "editState" || modalType === "deleteState") && (
        <AddUpdateModal
          showModal={showModal}
          setShowModal={setShowModal}
          loading={adding}
          onSubmit={async (val) => {
            let data = {
              name: val.name,
              country_id: val.move
                ? val.id
                : formRef?.current?.values?.country_id,
            };
            if (!formRef?.current?.values?.state_id) {
              return toast.error("Select state");
            }
            await updateOrDeleteState(data);
            setShowModal(false);
          }}
          initialValues={{
            name: formRef?.current?.values.state_name,
          }}
          modalType={modalType}
          inputLabel="State Name"
          showMove={false}
          moveOptions={states}
          moveOptionLabel="state"
        />
      )}
      {(modalType == "editTehsil" ||
        modalType == "addTehsil" ||
        modalType == "deleteTehsil") && (
        <AddUpdateModal
          showModal={showModal}
          setShowModal={setShowModal}
          loading={adding}
          onSubmit={async (val) => {
            let data = {
              name: val.name,
              district_id: val.move
                ? val.id
                : formRef?.current?.values?.district_id,
            };
            if (!formRef?.current?.values?.district_id) {
              return toast.error("Select district");
            }
            await addOrUpdateOrDeleteTehsil(data);
            await handleDistrictChange(formRef?.current?.values?.district_id);
            setShowModal(false);
          }}
          initialValues={{
            name:
              modalType != "addTehsil"
                ? formRef?.current?.values.tehsil_name
                : "",
          }}
          modalType={modalType}
          showMove={modalType == "editTehsil"}
          moveOptions={districts}
          moveOptionLabel="district"
        />
      )}
      {(modalType == "editDivision" ||
        modalType == "addDivision" ||
        modalType === "deleteDivision") && (
        <AddUpdateModal
          showModal={showModal}
          inputLabel="Division Name"
          setShowModal={setShowModal}
          loading={adding}
          onSubmit={async (val) => {
            let data = {
              name: val.name,
              state_id: val.move ? val.id : formRef?.current?.values?.state_id,
            };
            if (!formRef?.current?.values?.state_id) {
              return toast.error("Select state");
            }
            await addOrUpdateOrDeleteDivision(data);
            await handleStateChange(formRef?.current?.values?.state_id);
            setShowModal(false);
          }}
          initialValues={{
            name:
              modalType != "addDivision"
                ? formRef?.current?.values.division_name
                : "",
          }}
          modalType={modalType}
          showMove={modalType == "editDivision"}
          moveOptions={states}
          moveOptionLabel="state"
        />
      )}
      {(modalType == "editDistrict" ||
        modalType == "addDistrict" ||
        modalType === "deleteDistrict") && (
        <AddUpdateModal
          showModal={showModal}
          inputLabel="District Name"
          setShowModal={setShowModal}
          loading={adding}
          onSubmit={async (val) => {
            const data = formRef?.current?.values?.showDivision
              ? {
                  division_id: formRef?.current?.values?.division_id,
                  district_id:
                    modalType == "addDistrict"
                      ? val.id
                      : formRef?.current?.values?.district_id,
                  ...(modalType == "editDistrict" && {
                    new_division_id: val.id,
                  }),
                }
              : {
                  name: val.name,
                  state_id: val.move
                    ? val.id
                    : formRef?.current?.values?.state_id,
                };

            if (!formRef?.current?.values?.state_id) {
              return toast.error("Select state");
            }
            await addOrUpdateDistrict(data);
            await handleStateChange(formRef?.current?.values?.state_id);
            setShowModal(false);
          }}
          initialValues={{
            name:
              modalType != "addDistrict"
                ? formRef?.current?.values.district_name
                : "",
            move:
              formRef?.current?.values?.showDivision &&
              modalType == "addDistrict",
          }}
          modalType={modalType}
          showMove={
            modalType == "editDistrict" ||
            (formRef?.current?.values?.showDivision &&
              modalType == "addDistrict")
          }
          moveOptions={
            !formRef?.current?.values?.showDivision
              ? states
              : modalType == "addDistrict"
                ? stateDistricts
                : divisions
          }
          moveOptionLabel={
            !formRef?.current?.values?.showDivision
              ? "state"
              : modalType == "addDistrict"
                ? "district"
                : "division"
          }
        />
      )}
    </Layout>
  );
};

type AddUpdateModalProps = {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  onSubmit: (data: any) => void;
  initialValues: FormikValues;
  modalType: ModalType;
  inputLabel?: string;
  showMove?: boolean;
  moveOptions?: Array<Option>;
  moveOptionLabel?: string;
};

const AddUpdateModal = ({
  showModal,
  setShowModal,
  loading,
  onSubmit,
  initialValues,
  modalType,
  inputLabel,
  showMove,
  moveOptions,
  moveOptionLabel,
}: AddUpdateModalProps) => {
  return (
    <Modal
      show={showModal}
      onClose={() => {
        setShowModal(false);
      }}
      onConfirm={() => {
        if (modalType?.includes("delete")) {
          onSubmit(initialValues);
        }
      }}
      disableClosing={loading}
      withCloseHandler={modalType?.includes("delete")}
    >
      <div className="py-4 space-y-4">
        {modalType?.includes("delete") ? (
          <>
            <FaQuestionCircle className=" mx-auto w-20 h-20 text-primary" />
            <p className="font-normal text-xl text-center">
              Do you want to delete{" "}
              <span className="font-bold">{initialValues.name}</span>{" "}
              {inputLabel?.split(" ")[0]}?
            </p>
          </>
        ) : (
          <Formik
            initialValues={initialValues}
            validationSchema={yup.object({
              name: yup.string().required("Name is required"),
              move: yup.boolean().default(false),
              id: yup.number().when("move", {
                is: true,
                then: (s) =>
                  s
                    .required(`${moveOptionLabel} is required`)
                    .test(
                      `test-${moveOptionLabel}-model`,
                      `${moveOptionLabel} is required`,
                      (v) => Number(v) > 0,
                    ),
                otherwise: (s) => s,
              }),
            })}
            onSubmit={onSubmit}
          >
            {({ values, setFieldValue, errors, touched }) => (
              <Form>
                {!(modalType == "addDistrict" && showMove) && (
                  <TextInput
                    label={inputLabel ?? "Tehsil name"}
                    required
                    autoFocus
                    name="name"
                    value={values.name}
                  />
                )}

                {showMove ? (
                  <Fragment>
                    {!(modalType == "addDistrict" && showMove) && (
                      <div className="w-full flex items-center space-x-2 mb-1">
                        <input
                          id="move"
                          className="rounded"
                          type={"checkbox"}
                          defaultChecked={false}
                          name="move"
                          value={values.move}
                          checked={values.move}
                          onChange={(e) =>
                            setFieldValue("move", e.target.checked)
                          }
                        />
                        <label htmlFor="move">
                          Move to another {moveOptionLabel}
                        </label>
                      </div>
                    )}
                    {values.move && moveOptions && (
                      <Select
                        options={moveOptions}
                        label={"Select " + moveOptionLabel}
                        name="id"
                        required={values.move}
                        value={
                          moveOptions?.find((c) => c.value == values.id) ?? null
                        }
                        onChange={(e: any) => {
                          if (e?.value) {
                            setFieldValue("id", e.value);
                            if (modalType == "addDistrict" && showMove) {
                              const d_name =
                                moveOptions.find((t) => t.value == e.value)
                                  ?.label ?? "";
                              setFieldValue("name", d_name);
                            }
                          }
                        }}
                        touched={!!touched.id}
                        error={errors.id as string}
                      />
                    )}
                  </Fragment>
                ) : null}
                <Button
                  type="submit"
                  className="mx-auto"
                  loading={loading}
                  disabled={loading}
                >
                  {modalType == "editTehsil" ||
                  modalType == "editDistrict" ||
                  modalType == "editState"
                    ? "Update"
                    : "Save"}
                </Button>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </Modal>
  );
};

export default SetPincodePage;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "home", "heading"])),
    },
  };
};
