import React from "react";
import Modal from "./Modal";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

interface Props {
  show: boolean;
  onClose: () => void;
  title: string;
}
export const OtherLoginPin: React.FC<Props> = ({ show, onClose, title }) => {
  const { t: tc } = useTranslation("common");
  function copyPin() {
    navigator.clipboard.writeText(title);
    toast.success("Pin copied!");
    onClose();
  }
  return (
    <Modal
      show={show}
      onClose={onClose}
      onConfirm={() => {}}
      withCloseHandler={false}
    >
      <div className="space-y-8 mb-8">
        <p className="font-normal text-xl text-center">Other Login Pin</p>
        <p className="font-semibold text-2xl text-center">{title}</p>
        <div className="flex items-center justify-center space-x-6 pb-6">
          <button
            className="bg-blue-500 w-1/2 text-white font-bold px-7 inline-block py-2 rounded-xl"
            onClick={copyPin}
          >
            {tc("Copy")}
          </button>
        </div>
      </div>
    </Modal>
  );
};
