import Layout from "@/components/Layout";
import apiClient from "@/http/index";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
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
          "upload_statistics?seva_type=missed_calling"
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
        heading: t("miss.upload") ?? "Upload Calling List",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <UploadCallingListForm
          url="miss_call_import"
          fileName="miss_call_file"
          onUpload={(data) => {
            setResponse(data);
            setShowSummary(true);
          }}
        />
        <TemplateDownloadLink
          name={"Miss Calling Template"}
          href={"/sample_files/miss_call_template.xlsx"}
        />
        {showSummary ? (
          <UploadSummary
            seva_type="missed_calling"
            filename="missed_calling.xlsx"
          >
            <p>{response.total} : Total messages.</p>
          </UploadSummary>
        ) : null}
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
