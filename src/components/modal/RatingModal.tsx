import React, { useRef } from "react";
import Modal from "./Modal";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import TextArea from "@/components/input/TextArea";
import { RatingComponent } from "@/components/RatingComponent";

interface Props {
  show: boolean;
  onClose: () => void;
  onConfirm: (data?: object) => void;
  title: string;
}
const schema = Yup.object({
  rating: Yup.number()
    .min(1, "Please rate your experience")
    .max(5)
    .required("Please rate your experience"),
  remark: Yup.string().required("Remark is required"),
});

export const RatingModal: React.FC<Props> = ({
  show,
  onClose,
  onConfirm,
  title,
}) => {
  const { t: tc } = useTranslation("common");
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
        <p className="font-normal text-xl text-center">{title}</p>
        <Formik
          innerRef={formRef}
          initialValues={{
            remark: "",
            rating: 0,
          }}
          validationSchema={schema}
          onSubmit={async (values, { resetForm }) => {
            onConfirm(values);
            resetForm();
          }}
        >
          {({ setFieldValue, errors, values }) => (
            <Form className="space-y-4">
              <RatingComponent
                rating={values.rating}
                onClick={(v) => setFieldValue("rating", v)}
                errorText={errors.rating}
              />
              <TextArea
                name="remark"
                required
                className={"placeholder:text-gray-400"}
                label={tc("remark") || "Remark"}
                rows={4}
                style={{ resize: "none" }}
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
