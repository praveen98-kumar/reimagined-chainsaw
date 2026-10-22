import apiClient from "@/http/index";
import { bettterResponse, cn, downloadFile } from "@/shared/functions/utils";
import { Formik, Form } from "formik";
import React, { useRef } from "react";
import toast from "react-hot-toast";
import { MdUpload } from "react-icons/md";
import LoadingSpinner from "./LoadingSpinner";
import { useTranslation } from "react-i18next";
import Link from "next/link";

interface UploadCallingListFormProps {
  fileName: string;
  url: string;
  onUpload?: (data: any) => void;
}

export const UploadCallingListForm = ({
  fileName,
  url,
  onUpload,
}: UploadCallingListFormProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { t: tc } = useTranslation("common");

  return (
    <Formik
      initialValues={{ file: null }}
      onSubmit={async (values, { resetForm }) => {
        let formData = new FormData();
        // @ts-ignore
        formData.append(fileName, values?.file);
        try {
          const { data } = await apiClient.post(url, formData);
          toast.success(data.message);
          resetForm();
          let resp = bettterResponse(data.data);

          // @ts-ignore
          inputRef.current.value = "";
          formData.delete(fileName);
          onUpload?.(resp);
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
  );
};

export const TemplateDownloadLink = ({
  name,
  href,
}: {
  name: string;
  href: string;
}) => (
  <Link download={name} href={href}>
    <p className={"text-blue-500 underline text-left mt-3"}>
      Click To Download Template For Upload
    </p>
  </Link>
);

export const UploadSummary = ({
  seva_type,
  filename: fileName,
  children,
}: {
  seva_type: string;
  filename: string;
  children?: React.ReactNode;
}) => {
  const { t: tc } = useTranslation("common");
  const downloadPreviousFile = async () => {
    try {
      downloadFile({
        endPoint: "download_statistics",
        params: { seva_type },
        fileName,
      });
    } catch (e: any) {
      toast.error(e.response.data.error);
      console.error(e);
    }
  };
  return (
    <>
      <h3 className="underline font-bold text-xl my-2 text-black">
        File Upload Summary
      </h3>
      <div className="space-y-2">{children}</div>
      <button
        className={
          "px-3 py-1 bg-black text-white rounded shadow hover:cursor-pointer hover:bg-gray-800"
        }
        onClick={downloadPreviousFile}
      >
        {tc("download")}
      </button>
    </>
  );
};
