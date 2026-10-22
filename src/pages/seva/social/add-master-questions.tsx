import Layout from "@/components/Layout";
import { DynamicMasterQuestionForm } from "@/components/modal/SocailSevaModal";
import apiClient from "@/http/index";
import { NextApplicationPage } from "@/shared/interfaces/app";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const AddQuestionPage: NextApplicationPage = () => {
  const { t } = useTranslation("common");
  const handleAddMasterQuestion = async (values: any) => {
    try {
      console.log("handleCreateQuestion", values.questions);

      const { data } = await apiClient.post(
        "social_media_question_master",
        values.questions
      );
      toast.success(data?.data?.message || "Questions added successfully");
    } catch (error) {}
  };
  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: t("add_master_question") ?? "Add Master Questions",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <DynamicMasterQuestionForm onConfirm={handleAddMasterQuestion} />
      </div>
    </Layout>
  );
};

AddQuestionPage.requireAuth = true;
export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "question"])),
    },
  };
};
export default AddQuestionPage;
