import Layout from "@/components/Layout";
import { useAppSelector } from "@/redux/store";
import { tutorialList } from "@/constants/tutorialVideos";
import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "react-i18next";
import { NextApplicationPage } from "@/shared/interfaces/app";

interface TutorialItem {
  link: string;
  title: string;
  youtube: boolean;
}

export interface TutorialList extends Record<string, Array<TutorialItem>> {}

const Tutorials: NextApplicationPage = () => {
  const {
    all_permission: { permissions },
  } = useAppSelector((state) => state.auth);
  const { t: tc } = useTranslation("common");

  const videosToShow = Object.entries(tutorialList)
    .filter(([key]) => permissions.includes(key))
    .map(([, v]) => v)
    .flat();

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: tc("tutorial") ?? "Video Tutorial",
      }}
    >
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {videosToShow.map((v, i) => (
          <div
            key={i}
            className="border border-gray-400 p-2 rounded-md relative"
          >
            <p className="font-bold capitalize text-lg truncate mb-2">
              {v.title}
            </p>
            {v.youtube ? (
              <iframe
                className={"w-full h-[80vh]"}
                src={v.link}
                title="7 दिसंबर को होगा फैसला: कबीर का ज्ञान सच्चा या राधा स्वामी का? || Official Trailer | Factful Debates"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            ) : (
              <video
                className="rounded-md h-48 w-full border border-gray-200"
                title={v.title}
                controls
                controlsList="nodownload"
              >
                <source src={v.link} type="video/mp4" title={v.title} />
              </video>
            )}
          </div>
        ))}
      </div>
    </Layout>
  );
};

Tutorials.requireAuth = true;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};

export default Tutorials;
