import { AxiosError } from "axios";
import type { FormikProps, FormikValues } from "formik";
import { Form, Formik } from "formik";
import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { MdClose } from "react-icons/md";
import * as Yup from "yup";

import Button from "@/components/Button";
import DiscipleCard from "@/components/card/DiscipleCard";
import Select from "@/components/input/Select";
import TextInput from "@/components/input/TextInput";
import Layout from "@/components/Layout";
import Modal from "@/components/modal/Modal";
import UserwiseDropdown from "@/components/UserwiseDropdown";
import apiClient from "@/http/index";
import { useAppSelector } from "@/redux/store";
import { isValidUser, objectWithValues } from "@/shared/functions/utils";
import type { NextApplicationPage } from "@/shared/interfaces/app";
import type { Option } from "@/shared/interfaces/option";
import type { Disciple } from "@/shared/interfaces/user";

const schema = Yup.object({
  name: Yup.string().required("Name is required"),
  age: Yup.number().nullable().required("Age is required."),
  mobile_no: Yup.string()
    .required("Mobile number is required.")
    .min(10, "Mobile Number must be 10 digit number")
    .max(10, "Mobile Number must be 10 digit number"),
  relation: Yup.string()
    .required("Relation with guardian is required.")
    .default("S/O"),
  guardian_name: Yup.string().required("Guardian Name is required"),
  address: Yup.string().required("Address is required"),
  country_id: Yup.number()
    .nullable()
    .required("Country is required.")
    .test("test-country-min", "Country is required", (v) => v != null && v > 0),
  state_id: Yup.number()
    .nullable()
    .required("State is required.")
    .test("test-state-min", "State is required", (v) => v != null && v > 0),
  district_id: Yup.number()
    .nullable()
    .required("District is required.")
    .test(
      "test-district-min",
      "District is required",
      (v) => v != null && v > 0
    ),
  tehsil_id: Yup.number()
    .nullable()
    .required("Tehsil is required.")
    .test("test-tehsil-min", "Tehsil is required", (v) => v != null && v > 0),
  occupation: Yup.string().nullable().required("Occupation is required."),
  mantra: Yup.string().required("Mantra is required."),
});

const relationOptions: Array<Option> = [
  { label: "S/O", value: "S/o" },
  { label: "D/O", value: "D/o" },
  { label: "W/O", value: "W/o" },
];
const mantrs: Array<Option> = [
  { label: "Pratham Nam", value: "pratham_nam" },
  { label: "Satnam", value: "satnam" },
  { label: "Sarnam", value: "sarnam" },
];

interface Occupation {
  value: string;
  label: string;
}

