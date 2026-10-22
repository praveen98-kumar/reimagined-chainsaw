import React from "react";
import { FaQuestionCircle } from "react-icons/fa";
import Modal from "./Modal";
import { OrderIn } from "@/shared/interfaces/order-in-card";
import { useTranslation } from "react-i18next";
interface Props {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  order: OrderIn;
}

const DuplicateModal: React.FC<Props> = ({
  show,
  onClose,
  onConfirm,
  order,
}) => {
  const { t: tq } = useTranslation("question");
  return (
    <Modal show={show} onClose={onClose} onConfirm={onConfirm}>
      <div className="space-y-8 mb-8">
        <FaQuestionCircle className=" mx-auto w-20 h-20 text-primary" />
        <p className="font-normal text-xl text-center">
          {tq("duplicate", { sr_no: order.id })}
        </p>
      </div>
    </Modal>
  );
};

export default DuplicateModal;
