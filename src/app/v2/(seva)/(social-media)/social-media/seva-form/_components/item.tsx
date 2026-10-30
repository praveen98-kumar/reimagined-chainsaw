"use client";
import { Button } from "@/components/v2/ui/button";
import { Input } from "@/components/v2/ui/input";
import { socialImages3d, socialMediaActionImages } from "@/constants/images";
import type { SocialMediaQuestionWithAnswer } from "@/pages/seva/social/update";
import { cn } from "@/shared/functions/utils";
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { FieldArray, Form, Formik, useField } from "formik";
import { CheckIcon } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

// export type SocialMediaGroupData = Record<
//   string,
//   Record<string, Record<string, SocialMediaQuestionWithAnswer[]>>
// >;
export type SocialMediaGroupData = Record<
  string,
  SocialMediaQuestionWithAnswer[]
>;

const groupSocialMediaQuestion = (data: SocialMediaQuestionWithAnswer[]) => {
  return data.reduce((acc: SocialMediaGroupData, curr) => {
    const sevaRegion = curr.is_common ? "Ashram Seva" : "State Seva";
    // acc[sevaRegion] ??= {};
    // acc[sevaRegion][curr.icon!] ??= {};
    // acc[sevaRegion][curr.icon!][curr.topic!] ??= [];
    // acc[sevaRegion][curr.icon!][curr.topic!].push(curr);
    acc[sevaRegion] ??= [];
    acc[sevaRegion].push(curr);
    return acc;
  }, {}) as SocialMediaGroupData;
};

const SevaLevelHeader = ({ sevaLevel }: { sevaLevel: string }) => (
  <div className="px-2 py-1 rounded-t-lg bg-linear-to-r from-yellow-400 to-orange-400">
    <h2 className="text-lg font-semibold">{sevaLevel}</h2>
  </div>
);

const SevaTypeField = ({
  sua,
  index,
  isSingleInput,
  loadedQuestion,
  values,
}: {
  sua: SocialMediaQuestionWithAnswer;
  index: number;
  isSingleInput: boolean;
  loadedQuestion: Record<string, any>;
  values: any;
}) => {
  const isNumberInput = sua.question_type === "numeric";
  const isCheckbox = sua.question_type === "checkbox";

  const [field] = useField({
    name: `questions.${index}.answer`,
  });

  return (
    <div
      className={cn("flex-1 p-1 flex flex-col items-center", {
        "flex flex-row items-center justify-between px-4": isSingleInput,
      })}
    >
      <div className="w-full flex flex-row items-center gap-1 mb-0.5">
        <Image
          height={20}
          width={20}
          style={{
            width: "20px",
            height: "auto",
          }}
          src={socialMediaActionImages[sua.seva_type ?? "post"]}
          alt={`${sua.topic}_${sua.seva_type}`}
          className="cursor-pointer max-h-8 w-auto h-auto"
        />
        <p className="capitalize text-xs text-slate-700 text-left">
          {sua.seva_type ?? "Post"}
        </p>
      </div>
      {isCheckbox ? (
        <CheckboxPrimitive.Root
          checked={Boolean(field.value)}
          onCheckedChange={(
            checked: boolean | string | string[] | undefined,
          ) => {
            field.onChange({
              target: {
                name: `questions.${index}.answer`,
                value: checked,
              },
            });
          }}
          className="flex size-5 items-center justify-center rounded-sm focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-800 data-checked:bg-gray-900 data-unchecked:border data-unchecked:border-gray-300"
        >
          <CheckboxPrimitive.Indicator className="flex text-gray-50 data-unchecked:hidden">
            <CheckIcon className="size-3" />
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
      ) : (
        <Input
          className={cn({
            "border-2 bg-green-100 border-green-600 text-green-600":
              loadedQuestion[sua.id] !== values.questions?.[index]?.answer,
            "w-20": isSingleInput,
          })}
          inputMode={isNumberInput ? "numeric" : "text"}
          type={isNumberInput ? "number" : "text"}
          {...field}
          value={field.value ?? ""}
        />
      )}
    </div>
  );
};