function RegistrationForm({
  requireConfirmation = false,
}: {
  requireConfirmation?: boolean;
}) {
  const { t } = useTranslation("common");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const formRef = useRef<FormikProps<FormikValues>>(null);
  const [occupations, setOccupation] = useState<Occupation[]>([]);
  const [existingDisciples, setExistingDisciples] = useState<Disciple[]>([]);
  const [discipleListMap, setDiscipleListMap] = useState<
    Map<string, Disciple[]>
  >(new Map());

  async function onSubmit(values: FormikValues) {
    setLoading(true);
    try {
      await apiClient.post("add_disciple_new", objectWithValues(values));
      toast.success("Mobile No. registered successfully");
      formRef?.current?.resetForm();
      formRef?.current?.setFieldValue("country_id", 2);
      setExistingDisciples([]);
    } catch (error: any) {
      toast.error(error?.response?.data?.error);
      console.error(error);
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  }

  async function getDuplicateDisciples() {
    if (
      !formRef.current?.values?.mobile_no ||
      formRef.current?.values?.mobile_no?.length !== 10
    ) {
      return;
    }
    const mapData = discipleListMap.get(formRef.current?.values?.mobile_no);
    if (mapData !== undefined) {
      setExistingDisciples(mapData);
      setShowModal(true);
      return;
    }

    try {
      const { data } = await apiClient.get("disciples", {
        params: {
          mobile_no: `+91${formRef.current?.values?.mobile_no}`,
        },
      });
      if (data?.data?.result && data?.data?.result?.length !== 0) {
        setDiscipleListMap((prev) => {
          const newMap = new Map(prev);
          newMap.set(formRef.current?.values?.mobile_no, data.data.result);
          return newMap;
        });
        setExistingDisciples(data.data.result);
        setShowModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const getOccupationList = useCallback(async () => {
    try {
      const response = await apiClient.get("misc_list?slug=occupation");
      const occupations1 = response.data.data.map(
        (occ: { id: number; name: string }) => {
          return {
            value: occ.name,
            label: occ.name,
          };
        }
      );
      setOccupation(
        occupations1.concat([{ value: "Other", label: "Other/ अन्य" }])
      );
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error?.response?.data?.error);
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getOccupationList();
  }, [getOccupationList]);

  return (
    <React.Fragment>
      <Formik
        innerRef={formRef}
        initialValues={{
          name: "",
          mobile_no: "",
          relation: "S/O",
          guardian_name: "",
          country_id: 2,
          state_id: 0,
          district_id: 0,
          tehsil_id: 0,
          address: "",
          age: "",
          occupation: "",
          mantra: "pratham_nam",
        }}
        validationSchema={schema}
        onSubmit={(v) => {
          onSubmit(v);
        }}
        validateOnChange={false}
        validateOnBlur={false}
      >
        {({ values, setFieldValue }) => (
          <Form className="space-y-3 w-full p-4 py-0">
            {/* Name */}
            <TextInput
              name="name"
              label={t("name") ?? "Name"}
              placeholder="Enter Name"
              required
            />

            {/* Relation */}
            <Select
              options={relationOptions}
              label="Relation"
              required
              name="relation"
              placeholder={"Select Relation"}
              value={relationOptions.find((s) => s.value === values.relation)}
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

            {/* Mobile Number */}
            <TextInput
              appendEle={
                <p
                  className="absolute bg-gray-200 rounded p-2 px-2 font-semibold text-gray-800 -translate-y-1/2 pointer-events-none top-1/2 left-0"
                  style={{
                    marginLeft: "1px",
                  }}
                >
                  +91
                </p>
              }
              className="pl-12"
              name="mobile_no"
              required
              label={t("mobile_no") ?? "Mobile Number"}
              maxLength={10}
              inputMode="numeric"
              placeholder="Enter your mobile number"
              prependEle={
                <div className="flex absolute space-x-1 items-center -translate-y-1/2 top-1/2 right-4">
                  {values.mobile_no.length > 0 && (
                    <MdClose
                      onClick={() => setFieldValue("mobile_no", "")}
                      className="w-5 h-5 text-gray-500 cursor-pointer"
                    />
                  )}
                </div>
              }
            />
            {isValidUser("add_disciple") && (
              <Button
                type="button"
                className="ml-auto"
                onClick={() => getDuplicateDisciples()}
                loading={loading}
                disabled={
                  formRef?.current?.values?.mobile_no?.length !== 10 || loading
                }
              >
                Check Duplicate
              </Button>
            )}

            <TextInput
              name="age"
              label="Age"
              placeholder="Enter Age"
              type={"number"}
              required
            />

            <UserwiseDropdown
              useHirarchy={false}
              conditionalFields={{
                country_id: false,
                division_id: false,
              }}
              required={true}
              onChange={{
                tehsil_id: (params) => {
                  setFieldValue("address", params ? params.label : "");
                },
              }}
            />
            <Select
              options={mantrs}
              label="Mantra"
              required
              name="mantra"
              placeholder={"Select Mantra"}
              value={mantrs.find((s) => s.value === values.relation)}
              onChange={(e: any) => {
                setFieldValue("mantra", e.value);
              }}
            />
            <Select
              options={occupations}
              label="Occupation"
              required
              name="occupation"
              placeholder={"Select Occupation"}
              value={occupations.find((s) => s.value === values.occupation)}
              onChange={(e: any) => {
                setFieldValue("occupation", e.value);
              }}
            />
            <Button
              variant="primary"
              type="submit"
              className="mx-auto w-full"
              disabled={loading}
              loading={loading}
            >
              Submit
            </Button>
          </Form>
        )}
      </Formik>
      <Modal
        loading={loading}
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => setShowModal(false)}
        withCloseHandler={false}
      >
        <div>
          <div className="mb-2">
            <p className="text-md -mb-2 font-bold">
              Total Sevadar: {existingDisciples.length}
            </p>
            <span className="text-sm text-muted-foreground">
              Sevadars with same mobile number
            </span>
          </div>

          <div className="space-y-2 mb-4 h-96 overflow-scroll ">
            {existingDisciples.map((disciple) => (
              <DiscipleCard key={disciple.id} disciple={disciple as any} />
            ))}
          </div>
        </div>
      </Modal>
    </React.Fragment>
  );
}

const RegisterPage: NextApplicationPage = () => {
  const { user } = useAppSelector((s) => s.auth);

  if (user) {
    return (
      <Layout headerProps={{ isBack: true, heading: "Register User" }}>
        <div className="py-4 mx-auto w-full max-w-xl space-y-4">
          <RegistrationForm requireConfirmation />
        </div>
      </Layout>
    );
  }
  return (
    <div className="w-full min-h-screen relative justify-center items-center">
      <div className="mx-auto mt-5 w-full h-full max-w-md flex flex-col items-center justify-center">
        <div className="w-full space-y-3">
          <div className="w-full">
            <h1 className="text-2xl font-semibold text-center">Register</h1>
            <RegistrationForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};

RegisterPage.requireAuth = false;

export default RegisterPage;
