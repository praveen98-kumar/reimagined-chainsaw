import React, { SetStateAction } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/components/Button";

interface SuccessModalProps {
  show: boolean;
  onClose: React.Dispatch<SetStateAction<boolean>>;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ show, onClose }) => {
  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            className="bg-white fixed h-full z-20 inset-0"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.2 }}
          >
            <div className="h-1/2 bg-primary relative w-full p-4">
              <p className="text-white text-center font-normal text-xl">
                Completed
              </p>
            </div>
            <div className="p-8 text-center space-y-8">
              <h3 className="font-extrabold text-xl text-primary">
                Jai Ho Bandi Chhod Ki
              </h3>
              <p></p>
              <Button onClick={() => onClose(false)} variant="secondary">
                CLOSE
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SuccessModal;
