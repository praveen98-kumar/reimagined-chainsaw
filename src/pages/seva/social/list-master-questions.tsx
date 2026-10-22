import Button from "@/components/Button";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  SocialMediaDeleteQuestionModal,
  SocialMediaEditQuestionModal,
} from "@/components/modal/SocailSevaModal";
import apiClient from "@/http/index";
import { useAppSelector } from "@/redux/store";
import { getRegionValue } from "@/shared/functions/location";
import { isValidUser } from "@/shared/functions/utils";
import type { NextApplicationPage } from "@/shared/interfaces/app";
import type { GetStaticProps } from "next";
import Link from "next/link";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { IoMdTrash } from "react-icons/io";
import { MdEdit } from "react-icons/md";
import type { SocialMediaQuestion } from "./update";

interface SocialMediaQuestionWithOptions extends SocialMediaQuestion {
  options: null | object[];
  state_id?: number;
  short_name: string;
}

const DynamicQuestionForm: React.FC = () => {
  const { t: tc } = useTranslation("common");
  const { t: tq } = useTranslation("question");
  const [loading, setLoading] = useState(false);
  const { active_permission, active_region_index } = useAppSelector(
    (s) => s.auth
  );
  const roleRegion = active_permission?.role_region as string;
  // const roleRegion = active_permission[active_region_index]
  const [existingQuestions, setExistingQuestions] = useState<
    SocialMediaQuestionWithOptions[]
  >([]);
  const [selectedQuestion, setSelectedQuestion] =
    useState<SocialMediaQuestionWithOptions | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleCloseModal = () => {
    setSelectedQuestion(null);
    setShowDeleteModal(false);
    setShowEditModal(false);
  };

  const getExistingQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("social_media_question_master");
      const sortedQuestion = (
        data?.data?.result as SocialMediaQuestionWithOptions[]
      ).sort((p, q) =>
        p.is_common === q.is_common ? 0 : q.is_common ? 1 : -1
      );
      setExistingQuestions(sortedQuestion);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getExistingQuestions();
  }, [getExistingQuestions]);

  const handleUpdateQuestions = async (values: any) => {
    try {
      const question = values.questions[0] ?? null;
      if (question) {
        const {
          id,
          is_common,
          options,
          question: singleQ,
          question_type,
          short_name,
          icon,
        } = question;
        const { data } = await apiClient.put(
          `social_media_question_master/${id}`,
          {
            is_common,
            options,
            icon,
            question: singleQ,
            question_type,
            short_name,
          }
        );
        console.log(data);
        toast.success(data?.message);
        const updatedQuestions = existingQuestions.map((q) =>
          q.id === question?.id ? question : q
        );
        setExistingQuestions(updatedQuestions);
        handleCloseModal();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteQuestions = async (values: any) => {
    try {
      const question = selectedQuestion ?? null;
      if (question) {
        const { id } = question;
        const { data } = await apiClient.delete(
          `social_media_question_master/${id}`
        );
        console.log(data);
        toast.success(data?.message);
        const updatedQuestions = existingQuestions.filter(
          (q) => q.id !== question?.id
        );
        setExistingQuestions(updatedQuestions);
        handleCloseModal();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <Link href={"/seva/social/add-master-questions"}>
        <Button className="ml-auto">{tc("add_question")}</Button>
      </Link>
      <div className="grid gap-2 my-4">
        {loading ? (
          <LoadingSpinner className="w-8 h-8 mx-auto mt-16" />
        ) : (
          existingQuestions.map((question, idx) => (
            <div
              key={question.id}
              className="flex justify-between gap-4 items-start border-b border-gray-400 py-1 last:border-none"
            >
              <div className="flex itesm-start">
                <span className="mr-2">#{idx + 1}</span>
                <div className="flex flex-col gap-0">
                  <h3 className="text-md font-semibold">{question.question}</h3>
                  <span className="text-sm capitalize text-gray-500">
                    ({question.question_type})
                  </span>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                {isValidUser("update_social_media_question") && (
                  <button
                    type="button"
                    className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
                    onClick={() => {
                      setSelectedQuestion(question);
                      setShowEditModal(true);
                    }}
                  >
                    <MdEdit size={20} />
                  </button>
                )}
                {isValidUser("delete_social_media_question") && (
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700 transition-colors duration-200"
                    onClick={() => {
                      setSelectedQuestion(question);
                      setShowDeleteModal(true);
                    }}
                  >
                    <IoMdTrash size={20} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      {showEditModal && !!selectedQuestion && (
        <SocialMediaEditQuestionModal
          show={showEditModal}
          onClose={handleCloseModal}
          onConfirm={handleUpdateQuestions}
          question={{
            ...selectedQuestion,
            question_id: selectedQuestion.id,
            ...(roleRegion === "state" &&
              getRegionValue(active_permission, active_region_index, "_id")),
          }}
        />
      )}
      {showDeleteModal && !!selectedQuestion && (
        <SocialMediaDeleteQuestionModal
          title={
            tq("delete_question", { question: selectedQuestion.question }) ??
            "Are you sure to delete social media seva?"
          }
          show={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedQuestion(null);
          }}
          onConfirm={handleDeleteQuestions}
          question={selectedQuestion}
        />
      )}
    </div>
  );
};

const AddQuestionPage: NextApplicationPage = () => {
  const { t } = useTranslation("common");
  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: t("list_master_question") ?? "Master Question List",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <DynamicQuestionForm />
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
