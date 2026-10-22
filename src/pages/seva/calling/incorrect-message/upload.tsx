import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import toast from "react-hot-toast";
import apiClient from "@/http/index";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "react-i18next";
import {
  TemplateDownloadLink,
  UploadCallingListForm,
  UploadSummary,
} from "@/components/upload";

const Upload = () => {
  const { t } = useTranslation("calling");
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [response, setResponse] = useState<Record<string, number | string>>({});

  useEffect(() => {
    const getStatistics = async () => {
      try {
        const { data } = await apiClient.get(
          "upload_statistics?seva_type=incomplete_message"
        );
        setResponse(data.data);
        setShowSummary(true);
      } catch (e: any) {
        toast.error(e.response.data.error);
        console.error(e);
      }
    };
    getStatistics();
  }, []);

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: t("incomplete.upload") ?? "Upload Calling List",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <UploadCallingListForm
          url="incomplete_import"
          fileName="incomplete_file"
          onUpload={(data) => {
            setResponse(data);
            setShowSummary(true);
          }}
        />
        <TemplateDownloadLink
          name={"Incomplete Message List Template"}
          href={"/sample_files/incomplete_order_template.xlsx"}
        />
        {showSummary && (
          <UploadSummary
            seva_type="incomplete_message"
            filename="incomplete_message.xlsx"
          >
            <>
              <p>{response.total} : Total messages.</p>
              <p>{response.saved} : Messages Uploaded.</p>
            </>
          </UploadSummary>
        )}
      </div>
    </Layout>
  );
};

Upload.requireAuth = true;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "calling"])),
    },
  };
};

export default Upload;
