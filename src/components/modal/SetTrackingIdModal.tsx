import React, { useEffect, useRef, useState } from "react";
import { FaQuestionCircle } from "react-icons/fa";
import Modal from "./Modal";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import TextInput from "@/components/input/TextInput";
import { BiBarcodeReader } from "react-icons/bi";
import Button from "@/components/Button";
import toast from "react-hot-toast";

interface Props {
  show: boolean;
  onClose: () => void;
  onConfirm: (data?: object) => void;
  message: string;
  title: string;
}

const TrackingIdModal: React.FC<Props> = ({
  show,
  onClose,
  onConfirm,
  message,
  title,
}) => {
  const schema = Yup.object({
    tracking_id: Yup.string().required("Tracking Id is required"),
  });
  const formRef = useRef<any>(null);
  const handleSubmit = () => {
    if (formRef.current) {
      formRef.current.handleSubmit();
    }
  };
  const [trackingId, setTrackingId] = React.useState("");
  const [showScanner, setShowScanner] = useState(false);
  useEffect(() => {
    if (
      "mediaDevices" in navigator &&
      "getUserMedia" in navigator.mediaDevices
    ) {
      console.log("Camera Permission already Granted...");
    } else {
      (async () => {
        const stream = navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: {
              exact: "environment",
            },
          },
        });
        if (!stream) {
          toast.error(
            "Camera permission is required to scan barcodes, reload to provide permission.",
          );
        } else {
          // const BarcodeScannerComponent = (await import("react-qr-barcode-scanner-recent-react")).default;
        }
      })();
    }
  }, []);

  return (
    <Modal
      show={show}
      onClose={onClose}
      onConfirm={onConfirm}
      withCloseHandler={false}
    >
      <div className="space-y-4 mb-4">
        <FaQuestionCircle className=" mx-auto w-20 h-20 text-primary" />
        <p className="font-normal text-xl">{title}</p>
        <div className="font-normal text-sm text-justify border border-gray-400 rounded-md bg-gray-200 p-4 mt-2">
          {message}
        </div>
        <Formik
          innerRef={formRef}
          initialValues={{
            tracking_id: "",
          }}
          validationSchema={schema}
          onSubmit={async (values, { resetForm }) => {
            await onConfirm(values);
            resetForm();
          }}
        >
          {({}) => (
            <Form>
              <TextInput
                name="tracking_id"
                label="Tracking Id"
                Icon={BiBarcodeReader}
                required
              />
              <Button
                type="button"
                className="mx-auto"
                onClick={() => setShowScanner(true)}
              >
                Scan
              </Button>
            </Form>
          )}
        </Formik>
        <div className="flex items-center justify-center space-x-6 pb-6">
          <button
            type="submit"
            className="bg-green-600 w-1/2 text-white inline-block font-bold px-7 py-3 rounded-xl"
            onClick={handleSubmit}
          >
            Confirm
          </button>
          <button
            className="bg-red-600 w-1/2 text-white font-bold px-7 inline-block py-3 rounded-xl"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TrackingIdModal;
