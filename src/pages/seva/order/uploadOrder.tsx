import Layout from "@/components/Layout";
import useLocalstorage from "@/hooks/useLocalstorage";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { MdUpload } from "react-icons/md";
import { NextApplicationPage } from "@/shared/interfaces/app";
import { Form, Formik } from "formik";
import apiClient from "@/http/index";
import toast from "react-hot-toast";
import FormErrorMessage from "@/components/input/FormErrorMessage";
import * as Yup from "yup";
import LoadingSpinner from "@/components/LoadingSpinner";
import Link from "next/link";
import { bettterResponse, downloadFile } from "@/shared/functions/utils";
import ButtonTabs from "@/components/ButtonTabs";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "react-i18next";

const schema = Yup.object().shape({
  file: Yup.mixed().required("File is required"),
});

const Upload: NextApplicationPage = () => {
  const { t: tc } = useTranslation("common");
  const [, , removeState] = useLocalstorage("searchData");
  const router = useRouter();
  const [countryType, setCountryType] = useState<string>("");
  const [showRegular, setShowRegular] = useState<boolean>(true);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<any>(null);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [response, setResponse] = useState<Record<string, number | string>>({});
  useEffect(() => {
    if (router.query.countryType) {
      setCountryType(router.query.countryType as string);
    }
  }, [router.isReady]);
  const downloadPreviousFile = async () => {
    try {
      const seva_type = showRegular ? "sm_order" : "sm_emergency_order";
      downloadFile({
        endPoint: "download_statistics",
        params: { seva_type: seva_type },
        fileName: `${seva_type}.xlsx`,
      });
    } catch (e: any) {
      toast.error(e.response.data.error);
      console.error(e);
    }
  };
  const getStatistics = async () => {
    try {
      const seva_type = showRegular ? "sm_order" : "sm_emergency_order";
      const { data } = await apiClient.get(
        `upload_statistics?seva_type=${seva_type}`,
      );
      let resp = bettterResponse(data.data);
      setResponse(data.data);
      setShowSummary(true);
    } catch (e: any) {
      console.error(e);
    }
  };

  useEffect(() => {
    getStatistics();
    removeState();
  }, []);

  const handleClick = useCallback(() => {
    if (showRegular) {
      setShowRegular(false);
      getStatistics();
    } else {
      setShowRegular(true);
    }
    if (showSummary) {
      setShowSummary(false);
      setResponse({});
    }
    formRef?.current.setFieldValue("file", null);
    formRef?.current.setFieldTouched("file", false);
    if (inputRef.current) inputRef.current.value = "";
  }, [showRegular, showSummary]);

  return (
    <Layout
      headerProps={{ isBack: true, heading: `Upload SM Office Messages` }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <ButtonTabs
          handleClick={handleClick}
          items={[
            { active: showRegular, label: tc("regular") ?? "Regular" },
            { active: !showRegular, label: tc("emergency") ?? "Emergency" },
          ]}
        />
        <Formik
          innerRef={formRef}
          initialValues={{ file: null }}
          validationSchema={schema}
          onSubmit={async (
            values,
            { resetForm, setFieldValue, setFieldTouched },
          ) => {
            const formData = new FormData();
            if (values?.file) {
              formData.append("order_file", values?.file);
            }
            try {
              const { data } = await apiClient.post(
                "order_import_sm_office",
                formData,
                {
                  params: !showRegular ? { emergency: "1" } : {},
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                },
              );
              toast.success(data.message);
              resetForm();
              let resp = bettterResponse(data.data);
              setResponse(data.data);
              // @ts-ignore
              inputRef.current.value = "";
              resetForm();
              setFieldValue("file", null);
              setFieldTouched("file", false);
              formData.delete("order_file");
              setShowSummary(true);
            } catch (e: any) {
              toast.error(e.response.data.error);
              console.error(e);
            }
          }}
        >
          {({ setFieldValue, errors, isSubmitting }) => (
            <Form className="text-center space-y-4">
              <div className="flex items-center overflow-hidden mt-8">
                <input
                  type="file"
                  name="file"
                  accept=".xlsx"
                  ref={inputRef}
                  id="file"
                  className={
                    "flex-1 w-full text-md text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-md file:font-semibold file:bg-primary file:text-white hover:file:bg-primary border border-gray-300"
                  }
                  onChange={(e) =>
                    // @ts-ignore
                    setFieldValue("file", e.currentTarget.files[0])
                  }
                />
                <button
                  className="bg-primary"
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: "8.5px" }}
                >
                  {isSubmitting ? (
                    <LoadingSpinner
                      className={"fill-white text-white"}
                      style={{ width: "25px", height: "25px" }}
                    />
                  ) : (
                    <MdUpload className="text-white text-2xl" />
                  )}
                </button>
              </div>

              {errors.file && (
                <FormErrorMessage>{errors?.file}</FormErrorMessage>
              )}
            </Form>
          )}
        </Formik>
        <Link href={"/sample_files/sm_office_sample_order.xlsx"}>
          <p className={"text-blue-500 underline text-left mt-3"}>
            Click To Download Template For Upload
          </p>
        </Link>
        {showSummary && (
          <>
            <h3 className="underline font-bold text-xl my-2 text-black">
              File Upload Summary
            </h3>
            <div className="space-y-2">
              <p>{response.total} : Total messages.</p>
              <p>{response.saved} : Messages Uploaded.</p>
              <p>{response.duplicate} : Duplicate Messages. </p>
              <p>{response.pincode} : Messages without Pincode.</p>
              <p>{response.mobile_no} : Messages without Mobile No.</p>
              <p>{response.pincode_not_match} : Messages Pincode Not Match.</p>
            </div>
          </>
        )}
        <button
          className={
            "px-3 py-1 bg-black text-white rounded shadow hover:cursor-pointer hover:bg-gray-800"
          }
          onClick={downloadPreviousFile}
        >
          Download
        </button>
      </div>
    </Layout>
  );
};

Upload.requireAuth = true;
export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "order"])),
    },
  };
};
export default Upload;
