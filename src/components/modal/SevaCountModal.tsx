import Select from "@/components/input/Select";
import { Form, Formik } from "formik";
import React, { useRef } from "react";
import { FaQuestionCircle } from "react-icons/fa";
import * as Yup from "yup";
import Modal from "./Modal";
import { Option } from "@/shared/interfaces/option";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";

interface IValues {
  seva_count: number | string;
}

interface Props {
  show: boolean;
  onClose: () => void;
  onConfirm: (e?: any) => void;
  initialValues?: Partial<IValues>;
  name: string;
  title?: string;
  isLoading?: boolean;
  allotPending?: number;
}

const SevaCountModal: React.FC<Props> = ({
  show,
  onClose,
  onConfirm,
  name,
  initialValues,
  title,
  isLoading = false,
  allotPending = 0,
}) => {
  const router = useRouter();
  const { t: tc } = useTranslation("common");
  const { t: tq } = useTranslation("question");
  const formRef = useRef<any>(null);
  const handleSubmit = () => {
    if (formRef.current) {
      formRef.current.handleSubmit();
    }
  };
  let counts: Option[] = [
    {
      label: String(initialValues?.seva_count ?? 15),
      value: initialValues?.seva_count ?? 15,
    },
  ];
  if (initialValues?.seva_count && allotPending > 15) {
    counts.push(
      ...[
        { label: "30", value: 30 },
        { label: "45", value: 45 },
      ],
    );
  }
  const schema = Yup.object().shape({
    seva_count: Yup.number().required().min(0, "Please select Seva count"),
  });
  return (
    <Modal
      show={show}
      onClose={onClose}
      onConfirm={onConfirm}
      withCloseHandler={false}
      loading={isLoading}
    >
      <div className="space-y-8 mb-8">
        <FaQuestionCircle className=" mx-auto w-20 h-20 text-primary" />
        <p className="font-normal text-xl text-center">
          {title
            ? title
            : router.query.seva_type == "miss_call"
              ? initialValues?.seva_count == 0
                ? tq("not_allot_miss_calling", { name })
                : tq("allot_miss_calling", { name })
              : initialValues?.seva_count == 0
                ? tq("not_allot_book_calling", { name })
                : tq("allot_book_calling", { name })}
        </p>

        <Formik
          innerRef={formRef}
          validationSchema={schema}
          initialValues={
            initialValues || {
              seva_count: 30,
            }
          }
          onSubmit={async (values, { resetForm }) => {
            await onConfirm(values);
            resetForm();
          }}
        >
          {({ setFieldValue, values }) => (
            <Form>
              {initialValues?.seva_count != 0 && (
                <Select
                  name="seva_count"
                  options={counts}
                  isSearchable={false}
                  value={counts.find((c) => c.value == values.seva_count) ?? 0}
                  onChange={(e: any) => setFieldValue("seva_count", e.value)}
                  required
                />
              )}
            </Form>
          )}
        </Formik>
        <div className="flex items-center justify-center space-x-6 pb-6">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-green-600 w-1/2 text-white inline-block font-bold px-7 py-2 rounded-xl"
            onClick={handleSubmit}
          >
            {tc("confirm")}
          </button>
          <button
            className="bg-red-600 w-1/2 text-white font-bold px-7 inline-block py-2 rounded-xl"
            disabled={isLoading}
            onClick={onClose}
          >
            {tc("cancel")}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SevaCountModal;
