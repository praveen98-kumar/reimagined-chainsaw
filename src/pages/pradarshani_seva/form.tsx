import Button from "@/components/Button";
import Layout from "@/components/Layout";
import { SmileyRating } from "@/components/SmileyRating";
import Select from "@/components/input/Select";
import TextArea from "@/components/input/TextArea";
import TextInput from "@/components/input/TextInput";
import { OnFieldChange } from "@/components/UserwiseDropdown";
import { submitFeedback } from "@/http/pradarshani";
import { useCountries, useDistricts, useStates } from "@/hooks/useLocationAPI";
import { objectWithValues } from "@/shared/functions/utils";
import { NextApplicationPage } from "@/shared/interfaces/app";
import { FeedbackFormValues } from "@/shared/interfaces/pradarshani";
import { Form, Formik, useFormikContext } from "formik";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { useAppSelector } from "@/redux/store";

const personTypeOptions = [
  { label: "Bhagat", value: 1 },
  { label: "Jagat", value: 0 },
];

const schema = Yup.object({
  name: Yup.string().required("Name is required"),
  country_id: Yup.number().nullable().required("Country is required"),
  state_id: Yup.number().nullable().required("State is required"),
  district_id: Yup.number().nullable().required("District is required"),
  locality: Yup.string().optional(),
  mobile_no: Yup.string().required("Mobile No is required"),
  whatsapp_no: Yup.string().optional(),
  rating: Yup.number().min(1, "Rating is required").required(),
  remark: Yup.string().required("Remark is required"),
  is_bhagat: Yup.number(),
});

const initialValues: FeedbackFormValues = {
  name: "",
  country_id: null,
  state_id: null,
  district_id: null,
  locality: "",
  mobile_no: "",
  whatsapp_no: "",
  rating: 0,
  remark: "",
  is_bhagat: null,
};

const LocationFields = ({ t }: { t: (key: string) => string }) => {
  const { values, errors, touched, setFieldValue } =
    useFormikContext<FeedbackFormValues>();
  const { data: countries } = useCountries();
  const { data: states } = useStates(values.country_id ?? undefined);
  const { data: districts } = useDistricts(values.state_id ?? undefined);

  return (
    <React.Fragment>
      <Select
        name="country_id"
        label={t("form.country")}
        required
        options={countries}
        value={countries?.find((c) => c.value === values.country_id) ?? null}
        onChange={(opt: any) => setFieldValue("country_id", opt?.value ?? null)}
        error={touched.country_id ? (errors.country_id as string) : ""}
        touched={touched.country_id}
      />
      <OnFieldChange
        fields={["country_id"]}
        onChange={() => {
          setFieldValue("state_id", null);
          setFieldValue("district_id", null);
        }}
      />
      <Select
        name="state_id"
        label={t("form.state")}
        required
        options={states}
        value={states?.find((s) => s.value === values.state_id) ?? null}
        onChange={(opt: any) => setFieldValue("state_id", opt?.value ?? null)}
        error={touched.state_id ? (errors.state_id as string) : ""}
        touched={touched.state_id}
      />
      <OnFieldChange
        fields={["state_id"]}
        onChange={() => setFieldValue("district_id", null)}
      />
      <Select
        name="district_id"
        label={t("form.district")}
        required
        options={districts}
        value={districts?.find((d) => d.value === values.district_id) ?? null}
        onChange={(opt: any) =>
          setFieldValue("district_id", opt?.value ?? null)
        }
        error={touched.district_id ? (errors.district_id as string) : ""}
        touched={touched.district_id}
      />
    </React.Fragment>
  );
};

const PradarshaniFeedbackFormPage: NextApplicationPage = () => {
  const { t } = useTranslation("pradarshani");
  const [isContactSame, setIsContactSame] = useState(false);
  const { active_permission, active_region_index } = useAppSelector(
    (s) => s.auth,
  );
  const activeRegion = active_permission?.region?.[active_region_index] ?? null;

  const ratingLabels = {
    1: t("form.rating_1"),
    2: t("form.rating_2"),
    3: t("form.rating_3"),
    4: t("form.rating_4"),
    5: t("form.rating_5"),
  };

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: t("list.submit"),
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <Formik
          initialValues={{
            ...initialValues,
            state_id: activeRegion?.state_id,
            country_id: activeRegion?.country_id,
          }}
          validationSchema={schema}
          onSubmit={async (
            values,
            { resetForm, setSubmitting, setFieldValue },
          ) => {
            try {
              let submitValues = objectWithValues({
                ...values,
                namdan_center_id: activeRegion?.namdan_center_id,
              }) as unknown as FeedbackFormValues;
              submitValues.mobile_no = `+91${submitValues.mobile_no}`;
              if (submitValues.whatsapp_no) {
                submitValues.whatsapp_no = `+91${submitValues.whatsapp_no}`;
              }
              await submitFeedback({
                ...submitValues,
                is_bhagat: values.is_bhagat,
              });
              toast.success(t("form.success"));
              setIsContactSame(false);
              resetForm();
              setFieldValue("is_bhagat", null);
            } catch (error: any) {
              toast.error(
                error?.response?.data?.error ?? "Something went wrong",
              );
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, errors, touched, isSubmitting, setFieldValue }) => {
            return (
              <Form>
                <TextInput name="name" label={t("form.name")} required />
                <LocationFields t={t} />
                <TextInput name="locality" label={t("form.locality")} />
                <TextInput
                  name="mobile_no"
                  label={t("form.mobile_no")}
                  required
                />

                <div className={"relative"}>
                  <label
                    id={"same_as"}
                    className={"absolute flex items-center gap-2 right-0"}
                  >
                    <input
                      type={"checkbox"}
                      checked={isContactSame}
                      name={"same_as"}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFieldValue("whatsapp_no", values?.mobile_no);
                          setIsContactSame(e.target.checked);
                        }
                      }}
                    />
                    <span>Same As Above</span>
                  </label>
                  <TextInput name="whatsapp_no" label={t("form.whatsapp_no")} />
                </div>
                <Select
                  options={personTypeOptions}
                  label="Bhagat/Jagat"
                  value={
                    personTypeOptions.find(
                      (p) => p.value === values.is_bhagat,
                    ) ?? null
                  }
                  required
                  onChange={(e: any) => setFieldValue("is_bhagat", e.value)}
                />
                <div className="w-full mb-2">
                  <span className="block text-center font-normal text-md mb-1">
                    {t("form.rating")}
                  </span>
                  <SmileyRating
                    rating={values.rating}
                    labels={ratingLabels}
                    onClick={(v) => setFieldValue("rating", v)}
                    errorText={
                      touched.rating && errors.rating
                        ? (errors.rating as string)
                        : undefined
                    }
                  />
                </div>
                <TextArea name="remark" label={t("form.remark")} required />
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  className="mx-auto mt-4"
                >
                  {t("form.submit")}
                </Button>
              </Form>
            );
          }}
        </Formik>
      </div>
    </Layout>
  );
};

export default PradarshaniFeedbackFormPage;

PradarshaniFeedbackFormPage.requireAuth = true;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "pradarshani"])),
    },
  };
};
