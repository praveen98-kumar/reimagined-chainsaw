import Layout from "@/components/Layout";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useTranslation } from "react-i18next";

const languageMap: Record<string, string> = {
  en: "English",
  hn: "हिंदी",
};

const Settings = () => {
  const { t: tc } = useTranslation("common");
  const { locales, locale, replace } = useRouter();
  const onClick = (l: string) => () => {
    replace("/", undefined, { locale: l });
  };
  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: tc("settings") ?? "Settings",
      }}
    >
      <div className="p-4">
        <p className="font-semibold mb-2 capitalize">{tc("language")}</p>
        {locales?.map((l) => (
          <button
            key={l}
            onClick={onClick(l)}
            className="flex items-center gap-x-2 mb-2"
          >
            <div
              className={`w-4 h-4 rounded-full bg-white border-4 ${
                locale === l ? "border-blue-500" : "border-gray-200"
              }`}
            />
            <span className="">{languageMap[l]}</span>
          </button>
        ))}
      </div>
    </Layout>
  );
};

export default Settings;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};
