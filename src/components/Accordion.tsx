import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";

type AccordionProps = {
  headerComponent: React.ReactNode;
  children?: React.ReactNode;
};

const Accordion: React.FC<AccordionProps> = ({ headerComponent, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      {/* header */}
      <motion.header className="flex p-2 rounded">
        <div className="flex-1">{headerComponent}</div>
        <motion.button onClick={() => setIsOpen((pre) => !pre)}>
          {isOpen ? <FaArrowUp /> : <FaArrowDown />}
        </motion.button>
      </motion.header>
      {isOpen && (
        <AnimatePresence>
          <motion.section
            className="bg-gray-100 p-2 rounded overflow-hidden"
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            {children}
          </motion.section>
        </AnimatePresence>
      )}
    </>
  );
};

export default Accordion;
