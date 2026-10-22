import React, { useRef } from "react";
import { FaQuestionCircle } from "react-icons/fa";
import Modal from "./Modal";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Option } from "@/shared/interfaces/option";
import { useTranslation } from "react-i18next";
import Radio from "@/components/input/Radio";

interface Props {
  show: boolean;
  onClose: () => void;
  onConfirm: (data?: object) => void;
  options: Option[];
  title: string;
}

const ReasonModal: React.FC<Props> = ({
  show,
  onClose,
  onConfirm,
  options,
  title,
}) => {
  const { t: tc } = useTranslation("common");
  const schema = Yup.object({
    reason: Yup.string().required("Reason is required"),
  });
  const formRef = useRef<any>(null);
  const handleSubmit = () => {
    if (formRef.current) {
      formRef.current.handleSubmit();
    }
  };

  return (
    <Modal
      show={show}
      onClose={onClose}
      onConfirm={onConfirm}
      withCloseHandler={false}
    >
      <div className="space-y-8 mb-8">
        <FaQuestionCircle className=" mx-auto w-20 h-20 text-primary" />
        <p className="font-normal text-xl text-center">{title}</p>
        <Formik
          innerRef={formRef}
          initialValues={{
            reason: "",
          }}
          validationSchema={schema}
          onSubmit={async (values, { resetForm }) => {
            onConfirm(values);
            resetForm();
          }}
        >
          {({ setFieldValue, handleChange }) => (
            <Form>
              <Radio
                name="reason"
                label={tc("select_reason")}
                options={options.filter((o) => o.value !== "")}
                required
                onChange={(e) => {
                  handleChange(e);
                  setFieldValue("reason", e.target.value);
                }}
              />
            </Form>
          )}
        </Formik>
        <div className="flex items-center justify-center space-x-6 pb-6">
          <button
            type="submit"
            className="bg-green-600 w-1/2 text-white inline-block font-bold px-7 py-2 rounded-xl"
            onClick={handleSubmit}
          >
            {tc("confirm")}
          </button>
          <button
            className="bg-red-600 w-1/2 text-white font-bold px-7 inline-block py-2 rounded-xl"
            onClick={onClose}
          >
            {tc("cancel")}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReasonModal;
