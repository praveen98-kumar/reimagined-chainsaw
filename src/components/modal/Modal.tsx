import LoadingSpinner from "@/components/LoadingSpinner";
import { cn } from "@/shared/functions/utils";
import { AnimatePresence, motion, Variants } from "framer-motion";
import React, { RefObject, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ImCancelCircle } from "react-icons/im";

export interface ModalProps {
  show: boolean;
  onConfirm: (data?: object) => void;
  onClose: () => void;
  children?: React.ReactNode;
  modalVariant?: Variants | undefined;
  modalClasses?: string | undefined;
  withCloseHandler?: boolean;
  isAshirwad?: boolean;
  disableClosing?: boolean;
  loading?: boolean;
}

const backdrop = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

const modal = {
  hidden: { y: "100%", opacity: 0 },
  visible: {
    y: "50",
    opacity: 1,
    transition: { delay: 0.5 },
  },
};

const Modal: React.FC<ModalProps> = ({
  show,
  children,
  onClose,
  onConfirm,
  modalVariant = modal,
  modalClasses = "",
  withCloseHandler = true,
  isAshirwad = false,
  disableClosing = false,
  loading = false,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const { t: tc } = useTranslation("common");

  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            className={`bg-slate-800/50 inset-0 z-30 fixed flex flex-col justify-end pointer-event-none`}
            variants={backdrop}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={() => {
              if (!loading && !disableClosing) onClose();
            }}
          />
          <motion.div
            ref={sheetRef}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              duration: 0.2,
            }}
            className={cn(
              `bg-white max-h-[90%] overflow-y-auto fixed inset-x-0 bottom-0 z-30 p-2 pt-10 rounded-t-xl`,
              modalClasses,
            )}
          >
            {isAshirwad ? null : (
              <button
                type="button"
                onClick={() => {
                  if (!loading && !disableClosing) onClose();
                }}
                className="absolute top-3 right-3 "
              >
                <ImCancelCircle className="h-6 w-6 text-gray-600 " />
              </button>
            )}
            <div className="w-full h-full overflow-y-auto mx-auto max-w-xl px-6">
              {children ?? null}
              {withCloseHandler && (
                <div className="flex items-center justify-center space-x-6 pb-6">
                  <button
                    className={cn(
                      "bg-green-600 w-1/2 text-white flex items-center justify-center font-bold px-7 py-2 rounded-xl",
                      {
                        "opacity-80": loading,
                      },
                    )}
                    onClick={onConfirm}
                    disabled={loading || disableClosing}
                    type="button"
                  >
                    {loading && (
                      <LoadingSpinner className={`w-4 h-4 mr-2 fill-white`} />
                    )}
                    {tc("confirm")}
                  </button>
                  <button
                    className={cn(
                      "bg-red-600 text-white w-1/2 font-bold px-7 inline-block py-2 rounded-xl",
                      {
                        "opacity-80": disableClosing,
                      },
                    )}
                    onClick={onClose}
                    disabled={disableClosing}
                    type="button"
                  >
                    {tc("cancel")}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
