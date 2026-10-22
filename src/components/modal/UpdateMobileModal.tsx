import React, { useState, useRef } from "react";
import Modal from "./Modal";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import TextInput from "@/components/input/TextInput";
import apiClient from "@/http/index";
import toast from "react-hot-toast";
import { Call } from "@/shared/interfaces/calling";
import { useAppDispatch } from "@/redux/store";
import { updateCalls } from "@/redux/features/callingSlice";

interface Props {
  item: Call & { [k: string]: any };
  show: boolean;
  onClose: () => void;
  onConfirm: (data?: object) => void;
  title: string;
}
const schema = Yup.object({
  mobile_no: Yup.string()
    .length(10, "Invalid mobile number")
    .required("Mobile number is required"),
});

export const UpdateMobileModal: React.FC<Props> = ({
  item,
  show,
  onClose,
  onConfirm,
  title,
}) => {
  const [loading, setLoading] = useState(false);
  const { t: tc } = useTranslation("common");
  const dispatch = useAppDispatch();
  const { t: tq } = useTranslation("question");
  const formRef = useRef<any>(null);
  // API request to update mobile_no
  const handleSubmit = () => {
    if (formRef.current) {
      formRef.current.handleSubmit();
    }
  };

  async function updateMobileNo(values: any) {
    setLoading(true);
    try {
      await apiClient.post("update_alt_mobile_no", {
        ...values,
        order_id: item.order_id,
      });
      toast.success("Mobile no udated successfully.");
      dispatch(
        updateCalls({
          id: item.id,
          type: "bookPendingCalls",
          data: {
            new_mobile_no: values.mobile_no,
            mobile_no: item.mobile_no,
          },
        }),
      );
      onClose();
    } catch (error) {
      toast.error("cannot udate mobile number.");
    } finally {
      setLoading(false);
    }
  }

  const mobileNo = item.mobile_no.substring(item.mobile_no.length - 10);
  const newMobileNo = item.new_mobile_no
    ? item.new_mobile_no.substring(item.new_mobile_no.length - 10)
    : "";
  return (
    <Modal
      loading={loading}
      disableClosing={loading}
      show={show}
      onClose={onClose}
      onConfirm={onConfirm}
      withCloseHandler={false}
    >
      <div className="space-y-8 mb-8">
        <p className="font-normal text-xl text-center">
          {tq(title, { sr_no: item.order_id })}
        </p>
        <Formik
          innerRef={formRef}
          initialValues={{
            mobile_no: newMobileNo ? newMobileNo : mobileNo,
          }}
          validationSchema={schema}
          onSubmit={async (values, { resetForm }) => {
            updateMobileNo(values);
            resetForm();
          }}
        >
          {() => (
            <Form className="space-y-4">
              <TextInput
                name="mobile_no"
                defaultValue={mobileNo}
                required
                maxLength={10}
                className={"placeholder:text-gray-400"}
                label={tc("mobile_no") || "Mobile number"}
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
