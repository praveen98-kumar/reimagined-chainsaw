import React from "react";
import { FaQuestionCircle } from "react-icons/fa";
import Modal from "./Modal";
import { useTranslation } from "react-i18next";

interface Props {
  show: boolean;
  onClose: () => void;
  onConfirm: (data?: object) => void;
  title: string;
}

const ConfirmModal: React.FC<Props> = ({ show, onClose, onConfirm, title }) => {
  const { t: tc } = useTranslation("common");
  const handleSubmit = () => {
    onConfirm();
    onClose();
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

export default ConfirmModal;
