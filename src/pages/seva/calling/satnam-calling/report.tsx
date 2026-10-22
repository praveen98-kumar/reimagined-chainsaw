import Button from "@/components/Button";
import DateFilter from "@/components/DateFilter";
import Radio from "@/components/input/Radio";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { OnFieldChange } from "@/components/UserwiseDropdown";
import { NextApplicationPage } from "@/shared/interfaces/app";
import { Form, Formik, FormikProps, FormikValues } from "formik";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, { useRef, useState } from "react";
import { Option } from "@/shared/interfaces/option";
import { useTranslation } from "react-i18next";

const SatnamCallingReportPage: NextApplicationPage = () => {
  const formRef = useRef<FormikProps<FormikValues>>(null);
  const [loading, setLoading] = useState(false);
  const { t: tc } = useTranslation("common");

  const dayFilterOptions: Array<Option> = [
    { label: tc("today"), value: "today" },
    { label: tc("yesterday"), value: "yesterday" },
    { label: tc("this_week"), value: "this_week" },
    { label: tc("this_month"), value: "this_month" },
  ];

  const onSearch = (values: any) => {
    try {
      setLoading(true);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: "Satnam Calling Reports",
      }}
    >
      <div className="p-4 pt-0 w-full max-w-xl mx-auto space-y-4">
        {/* Filter */}

        <Formik
          innerRef={formRef}
          initialValues={{
            start: undefined,
            end: undefined,
          }}
          onSubmit={onSearch}
        >
          {({ values, setFieldValue, handleChange, errors, touched }) => {
            const handleCalendar = () => {
              setFieldValue("dayFilter", "");
            };
            const handleRadio = (e: React.ChangeEvent<any>) => {
              handleChange(e);
              setFieldValue("dayFilter", e.target.value);
              setFieldValue("start", undefined);
              setFieldValue("end", undefined);
            };
            return (
              <Form>
                <DateFilter />
                <OnFieldChange fields={["end"]} onChange={handleCalendar} />
                <OnFieldChange fields={["start"]} onChange={handleCalendar} />
                <Radio
                  options={dayFilterOptions}
                  name="dayFilter"
                  label=""
                  onChange={handleRadio}
                  inputClassName="rounded text-green-600 checked:bg-green-600 focus:ring-green-400 focus:border-green-400"
                />
              </Form>
            );
          }}
        </Formik>

        {/* Action Button */}
        <div className="w-full flex items-center gap-4">
          <Button
            onSubmit={() => formRef.current?.submitForm()}
            loading={loading}
            disabled={loading}
            type="submit"
            className="mx-auto mt-4 w-1/2"
          >
            {tc("search")}
          </Button>
          <Button type="submit" className="mx-auto mt-4 w-1/2">
            {tc("download")}
          </Button>
        </div>

        {/* Report Table */}

        <div className="w-full max-h-screen overflow-x-scroll">
          <table className="w-full">
            <thead
              style={{ zIndex: 1 }}
              className="w-full sticky top-0 bg-black text-white"
            >
              <tr className="w-full"></tr>
            </thead>
            <tbody className="w-full">
              <tr className="text-center p-5">
                <LoadingSpinner className="h-8 w-8 mx-auto" />
              </tr>
              <tr className="border-b border-blue-300 odd:bg-blue-100 even:bg-gray-100/50 p-1"></tr>
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

SatnamCallingReportPage.requireAuth = true;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};

export default SatnamCallingReportPage;
