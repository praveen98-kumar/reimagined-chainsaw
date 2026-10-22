import React, { useEffect } from "react";
import Modal from "./Modal";
import Image from "next/image";
import Button from "@/components/Button";

interface Props {
  show: boolean;
  onClose: () => void;
}

const GurujiAshirwadModal: React.FC<Props> = ({ show, onClose }) => {
  useEffect(() => {
    if (show) {
      setTimeout(onClose, 3000);
    }
  }, [show]);
  return (
    <Modal
      show={show}
      onClose={onClose}
      onConfirm={onClose}
      isAshirwad={true}
      modalClasses={
        "h-full bg-[url('/assets/images/ashirwad.jpg')] bg-no-repeat bg-top"
      }
      withCloseHandler={false}
    >
      <div className="h-2/3" />
      <div className="h-1/3 m-2 space-y-8">
        <p className="font-normal text-xl text-center mt-auto">
          <strong>Jai Bandi Chhod Ki!</strong>
          <br />
          सेवक सेवा में रहे, सेवक कहिये सोय! <br />
          कहे कबीर सेवा बिना, सेवक कहां से होय!!
        </p>
        <Button
          onClick={onClose}
          className="bg-red-500 w-1/2 mx-auto text-center flex items-center justify-center"
        >
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default GurujiAshirwadModal;
