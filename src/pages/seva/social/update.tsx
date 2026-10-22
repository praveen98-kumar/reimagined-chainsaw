import Layout from "@/components/Layout";
import { NextApplicationPage } from "@/shared/interfaces/app";
import Image from "next/image";
import { useFormik } from "formik";
import Button from "@/components/Button";
import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import apiClient from "@/http/index";
import toast from "react-hot-toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { socialImages } from "@/constants/images";
import { cn } from "@/shared/functions/utils";

export interface SocialMediaQuestion {
  question_type: "checkbox" | "numeric" | "dropdown";
  question: string;
  id: number;
  is_common: boolean;
  icon?: string;
  topic?: string;
}

export interface SocialMediaQuestionWithAnswer extends SocialMediaQuestion {
  answer?: string | number | boolean;
  seva_type?: string;
}

const UpdateSocial: NextApplicationPage = () => {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [questions, setQuestions] = useState<SocialMediaQuestionWithAnswer[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [buttonTitle, setButtonTitle] = useState("Submit");
  const [loadedQuestion, setLoadedQuestion] = useState<
    Record<string, number | boolean | string>
  >({});

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const id = parseInt(name);

    setQuestions((pre) =>
      pre.map((q) => {
        if (q.id !== id) return q;

        // Enforce single-digit numeric input
        if (q.question_type === "numeric") {
          const sanitized = value.replace(/\D/g, "").slice(0, 3);
          return {
            ...q,
            answer: sanitized === "" ? "" : Number(sanitized),
          };
        }

        return {
          ...q,
          answer: type === "checkbox" ? checked : value,
        };
      }),
    );
  };

  const handleLoadedQuestion = (items: Array<any>) => {
    const udpateLoadedQuestion = items.reduce(
      (a: Record<string, string | number | boolean>, p: any) => ({
        ...a,
        [p.id]: p.answer,
      }),
      {},
    );
    setLoadedQuestion(udpateLoadedQuestion);
  };

  const getInitialValues = useCallback(async () => {
    setIsLoaded(false);
    try {
      const { data } = await apiClient.get("social_media_seva");
      const tempQuestions = (data?.data?.questions || [])
        .sort((a: any, b: any) => a.priority - b.priority)
        .map((q: SocialMediaQuestion) => {
          const mappedAnswer = data?.data?.answers?.find(
            (a: any) => a.question_id === q.id,
          );
          return {
            ...q,
            answer:
              q.question_type === "checkbox"
                ? mappedAnswer?.answer === 1
                : q.question_type === "numeric"
                  ? Number(mappedAnswer?.answer) || 0
                  : String(mappedAnswer?.answer) || "",
          };
        });
      const commonQuestion: SocialMediaQuestionWithAnswer[] = [];
      const stateQuestion: SocialMediaQuestionWithAnswer[] = [];
      tempQuestions.forEach((q: SocialMediaQuestionWithAnswer) => {
        if (q.is_common) {
          commonQuestion.push(q);
        } else {
          stateQuestion.push(q);
        }
      });
      setQuestions((prev) => [...prev, ...stateQuestion, ...commonQuestion]);
      if (tempQuestions?.length > 0) {
        handleLoadedQuestion(tempQuestions);
      }
      if (
        Array.isArray(data?.data?.answers) &&
        data?.data?.answers.length > 0
      ) {
        setButtonTitle("Update");
      } else {
        setButtonTitle("Submit");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error);
      setButtonTitle("Submit");
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const onInputSubmit = (e: FormEvent, index: number) => {
    e.preventDefault();
    const nextField = questions[index + 1];
    if (nextField) {
      const nextInput = inputRefs.current[nextField.id.toString()];
      nextInput?.focus();
    }
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      const prevField = questions[index - 1];
      if (prevField) {
        const prevInput = inputRefs.current[prevField.id.toString()];
        prevInput?.focus();
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const nextField = questions[index + 1];
      if (nextField) {
        const nextInput = inputRefs.current[nextField.id.toString()];
        nextInput?.focus();
      }
    }
  };

  const onSubmit = async (values: any) => {
    const error = questions.find((q) => {
      return q.question_type === "numeric" && isNaN(Number(q.answer));
    });
    if (error) {
      toast.error(`Please enter a valid number for "${error.question}"`);
      return;
    }
    setLoading(true);
    try {
      const userAnswers = questions.map((q) => ({
        question_id: Number(q.id),
        answer:
          q.question_type === "checkbox"
            ? q.answer === true
              ? "1"
              : "0"
            : q.answer
              ? String(q.answer)
              : "0",
      }));
      const { data } = await apiClient.post("queue_enqueue_seva_answers", {
        answers: userAnswers,
      });
      console.log(data);
      toast.success(data.message);
      setButtonTitle("Update");
      handleLoadedQuestion(questions);
    } catch (error: any) {
      toast.error(error?.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  const { handleSubmit } = useFormik({
    initialValues: {},
    onSubmit: onSubmit,
  });

  useEffect(() => {
    getInitialValues();
  }, [getInitialValues]);

  return (
    <Layout headerProps={{ isBack: true, heading: "SM Seva Update" }}>
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        {loading ? (
          <div className="grid place-items-center py-4">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {isLoaded ? (
              <form onSubmit={handleSubmit}>
                {questions.map(
                  (
                    { question_type, icon, id, topic, answer: value },
                    index,
                  ) => {
                    const isNumberInput = question_type === "numeric";
                    const isCheckbox = question_type === "checkbox";
                    return (
                      <div
                        key={id}
                        className="flex w-full py-1.5 items-center justify-between border-b border-gray-300"
                      >
                        <div className="flex gap-1 items-center flex-1">
                          <Image
                            height={28}
                            width={28}
                            style={{ width: "32px", height: "auto" }}
                            src={socialImages[icon || "common"]}
                            alt={`facebook_satsang_seva_alt_image`}
                            className="cursor-pointer max-h-8 w-auto h-auto"
                            priority
                          />
                          <div>
                            <p className="text-lg font-bold">{topic}</p>
                          </div>
                        </div>
                        <input
                          className={cn({
                            "rounded mr-6 h-6 w-6": isCheckbox,
                            "border border-gray-300 h-8 w-20 rounded text-center text-md p-0 m-0":
                              isNumberInput,
                            "border-2 bg-green-100 border-green-600 text-green-600":
                              loadedQuestion[id] != value,
                          })}
                          ref={(el) => {
                            inputRefs.current[id.toString()] = el;
                          }}
                          checked={isCheckbox ? Boolean(value) : undefined}
                          // @ts-ignore
                          value={value}
                          inputMode={isNumberInput ? "numeric" : "text"}
                          name={id.toString()}
                          id={id.toString()}
                          onKeyDown={(e) => onKeyDown(e, index)}
                          onSubmit={(e) => onInputSubmit(e, index)}
                          type={
                            isCheckbox
                              ? "checkbox"
                              : isNumberInput
                                ? "number"
                                : "text"
                          }
                          onChange={onInputChange}
                        />
                      </div>
                    );
                  },
                )}
                {questions.length > 0 && (
                  <Button
                    loading={loading}
                    disabled={loading}
                    className="mt-8 mx-auto w-1/2"
                    type="submit"
                  >
                    {buttonTitle}
                  </Button>
                )}
              </form>
            ) : (
              <div className="w-full h-40 flex justify-center items-center">
                <LoadingSpinner />
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UpdateSocial;
