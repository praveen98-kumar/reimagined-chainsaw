import { AxiosError } from "axios";
import type { FormikProps, FormikValues } from "formik";
import { Form, Formik } from "formik";
import type { GetStaticProps } from "next";
import Link from "next/link";
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
      (v) => v != null && v > 0,
    ),
  tehsil_id: Yup.number()
    .nullable()
    .required("Tehsil is required.")
    .test("test-tehsil-min", "Tehsil is required", (v) => v != null && v > 0),
  occupation_id: Yup.string().nullable().required("Occupation is required."),
  other_occupation: Yup.string().nullable(),
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

const cardClass =
  "rounded-[28px] border border-white bg-white/90 p-5 shadow-[0_20px_40px_-20px_rgba(76,29,149,0.35)]";

interface Occupation {
  value: number;
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
            value: occ.id,
            label: occ.name,
          };
        },
      );
      setOccupation(occupations1.concat([{ value: 0, label: "Other/ अन्य" }]));
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
          <Form className="space-y-3 w-full">
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
            <TextInput
              name="address"
              label="Address"
              placeholder="Enter address"
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
              name="occupation_id"
              placeholder={"Select Occupation"}
              value={occupations.find((s) => s.value === values.occupation)}
              onChange={(e: any) => {
                setFieldValue("occupation_id", e.value);
                setFieldValue(
                  "other_occupation",
                  e.value == 0 ? "Other/ अन्य" : "",
                );
              }}
            />
            <Button
              variant="gradient"
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

  // No elastic over-scroll on this page: pulling past the top would drag the
  // sticky header down and open a gap above it.
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.overscrollBehaviorY;
    root.style.overscrollBehaviorY = "none";
    return () => {
      root.style.overscrollBehaviorY = previous;
    };
  }, []);

  if (user) {
    return (
      <Layout headerProps={{ isBack: true, heading: "Register User" }}>
        <div className="fixed inset-0 -z-10 bg-app-gradient" />
        <div className="p-4 mx-auto w-full max-w-xl">
          <div className={cardClass}>
            <RegistrationForm requireConfirmation />
          </div>
        </div>
      </Layout>
    );
  }
  return (
    <div className="relative min-h-dvh">
      {/* Fixed so the gradient also fills the viewport while the page
          bounces past its top/bottom edge (otherwise the white body shows). */}
      <div aria-hidden className="fixed inset-0 -z-10 bg-app-gradient" />
      <div className="mx-auto w-full max-w-md px-4">
        {/* Sticky, so it stays on top while the form scrolls. The gradient is
            opaque (same as the login banner) so the form doesn't show
            through it; `before:` extends its top colour upwards so pulling
            the page down never reveals a gap above it. */}
        <div className="sticky top-0 z-20 -mx-4 mb-6 pt-8 pb-7 text-center rounded-b-[50%_48px] bg-[linear-gradient(160deg,#c1dafe_0%,#d3d7fe_30%,#dfd5fc_50%,#ead2f4_70%,#f4d0ed_90%,#f7cfeb_100%)] shadow-[0_12px_24px_-18px_rgba(76,29,149,0.45)] before:pointer-events-none before:absolute before:inset-x-0 before:bottom-full before:h-screen before:bg-linear-to-r before:from-[#c1dafe] before:to-[#d6d6fe] before:content-['']">
          <p className="font-serif text-3xl font-bold text-brand-title">
            Satlok Ashram
          </p>
          <h1 className="mt-1 text-xl font-semibold text-brand-ink">
            Register
          </h1>
        </div>
        <div className={cardClass}>
          <RegistrationForm />
        </div>
        <p className="mt-6 text-center font-semibold text-blue-900">
          Already registered?{" "}
          <Link href="/login" className="hover:underline">
            Login
          </Link>
        </p>
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
