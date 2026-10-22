import React, { useRef, useState } from "react";
import Link from "next/link";
import { Formik, Form } from "formik";
import Layout from "@/components/Layout";
import { MdUpload } from "react-icons/md";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast from "react-hot-toast";
import apiClient from "@/http/index";
import { uploadFilePageParams } from "@/constants/app";
import { useRouter } from "next/router";
import { bettterResponse } from "@/shared/functions/utils";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "react-i18next";

const UploadByUrl = () => {
  const router = useRouter();
  const { t: tc } = useTranslation("common");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [response, setResponse] = useState<Record<string, number | string>>({});

  if (!router.query.url) {
    return null;
  }
  const { heading, url, file_name, sample } =
    uploadFilePageParams[router.query.url as string];
  return (
    <Layout headerProps={{ isBack: true, heading }}>
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <Formik
          initialValues={{ file: null }}
          onSubmit={async (values, { resetForm }) => {
            let formData = new FormData();
            // @ts-ignore
            formData.append(file_name, values?.file);
            try {
              const { data } = await apiClient.post(url, formData);
              toast.success(data.message);
              resetForm();
              let resp = bettterResponse(data.data);
              setResponse(resp);
              // @ts-ignore
              inputRef.current.value = "";
              formData.delete(file_name);
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
        {sample && (
          <Link href={sample}>
            <p className={"text-blue-500 underline text-left mt-3"}>
              Click To Download Template For Upload
            </p>
          </Link>
        )}
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
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};

export default UploadByUrl;
