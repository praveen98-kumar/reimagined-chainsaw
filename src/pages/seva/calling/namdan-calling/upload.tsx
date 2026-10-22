import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import apiClient from "@/http/index";
import { downloadFile } from "@/shared/functions/utils";
import { Form, Formik } from "formik";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { MdUpload } from "react-icons/md";

const Upload = () => {
  const { t } = useTranslation("calling");
  const { t: tc } = useTranslation("common");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [response, setResponse] = useState<Record<string, number | string>>({});

  const downloadPreviousFile = async () => {
    try {
      downloadFile({
        endPoint: "download_statistics",
        params: { seva_type: "namdan_calling" },
        fileName: "namdan_calling.xlsx",
      });
    } catch (e: any) {
      toast.error(e.response.data.error);
      console.error(e);
    }
  };

  // useEffect(() => {
  //   const getStatistics = async () => {
  //     try {
  //       const { data } = await apiClient.get(
  //         "upload_statistics?seva_type=namdan_calling"
  //       );
  //       setResponse(data.data);
  //       setShowSummary(true);
  //     } catch (e: any) {
  //       console.error(e);
  //     }
  //   };
  //   getStatistics();
  // }, []);

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: t("namdan.upload") ?? "Upload Calling List",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <Formik
          initialValues={{ file: null }}
          onSubmit={async (values, { resetForm }) => {
            let formData = new FormData();
            // @ts-ignore
            formData.append("namdan_calling_file", values?.file);
            formData.append("book_calling", "1");
            try {
              const { data } = await apiClient.post(
                "namdan_calling_import",
                formData
              );
              toast.success(data.message);
              resetForm();
              setResponse(data.data);
              // @ts-ignore
              inputRef.current.value = "";
              formData.delete("namdan_calling_file");
              setShowSummary(true);
            } catch (e: any) {
              toast.error(e.response.data.error);
              console.error(e);
            }
          }}
        >
          {({ setFieldValue, isSubmitting }) => (
            <Form className="flex items-center border border-gray-400 rounded-lg">
              <input
                type={"file"}
                name="file"
                accept=".xlsx"
                id="file"
                ref={inputRef}
                className="flex-1 text-md text-gray-500 file:mr-4 file:p-1.5 rounded-tl-lg border-none rounded-bl-lg file:bg-black file:text-white"
                onChange={(e) =>
                  // @ts-ignore
                  setFieldValue("file", e.currentTarget.files[0])
                }
              />
              <button
                disabled={isSubmitting}
                type="submit"
                className="flex items-center space-x-2 bg-black font-semibold text-white p-2 rounded-tr-lg rounded-br-lg"
              >
                {isSubmitting ? (
                  <LoadingSpinner
                    className={"fill-white text-white"}
                    style={{ width: "25px", height: "25px" }}
                  />
                ) : (
                  <MdUpload className="text-white text-2xl" />
                )}
                <span>{tc("upload")}</span>
              </button>
            </Form>
          )}
        </Formik>
        <a
          href={"/sample_files/book_calling_template.xlsx"}
          download={"Book Calling Templates"}
        >
          <p className={"text-blue-500 underline text-left mt-3"}>
            Click To Download Template For Upload
          </p>
        </a>
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
            </div>
          </>
        )}
        <button
          className={
            "px-3 py-1 bg-black text-white rounded shadow hover:cursor-pointer hover:bg-gray-800"
          }
          onClick={downloadPreviousFile}
        >
          {tc("download")}
        </button>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "calling"])),
    },
  };
};

export default Upload;
