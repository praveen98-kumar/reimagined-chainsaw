import React, { useRef, useState } from "react";
import { Formik, Form } from "formik";
import Layout from "@/components/Layout";
import { MdUpload } from "react-icons/md";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast from "react-hot-toast";
import apiClient from "@/http/index";
import * as Yup from "yup";
import FormErrorMessage from "@/components/input/FormErrorMessage";

const Upload = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [response, setResponse] = useState<Record<string, number | string>>({});
  const schema = Yup.object({
    file: Yup.mixed().required("Select file(.xlsx) to upload"),
  });

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: "Upload Postal Orders",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <Formik
          initialValues={{ file: null }}
          validationSchema={schema}
          onSubmit={async (values, { resetForm }) => {
            let formData = new FormData();
            // @ts-ignore
            formData.append("post_orders", values?.file);
            try {
              const { data } = await apiClient.post(
                "post_orders_upload",
                formData
              );
              toast.success(data.message);
              resetForm();
              setResponse(data.data);
              // @ts-ignore
              inputRef.current.value = "";
              formData.delete("post_orders");
              setShowSummary(true);
            } catch (e: any) {
              toast.error(e.response.data.error);
              console.error(e);
            }
          }}
        >
          {({ handleChange, values, errors, setFieldValue, isSubmitting }) => (
            <Form className="">
              <div className="flex items-center border border-gray-400 rounded-lg">
                <input
                  type={"file"}
                  name="file"
                  accept=".xlsx"
                  id="file"
                  ref={inputRef}
                  className="flex-1 text-md text-gray-500 file:mr-4 file:p-1.5 rounded-tl-lg rounded-bl-lg file:bg-black file:text-white"
                  onChange={(e) => {
                    // @ts-ignore
                    setFieldValue("file", e.currentTarget.files[0]);
                    setShowSummary(false);
                    setResponse({});
                  }}
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
                  <span>Upload</span>
                </button>
              </div>
              <div className="mt-2">
                {errors.file && (
                  <FormErrorMessage>{errors.file}</FormErrorMessage>
                )}
              </div>
            </Form>
          )}
        </Formik>
        {showSummary && (
          <>
            <h3 className="underline font-bold text-xl my-2 text-black">
              File Upload Summary
            </h3>
            <div className="space-y-2">
              <p>{response.total} : Total messages.</p>
              <p>{response.updated} : Messages updated.</p>
              <p>{response.invalid} : Missing PO ID/Tracking Ids.</p>
              <p>{response.not_found} : Messages not found. </p>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Upload;
