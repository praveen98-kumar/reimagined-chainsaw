import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaChevronDown } from "react-icons/fa";
import { IoLanguageSharp } from "react-icons/io5";

import {
  iconChip,
  menuRowClosed,
  menuRowOpen,
  rowLabel,
  subItem,
  subItemActive,
  subPanel,
} from "./sidebarTheme";

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
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((pre) => !pre)}
        className={open ? menuRowOpen : menuRowClosed}
      >
        <span className={iconChip}>
          <IoLanguageSharp className="size-4" />
        </span>
        <span className={rowLabel}>{tc("language")}</span>
        <FaChevronDown
          className={`size-3.5 text-[#9a3412] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className={subPanel}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {locales?.map((l) => (
              <Link
                href={"/"}
                locale={l}
                key={l}
                className={l === locale ? subItemActive : subItem}
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
