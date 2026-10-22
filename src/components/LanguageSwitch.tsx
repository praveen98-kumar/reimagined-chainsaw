import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { IoLanguageSharp } from "react-icons/io5";
import Link from "next/link";

const languageMap: Record<string, string> = {
  en: "English",
  hn: "हिंदी",
};

const LanguageSwitch = () => {
  const { t: tc } = useTranslation("common");
  const { locales, locale } = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <div>
      <motion.div
        onClick={() => setOpen((pre) => !pre)}
        className={`bg-gray-100 p-2 py-3 border border-gray-300 flex w-full items-center space-between ${
          open ? "rounded-t-md" : "rounded-md"
        }`}
      >
        <IoLanguageSharp className="mr-4 w-5 h-5" />
        <span className="font-bold text-gray-700 cursor-pointer">
          {tc("language")}
        </span>
      </motion.div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="p-2 space-y-1 bg-gray-900 rounded-b-lg overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", maxHeight: "full", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {locales?.map((l) => (
              <Link
                href={"/"}
                locale={l}
                key={l}
                className={`${
                  l == locale ? "bg-white text-gray-800" : "text-white"
                } rounded-md p-2 flex w-full items-center space-between cursor-pointer font-bold`}
              >
                {languageMap[l]}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitch;
