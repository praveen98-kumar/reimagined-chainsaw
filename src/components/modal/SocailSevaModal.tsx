import Button from "@/components/Button";
import { useAppSelector } from "@/redux/store";
import { getRegionValue } from "@/shared/functions/location";
import type { Option } from "@/shared/interfaces/option";
import { socialImages } from "@/constants/images";
import {
  ErrorMessage,
  Field,
  FieldArray,
  Formik,
  type FormikProps,
} from "formik";
import type { SocialMediaQuestion } from "@/pages/seva/social/update";
import type React from "react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { FaQuestionCircle } from "react-icons/fa";
import { IoMdTrash } from "react-icons/io";
import * as Yup from "yup";
import Modal, { type ModalProps } from "./Modal";

const socialMediaIconOptions: Option[] = Object.entries(socialImages).map(
  ([k]) => ({
    label: k.charAt(0).toUpperCase() + k.slice(1),
    value: k,
  }),
);

export interface SocialMediaQuestionWithOptions extends SocialMediaQuestion {
  options: null | object[];
  // state_id?: number;
  short_name: string;
}

interface QuestionFormValues {
  questions: SocialMediaQuestion[];
}

const QuestionSchema = Yup.object().shape({
  questions: Yup.array().of(
    Yup.object().shape({
      question: Yup.string().required("Question is required"),
      question_type: Yup.string()
        .oneOf(["numeric", "checkbox", "dropdown", "Invalid question type"])
        .required("Question type is required"),
      // state_id: Yup.number().notRequired(),
      // is_common: Yup.boolean(),
      icon: Yup.string().min(1).required(),
      short_name: Yup.string().min(1).required(),
    }),
  ),
});

interface DynamicQuestionFormProps {
  initialValues?: SocialMediaQuestionWithOptions;
  onConfirm?: (data?: any) => void;
}

export const DynamicMasterQuestionForm: React.FC<DynamicQuestionFormProps> = (
  props,
) => {
  const { active_permission, active_region_index } = useAppSelector(
    (s) => s.auth,
  );
  const roleRegion = active_permission?.role_region as string;
  const formRef = useRef<FormikProps<QuestionFormValues>>(null);
  const createEmptyQuestion = (): SocialMediaQuestionWithOptions => ({
    question: "",
    question_type: "numeric",
    options: null,
    ...(roleRegion === "state" &&
      getRegionValue(active_permission, active_region_index, "_id")),
    // is_common: roleRegion === "ashram",
    icon: "facebook",
    short_name: "",
  });

  const initialValues: QuestionFormValues = {
    questions: [props.initialValues || createEmptyQuestion()],
  };

  const handleCreateQuestion = async (values: QuestionFormValues) => {
    try {
      QuestionSchema.validate(values).then(() => {
        props.onConfirm?.(values);
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Formik
      innerRef={formRef}
      initialValues={initialValues}
      onSubmit={handleCreateQuestion}
      // validationSchema={QuestionSchema}
    >
      {({ values, handleSubmit: formikSubmit }) => (
        <div className="space-y-6">
          <FieldArray name="questions">
            {({ push, remove }) => (
              <div className="space-y-4">
                {values.questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="border-2 border-gray-400 px-2 py-2 rounded-xl"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-semibold text-xl">
                        Question #{index + 1}
                      </h3>
                      {values.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-500 hover:text-red-700 transition-colors duration-200"
                        >
                          <IoMdTrash size={20} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-4 pl-4">
                      <div>
                        <label
                          htmlFor={`questions.${index}.question_type`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Question Type
                        </label>
                        <Field
                          as="select"
                          name={`questions.${index}.question_type`}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                        >
                          <option value="checkbox">Checkbox</option>
                          <option value="numeric">Numeric</option>
                        </Field>
                        <ErrorMessage
                          name={`questions.${index}.question_type`}
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`questions.${index}.icon`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Question Icon
                        </label>
                        <Field
                          as="select"
                          name={`questions.${index}.icon`}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                        >
                          {socialMediaIconOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage
                          name={`questions.${index}.icon`}
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`questions.${index}.question`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Question Title
                        </label>
                        <Field
                          name={`questions.${index}.question`}
                          type="text"
                          placeholder="Enter question"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                        />
                        <ErrorMessage
                          name={`questions.${index}.question`}
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`questions.${index}.short_name`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Question Short Name
                        </label>
                        <Field
                          name={`questions.${index}.short_name`}
                          type="text"
                          placeholder="Enter short name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                        />
                        <ErrorMessage
                          name={`questions.${index}.short_name`}
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {!props.initialValues && (
                  <div className="flex justify-end items-center">
                    <Button
                      type="button"
                      onClick={() => push(createEmptyQuestion())}
                    >
                      Add Queston
                    </Button>
                  </div>
                )}
              </div>
            )}
          </FieldArray>
          <div className="flex justify-end pt-4">
            <Button
              className="w-1/3"
              type="button"
              onClick={() => formikSubmit()}
            >
              {props.initialValues ? "Update" : "Submit"}
            </Button>
          </div>
        </div>
      )}
    </Formik>
  );
};

type Prettify<T> = { [K in keyof T]: T[K] } & {};

interface Props extends ModalProps {
  question: SocialMediaQuestionWithOptions;
  title?: string;
}

type T = Prettify<ModalProps>;

export const SocialMediaEditQuestionModal: React.FC<Props> = ({
  question,
  ...props
}) => {
  return (
    <Modal withCloseHandler={false} {...props}>
      <div className="space-y-8 mb-8">
        <DynamicMasterQuestionForm
          initialValues={question}
          onConfirm={props.onConfirm}
        />
      </div>
    </Modal>
  );
};

export const SocialMediaDeleteQuestionModal: React.FC<Props> = ({
  question,
  title,
  ...props
}) => {
  const { t: tq } = useTranslation("qestion");
  console.log(tq("delete_question", { question: question.question }));
  return (
    <Modal {...props}>
      <div className="space-y-8 mb-8">
        <FaQuestionCircle className=" mx-auto w-20 h-20 text-primary" />
        <p className="font-normal text-xl text-center">{title}</p>
      </div>
    </Modal>
  );
};