const PlatformBGMap: Record<string, string> = {
  facebook: "bg-blue-100 border-blue-300",
  instagram: "bg-pink-100 border-pink-300",
  twitter: "bg-fuchsia-100 border-fuchsia-300",
  youtube: "bg-red-100 border-red-300",
  whatsapp: "bg-green-100 border-green-300",
  telegram: "bg-sky-100 border-sky-300",
  linkedin: "bg-cyan-100 border-cyan-300",
  common: "bg-gray-100 border-gray-300",
  threads: "bg-zinc-100 border-zinc-300",
  tumblr: "bg-teal-100 border-teal-300",
  pinterest: "bg-red-100 border-red-300",
  dailyhunt: "bg-green-100 border-green-300",
  reddit: "bg-orange-100 border-orange-300",
  sharechat: "bg-purple-100 border-purple-300",
};

const TopicCard = ({
  title,
  sevaTypes,
  platformIcon,
  indexMap,
  loadedQuestion,
  values,
}: {
  title: string;
  sevaTypes: SocialMediaQuestionWithAnswer[];
  platformIcon: string;
  indexMap: Map<number, number>;
  loadedQuestion: Record<string, any>;
  values: any;
}) => (
  <div className="border bg-white rounded-sm">
    <div className="flex gap-4 items-center pb-0.5 mx-1">
      <div className="h-16 w-20 flex flex-col items-center justify-center">
        <Image
          height={28}
          width={28}
          style={{
            width: "32px",
            height: "auto",
          }}
          src={socialImages3d[platformIcon || "common"]}
          alt={`facebook_satsang_seva_alt_image`}
          className="cursor-pointer max-h-8 w-auto h-auto"
        />
        <p className="capitalize">{platformIcon}</p>
      </div>
      <div
        className={cn(
          "flex-1 h-14 line-clamp-2 border rounded-sm py-0.5 px-1",
          PlatformBGMap?.[platformIcon || "common"],
        )}
      >
        {title}
      </div>
    </div>
    <div className="flex gap-1 border-t items-center justify-around">
      {sevaTypes?.map((seva) => {
        const index = indexMap.get(seva.id)!;

        return (
          <SevaTypeField
            key={`${title}_${seva.seva_type}`}
            sua={seva}
            index={index}
            isSingleInput={sevaTypes.length === 1}
            loadedQuestion={loadedQuestion}
            values={values}
          />
        );
      })}
    </div>
  </div>
);

export const PlatformRenderer = ({
  platformData,
  platformIcon,
  indexMap,
  loadedQuestion,
  values,
}: {
  platformData: Record<string, SocialMediaQuestionWithAnswer[]>;
  platformIcon: string;
  indexMap: Map<number, number>;
  loadedQuestion: Record<string, any>;
  values: any;
}) => (
  <div className="space-y-2">
    {Object.entries(platformData).map(([title, sevaTypes]) => (
      <TopicCard
        key={title}
        title={title}
        sevaTypes={sevaTypes}
        platformIcon={platformIcon}
        indexMap={indexMap}
        loadedQuestion={loadedQuestion}
        values={values}
      />
    ))}
  </div>
);

