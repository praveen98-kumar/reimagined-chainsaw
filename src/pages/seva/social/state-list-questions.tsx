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
import { Formik, Form, FieldArray, FormikErrors } from "formik";
import type { NextApplicationPage } from "@/shared/interfaces/app";
import type { GetStaticProps } from "next";
import Link from "next/link";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import type { SocialMediaQuestion } from "./update";
import * as Yup from "yup";
import { cn } from "@/shared/functions/utils";

interface SelectedQuestion {
  id: number;
  priority: number | "";
}

interface SocialMediaQuestionWithOptions extends SocialMediaQuestion {
  options: null | object[];
  state_id?: number;
  short_name: string;
  selected?: boolean;
  added?: boolean;
  priority?: number;
}

interface Question {
  id: number;
  priority: number;
}

const DynamicQuestionForm: React.FC = () => {
  const { t: tc } = useTranslation("common");
  const { t: tq } = useTranslation("question");
  const [loading, setLoading] = useState(false);
  const [formInitialValues, setFormInitialValues] = useState<Question[]>([]);
  const { active_permission, active_region_index } = useAppSelector(
    (s) => s.auth
  );
  const roleRegion = active_permission?.role_region as string;
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
  const state_id =
    roleRegion === "state"
      ? getRegionValue(active_permission, active_region_index, "_id")?.state_id
      : undefined;

  const validationSchema = Yup.object().shape({
    question_list: Yup.array()
      .of(
        Yup.object().shape({
          id: Yup.number().required(),
          priority: Yup.number()
            .required("Priority is required")
            .positive("Priority must be positive")
            .integer("Priority must be a whole number")
            .test(
              "unique-priority",
              "Priorities must be unique",
              function (value, context) {
                const allQuestions = context.options.context?.question_list;
                const allPriorities = allQuestions
                  .map((q: SelectedQuestion) => q.priority)
                  .filter(
                    (p: SelectedQuestion["priority"]) =>
                      p !== "" && p !== undefined
                  );
                const duplicates = allPriorities.filter(
                  (p: number) => p === value
                );
                return duplicates.length <= 1;
              }
            )
            .test("valid-range", function (value) {
              const allQuestions = this.options.context?.question_list;
              const selectedCount = allQuestions.length;
              if (value && (value < 1 || value > selectedCount)) {
                return this.createError({
                  message: `Priority must be between 1 & ${selectedCount}`,
                });
              }
              return true;
            }),
        })
      )
      .min(1, "At least one question must be selected."),
  });

  const getExistingQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("social_media_question_sub", {
        params: {
          state_id,
          for_add: 1,
        },
      });
      const sortedQuestion = (
        data?.data as SocialMediaQuestionWithOptions[]
      ).sort((p, q) =>
        p.is_common === q.is_common ? 0 : q.is_common ? 1 : -1
      );
      const addedQuestion = sortedQuestion
        .filter((q) => q.added || q.priority)
        .map(
          (q) =>
            ({
              id: q.id,
              priority: q.priority ?? "",
            } as Question)
        );
      setFormInitialValues(addedQuestion);
      setExistingQuestions(sortedQuestion);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [state_id]);

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
            state_id,
          }
        );
        toast.success(data?.data?.message);
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

  const handleDeleteQuestion = async (values: any) => {
    try {
      const question = selectedQuestion ?? null;
      if (question) {
        const { id } = question;
        const { data } = await apiClient.delete(
          `social_media_question_sub?question_id=${id}`
        );
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
  const handleSubmitByState = async (question_list: Question[]) => {
    try {
      await apiClient.post("social_media_seva_add_state", { question_list });
      toast.success("Question added successfully");
    } catch (error: unknown) {
      // @ts-ignore
      toast.error(error?.response?.data?.error);
      console.log(error);
    }
  };

  useEffect(() => {
    getExistingQuestions();
  }, [getExistingQuestions]);
  return (
    <div>
      {roleRegion === "ashram" && (
        <Link href={"/seva/social/add-questions"}>
          <Button className="ml-auto">{tc("add_question")}</Button>
        </Link>
      )}
      <div className="grid gap-2 my-4">
        {loading ? (
          <LoadingSpinner className="w-8 h-8 mx-auto mt-16" />
        ) : (
          <Formik
            initialValues={{ question_list: formInitialValues }}
            validateOnChange
            validationSchema={validationSchema}
            onSubmit={(values) => handleSubmitByState(values.question_list)}
          >
            {({ values, errors, setFieldValue, handleSubmit }) => {
              return (
                <Form>
                  <FieldArray name="question_list">
                    {({ push, remove }) => (
                      <div>
                        {existingQuestions.map((question, questionIdx) => {
                          const selectedIndex = values.question_list.findIndex(
                            (sq) => sq.id === question.id
                          );
                          const isSelected = selectedIndex !== -1;
                          const hasError =
                            // @ts-ignore
                            errors.question_list?.[selectedIndex]?.priority ??
                            false;

                          return (
                            <div
                              key={question.id}
                              className="flex justify-between gap-4 items-start border-b border-gray-400 py-1 last:border-none"
                            >
                              <div className="flex itesm-start">
                                <span className="mr-2">#{questionIdx + 1}</span>
                                <div className="flex flex-col gap-0">
                                  <h3 className="text-md font-semibold">
                                    {question.topic}
                                  </h3>
                                  <span className="text-sm capitalize text-gray-500">
                                    ({question.question})
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2 items-center mt-1">
                                <input
                                  type="checkbox"
                                  id={`question-${question.id}`}
                                  checked={isSelected}
                                  className="rounded-sm"
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      push({ id: question.id, priority: "" });
                                    } else {
                                      remove(selectedIndex);
                                    }
                                  }}
                                />
                                <input
                                  type="number"
                                  id={`priority-${question.id}`}
                                  name={`question_list.${selectedIndex}.priority`}
                                  value={
                                    values.question_list[selectedIndex]
                                      ?.priority ?? ""
                                  }
                                  min={1}
                                  max={values.question_list.length}
                                  className={cn(
                                    "h-8 w-16 rounded outline-none border border-gray-400 px-1",
                                    {
                                      "border-red-400 ring-2 ring-red-200 focus:outline-red-400 focus:ring-red-400":
                                        hasError,
                                    }
                                  )}
                                  disabled={!isSelected}
                                  onChange={(e) => {
                                    const value =
                                      e.target.value === ""
                                        ? ""
                                        : parseInt(e.target.value);
                                    setFieldValue(
                                      `question_list.${selectedIndex}.priority`,
                                      value
                                    );
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}

                        <div>
                          {Array.isArray(errors.question_list) &&
                            errors.question_list.length > 0 && (
                              <div className="border border-red-500 bg-red-100 p-2 rounded text-red-500 my-4">
                                {/* @ts-ignore */}
                                {Array.from(errors.question_list)
                                  ?.filter((t: any) => t !== null)
                                  ?.filter(
                                    (val: any, index, self) =>
                                      index ===
                                      self.findIndex(
                                        (t: any) =>
                                          t?.priority === val?.priority
                                      )
                                  )
                                  .map((q: any, idx: number) => {
                                    return (
                                      <p key={idx.toString()}>{q?.priority}</p>
                                    );
                                  })}
                              </div>
                            )}

                          <Button
                            onClick={() => handleSubmit()}
                            type="button"
                            disabled={
                              values.question_list.length === 0 ||
                              (Array.isArray(errors.question_list) &&
                                errors.question_list?.length > 0)
                            }
                            className="mx-auto mt-4"
                          >
                            {tc("submit")}
                          </Button>
                        </div>
                      </div>
                    )}
                  </FieldArray>
                </Form>
              );
            }}
          </Formik>
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
          onConfirm={handleDeleteQuestion}
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
        heading: t("add_daily_question") ?? "Add Daily Question",
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
