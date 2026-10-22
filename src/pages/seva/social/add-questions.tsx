import Button from "@/components/Button";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import apiClient from "@/http/index";
import { useAppSelector } from "@/redux/store";
import { getRegionValue } from "@/shared/functions/location";
import type { NextApplicationPage } from "@/shared/interfaces/app";
import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import type { SocialMediaQuestion } from "./update";
import { useStates } from "@/hooks/useLocationAPI";
import Select from "@/components/input/Select";

interface SocialMediaQuestionWithOptions extends SocialMediaQuestion {
  options: null | object[];
  state_id?: number;
  short_name: string;
  selected?: boolean;
}

const DynamicQuestionForm: React.FC = () => {
  const { t: tc } = useTranslation("common");
  const [loading, setLoading] = useState(false);
  const [selectedState, setSelectedState] = useState<number>(0);
  const { active_permission, active_region_index } = useAppSelector(
    (s) => s.auth
  );
  const roleRegion = active_permission?.role_region as string;

  const state_id =
    roleRegion === "state"
      ? getRegionValue(active_permission, active_region_index, "_id")?.state_id
      : undefined;
  const [existingQuestions, setExistingQuestions] = useState<
    SocialMediaQuestionWithOptions[]
  >([]);
  const [title, setTitle] = useState("");

  const updateSelected = (questionId: string) => {
    const updatedList = existingQuestions.map((q) =>
      questionId === q.id.toString()
        ? {
            ...q,
            state_id,
            selected: !q.selected,
            is_common: roleRegion === "ashram",
          }
        : q
    );
    setExistingQuestions(updatedList);
  };

  const { data: states } = useStates(2);

  const getExistingQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const { data: questionResponse } = await apiClient.get(
        `social_media_question_master`
      );
      if ((questionResponse?.data as []).length > 0) {
        setTitle(questionResponse?.data?.[0]?.topic);
      }
      setExistingQuestions(questionResponse?.data?.result ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async () => {
    if (!title) {
      toast.error("Topic is missing");
      return;
    }
    const question_ids = existingQuestions
      .filter(({ selected }) => selected)
      .map(({ id }) => id);

    if (question_ids.length === 0) {
      toast.error("Select atleast one question");
      return;
    }
    try {
      const payload = {
        topic: title,
        question_ids,
        ...(selectedState > 0 && { state_id: selectedState }),
      };
      await apiClient.post("social_media_question_sub", payload);
      toast.success("Question added successfully");
      setTitle("");
      setSelectedState(0);
      getExistingQuestions();
    } catch (error: unknown) {
      // @ts-ignore
      toast.error(error?.response?.data?.error);
      console.log(error);
    }
  };
  const handleStateChange = (stateId: number) => {
    setSelectedState(stateId);
  };

  useEffect(() => {
    getExistingQuestions();
  }, [getExistingQuestions]);
  return (
    <div>
      <div className="grid gap-2 my-4">
        {loading ? (
          <LoadingSpinner className="w-8 h-8 mx-auto mt-16" />
        ) : (
          <div>
            <div>
              <label htmlFor="topic">Seva Topic Name</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full mb-2 px-4 py-2 border text-gray-700 placeholder-gray-500 bg-white rounded-md  focus:border-gray-800  focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-gray-300 disabled:bg-gray-100 disabled:border-gray-100`}
              />
              {roleRegion === "ashram" && (
                <Select
                  label="State"
                  className="mb-6"
                  isSearchable
                  options={
                    states?.length
                      ? [{ value: 0, label: "All States" }, ...states]
                      : [{ value: 0, label: "All States" }]
                  }
                  placeholder="Select state"
                  value={
                    states?.find((c) => c.value === selectedState) ?? {
                      value: 0,
                      label: "All States",
                    }
                  }
                  onChange={(e: any) => handleStateChange(e.value)}
                />
              )}
            </div>
            {existingQuestions.map((question, idx) => (
              <div
                key={question.id}
                className="flex justify-between gap-4 items-start border-b border-gray-400 py-1 last:border-none"
              >
                <div className="flex itesm-start">
                  <span className="mr-2">#{idx + 1}</span>
                  <div className="flex flex-col gap-0">
                    <h3 className="text-md font-semibold">
                      {question.question}
                    </h3>
                    <span className="text-sm capitalize text-gray-500">
                      ({question.question_type})
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="checkbox"
                    id={question.id.toString()}
                    checked={question?.selected ?? false}
                    onChange={() => updateSelected(question.id.toString())}
                    className="mt-2 rounded-sm"
                  />
                </div>
              </div>
            ))}
            <Button
              onClick={handleSubmit}
              type="button"
              className="mx-auto mt-4"
            >
              {tc("submit")}
            </Button>
          </div>
        )}
      </div>
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
