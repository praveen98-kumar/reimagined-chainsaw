import Button from "@/components/Button";
import TextInput from "@/components/input/TextInput";
import apiClient from "@/http/index";
import { Form, Formik, FormikValues } from "formik";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { MdClose, MdOutlinePhoneIphone, MdKey } from "react-icons/md";
import * as yup from "yup";
import Modal from "./Modal";
import toast from "react-hot-toast";
import { useAppSelector } from "@/redux/store";

const schema = yup.object({
  mobile_no: yup
    .string()
    .required("Mobile number is required")
    .length(10, "Invalid Number"),
  pin: yup.string().required("Pin is required").length(4, "Invalid Pin"),
});

const OtherLoginModal = ({
  onSuccess,
}: {
  onSuccess?: (data: any) => void;
}) => {
  const { t: tc } = useTranslation("common");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAppSelector((state) => state.auth);

  async function onSubmit(values: FormikValues) {
    try {
      setLoading(true);
      const { data } = await apiClient.post("other_login", {
        mobile_no: `+91${values.mobile_no}`,
        pin: values.pin,
      });
      localStorage.setItem("seva_by", JSON.stringify(user?.id));
      onSuccess && onSuccess(data.data);
      toast.success(`Logged in on behalf of ${data.data.name}`);
      setLoading(false);
      setShow(false);
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="w-full bg-black text-white rounded-lg h-16 px-1 justify-center flex items-center gap-3"
      >
        Other Login
      </button>
      <Modal
        show={show}
        onClose={() => setShow(false)}
        onConfirm={() => {}}
        withCloseHandler={false}
      >
        <div className="space-y-8 pb-8">
          <h3 className="font-semibold text-center text-2xl">
            Other Sevadar Login
          </h3>
          <Formik
            initialValues={{ mobile_no: "" }}
            onSubmit={onSubmit}
            validationSchema={schema}
          >
            {({ values, setFieldValue }) => (
              <Form>
                <TextInput
                  fieldClass="flex-1"
                  className="flex-1 py-2 m-0 pl-12"
                  placeholder="Type mobile number"
                  prependEle={
                    <div className="flex absolute space-x-1 items-center -translate-y-1/2 top-1/2 right-4">
                      {values.mobile_no.length > 0 && (
                        <MdClose
                          onClick={() => setFieldValue("mobile", "")}
                          className="w-5 h-5 text-gray-500 cursor-pointer"
                        />
                      )}
                      <MdOutlinePhoneIphone className="w-6 h-6 text-gray-500 pointer-events-none" />
                    </div>
                  }
                  name="mobile_no"
                  autoFocus
                  required
                  maxLength={10}
                  inputMode="numeric"
                  appendEle={
                    <p
                      className="absolute bg-gray-200 rounded p-2 px-2 font-semibold text-gray-800 -translate-y-1/2 pointer-events-none top-1/2 left-0"
                      style={{
                        marginLeft: "1px",
                      }}
                    >
                      +91
                    </p>
                  }
                />
                <TextInput
                  fieldClass="flex-1"
                  className="flex-1 py-2 m-0"
                  placeholder="Enter Pin"
                  prependEle={
                    <div className="flex absolute space-x-1 items-center -translate-y-1/2 top-1/2 right-4">
                      <MdKey className="w-6 h-6 text-gray-500 pointer-events-none" />
                    </div>
                  }
                  name="pin"
                  required
                  maxLength={4}
                  inputMode="numeric"
                />
                <Button
                  className="py-3 mb-8 mx-auto"
                  style={{ maxHeight: "42px" }}
                  type="submit"
                  loading={loading}
                  disabled={loading}
                >
                  {tc("Login")}
                </Button>
              </Form>
            )}
          </Formik>
        </div>
      </Modal>
    </>
  );
};

export default OtherLoginModal;
