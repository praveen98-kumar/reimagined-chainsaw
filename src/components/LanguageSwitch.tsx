import { Globe } from "lucide-react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";

import SidebarSection, {
  ActiveCheck,
  sidebarOptionClass,
} from "./SidebarSection";

const languageMap: Record<string, string> = {
  en: "English",
  hn: "हिंदी",
};

const LanguageSwitch = () => {
  const { t: tc } = useTranslation("common");
  const { locales, locale } = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <SidebarSection
      Icon={Globe}
      title={tc("language")}
      open={open}
      onToggle={() => setOpen((pre) => !pre)}
    >
      {locales?.map((l) => (
        <Link
          href={"/"}
          locale={l}
          key={l}
          className={sidebarOptionClass(l == locale)}
        >
          {languageMap[l]}
          {l == locale && <ActiveCheck />}
        </Link>
      ))}
    </SidebarSection>
  );
};

export default LanguageSwitch;