const QuestionRenderer = ({
  question,
  loadedValue,
  index,
  values,
}: {
  question: SocialMediaQuestionWithAnswer;
  loadedValue: string | boolean | number | undefined;
  index: number;
  values: any;
}) => {
  const { icon, topic, question_type } = question;
  const isNumberInput = question_type === "numeric";
  const isCheckbox = question_type === "checkbox";

  const [field] = useField({
    name: `questions.${index}.answer`,
  });
  return (
    <div className="flex w-full py-1.5 gap-1 items-center justify-between not-last:border-b not-last:border-gray-300">
      <Image
        height={28}
        width={28}
        style={{ width: "32px", height: "auto" }}
        src={socialImages3d[icon || "common"]}
        alt={`facebook_satsang_seva_alt_image`}
        className="cursor-pointer max-h-8 w-auto h-auto"
        priority
      />
      <p className="text-lg font-medium flex-1 line-clamp-1">{topic}</p>

      {isCheckbox ? (
        <CheckboxPrimitive.Root
          checked={Boolean(field.value)}
          onCheckedChange={(
            checked: boolean | string | string[] | undefined,
          ) => {
            field.onChange({
              target: {
                name: `questions.${index}.answer`,
                value: checked,
              },
            });
          }}
          className="flex size-8 items-center justify-center rounded-sm focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-green-800 data-checked:bg-green-600 data-unchecked:border data-unchecked:border-gray-300"
        >
          <CheckboxPrimitive.Indicator className="flex text-gray-50 data-unchecked:hidden">
            <CheckIcon className="size-5 font-bold" strokeWidth={5} />
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
      ) : (
        <input
            className={cn(
              "border border-gray-300 size-8 rounded-lg text-center text-md p-0 m-0",
              {
            "border-2 bg-green-100 border-green-600 text-green-600":
              loadedValue !== values.questions?.[index!]?.answer,
          })}
          inputMode={isNumberInput ? "numeric" : "text"}
          type={isNumberInput ? "number" : "text"}
          placeholder={isNumberInput ? "0" : undefined}
          {...field}
          value={field.value ?? ""}
          onFocus={() => {
            if (field.value === 0) {
              field.onChange({
                target: {
                  name: `questions.${index}.answer`,
                  value: "",
                },
              });
            }
          }}
            onBlur={() => {
              if (field.value === "") {
                field.onChange({
                  target: {
                    name: `questions.${index}.answer`,
                    value: 0,
                  },
                });
              }
          }}
        />
      )}
    </div>
  );
};

const SevaLevelRenderer = ({
  sevaLevel,
  questions,
  indexMap,
  loadedQuestion,
  values,
}: {
  sevaLevel: string;
  // platforms: Record<string, Record<string, SocialMediaQuestionWithAnswer[]>>;
  questions: SocialMediaQuestionWithAnswer[];
  indexMap: Map<number, number>;
  loadedQuestion: Record<string, any>;
  values: any;
}) => (
  <div>
    <SevaLevelHeader sevaLevel={sevaLevel} />
    <div className="flex flex-col bg-white rounded-b-md px-3 py-2 space-y-2 -mt-1">
      {questions.map((question) => (
        <QuestionRenderer
          key={question.id}
          question={question}
          index={indexMap.get(question.id) ?? 0}
          loadedValue={loadedQuestion.get(question.id)}
          values={values}
        />
      ))}
    </div>
  </div>
);

const SocialMediaUpdateForm = ({
  questions = [],
  onSubmit,
  isLoading
}: {
  questions: SocialMediaQuestionWithAnswer[];
  onSubmit: (values: SocialMediaQuestionWithAnswer[]) => void;
  isLoading: boolean
}) => {
  const loadedQuestion = useMemo(() => {
    return new Map(questions.map((q) => [q.id, q.answer]));
  }, [questions]);
  const indexMap = useMemo(() => {
    const map = new Map<number, number>();
    questions?.forEach((q, i) => {
      map.set(q.id, i);
    });
    return map;
  }, [questions]);
  return (
    <Formik
      enableReinitialize
      initialValues={{ questions }}
      onSubmit={(v) => onSubmit(v.questions)}
    >
      {({ values }) => (
        <Form suppressHydrationWarning>
          <FieldArray name="questions">
            {() => {
              const grouped = groupSocialMediaQuestion(questions);
              return (
                <div className="flex flex-col gap-8">
                  {Object.entries(grouped).map(
                    ([sevaLevel, groupQuestions]) => (
                      <SevaLevelRenderer
                        key={sevaLevel}
                        sevaLevel={sevaLevel}
                        questions={groupQuestions}
                        indexMap={indexMap}
                        loadedQuestion={loadedQuestion}
                        values={values}
                      />
                    ),
                  )}
                </div>
              );
            }}
          </FieldArray>
          {questions.length > 0 && (
            <div className="w-full mt-4 flex items-center">
              <Button
                variant="submit"
                type="submit"
                disabled={isLoading}
                className="w-1/2 h-12 font-bold text-xl shadow-lg active:scale-95 transition-transform inline-flex mx-auto"
              >
                {isLoading ? "Submitting..." : "Submit"}
              </Button>
            </div>
          )}
        </Form>
      )}
    </Formik>
  );
};

export default SocialMediaUpdateForm;
