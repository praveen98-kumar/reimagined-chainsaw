import React, { useRef } from "react";
import { FaQuestionCircle } from "react-icons/fa";
import Modal from "./Modal";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Option } from "@/shared/interfaces/option";
import { useTranslation } from "react-i18next";
import Radio from "@/components/input/Radio";
import TextInput from "@/components/input/TextInput";

interface Props {
  show: boolean;
  onClose: () => void;
  onConfirm: (data?: object) => void;
  title: string;
  required?: boolean;
}

const ReviewModal: React.FC<Props> = ({
  show,
  onClose,
  onConfirm,
  title,
  required = true,
}) => {
  const { t: tc } = useTranslation("common");
  const schema = Yup.object({
    remarks: required
      ? Yup.string().required("Remark is required")
      : Yup.string().notRequired(),
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
            remarks: "",
          }}
          validationSchema={schema}
          onSubmit={async (values, { resetForm }) => {
            onConfirm(values);
            resetForm();
            onClose();
          }}
        >
          {() => (
            <Form>
              <TextInput name="remarks" label="Remark" required={required} />
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

export default ReviewModal;
