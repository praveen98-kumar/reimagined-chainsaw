import type { GetStaticProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaUsers } from "react-icons/fa";
import { RiFileTextLine, RiWhatsappLine } from "react-icons/ri";
import AddSevadarButton from "@/components/AddSevadarButton";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { SocialPlatformReport } from "@/components/SocialPlatformReport";
import StatusCard, {
  StatusCardBox,
  StatusCardGrid,
  StatusCardTitle,
} from "@/components/StatusCard";
import { useAppSelector } from "@/redux/store";
import { isValidUser } from "@/shared/functions/utils";
import type { NextApplicationPage } from "@/shared/interfaces/app";

const SocialSevaIndexPage: NextApplicationPage = () => {
  const { t: tc } = useTranslation("common");
  const router = useRouter();
  const { active_permission } = useAppSelector((s) => s.auth);
  const [isLoading, setIsLoading] = React.useState(true);

  const isSevadar = active_permission?.role === "social_media_sevadar";
  const isStateSevadar =
    active_permission?.role === "social_media_state_sevadar";
  const showSocialMediaPlatformReport = isValidUser(
    "social_media_platform_report"
  );

  useEffect(() => {
    if (isSevadar) {
      router.replace("/seva/social/update");
    } else {
      setIsLoading(false);
    }
  });

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: "Social Media Seva",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        {isLoading ? (
          <div className="w-full flex justify-center items-center h-40">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <StatusCard
              className="p-1 drop-shadow-none border-gray-300"
              path="social_media_seva_count"
              type="socialMediaCounts"
              sevadar_type="social_media_sevadar"
              refreshButtonFullWidth={showSocialMediaPlatformReport}
            >
              {({ values, isLoading }) =>
                showSocialMediaPlatformReport ? (
                  <div className="gap-1 flex">
                    <div className="p-1.5 flex flex-col justify-between text-center border rounded w-1/3 bg-gray-200">
                      <p className="text-xs font-bold uppercase">
                        Total Sevadar
                      </p>
                      <p className="font-bold text-xl">
                        {values?.total_sevadar || 0}
                      </p>
                    </div>
                    <div className="p-1.5 flex flex-col justify-between text-center  border rounded rounded w-1/3 bg-yellow-300">
                      <p className="text-xs font-bold uppercase">Pending</p>
                      <p className="font-semibold text-xl">
                        {Number(values?.total_sevadar) -
                          Number(values?.social_media_seva) || 0}
                      </p>
                    </div>
                    <div className="p-1.5 flex flex-col justify-between text-center border rounded rounded w-1/3 bg-green-300">
                      <p className="text-xs font-bold uppercase">Completed</p>
                      <p className="font-semibold text-xl">
                        {values?.social_media_seva || 0}
                      </p>
                    </div>
                  </div>
                ) : (
                  <React.Fragment>
                    <StatusCardTitle>
                      {"Social Media Seva Status"}
                    </StatusCardTitle>
                    <StatusCardGrid>
                      <StatusCardBox
                        label="Total Sevadar"
                        count={values?.total_sevadar || 0}
                        status={"default"}
                        className="col-span-2 min-h-[80px]"
                        isLoading={isLoading}
                      />
                      <StatusCardBox
                        label="Report Pending"
                        count={
                          Number(values?.total_sevadar || 0) -
                          Number(values?.social_media_seva || 0)
                        }
                        status={"red"}
                        isLoading={isLoading}
                        className="min-h-[80px]"
                      />
                      <StatusCardBox
                        label="Report Submitted"
                        count={values?.social_media_seva || 0}
                        status={"green"}
                        className="min-h-[80px]"
                        isLoading={isLoading}
                      />
                    </StatusCardGrid>
                  </React.Fragment>
                )
              }
            </StatusCard>
            {showSocialMediaPlatformReport && <SocialPlatformReport />}
            {isValidUser("sevadar_list") && (
              <Link
                href={"/seva/social/sevadar-list?sevaType=social_media"}
                className="p-2 gap-2 cursor-pointer rounded-lg bg-white border border-gray-400 drop-shadow-lg flex items-center justify-center font-bold text-primary text-lg"
              >
                <FaUsers size={24} />
                Sevadar List
              </Link>
            )}
            <AddSevadarButton
              permission="add_social_media_sevadar"
              params={{
                type: "social_media",
                role: "social_media_sevadar",
              }}
            />
            {isValidUser("sm_seva_team_map") && (
              <Link
                href={"/seva/social/add-remove-sevadar"}
                className="p-2 cursor-pointer rounded-lg bg-white border border-gray-400 drop-shadow-lg flex items-center justify-center font-bold text-primary text-lg"
              >
                Add Sevadar To Teamleader
              </Link>
            )}
            <div className="grid w-full grid-cols-2 sm:grid-cols-2 auto-cols-max gap-4">
              {isValidUser("add_daily_social_media_question") &&
                !isStateSevadar && (
                  <Link href={"/seva/social/list-questions"}>
                    <button type="button" className={bottomButtonClass}>
                      <span className="ml-1 text-sm leading-none">
                        {tc("add_daily_question")}
                      </span>
                    </button>
                  </Link>
                )}
              {isValidUser("add_daily_social_media_question") &&
                isStateSevadar && (
                  <Link href={"/seva/social/state-list-questions"}>
                    <button type="button" className={bottomButtonClass}>
                      <span className="ml-1 text-sm leading-none">
                        {tc("add_daily_question")}
                      </span>
                    </button>
                  </Link>
                )}
              {isValidUser("add_social_media_question") && (
                <Link href={"/seva/social/list-master-questions"}>
                  <button type="button" className={bottomButtonClass}>
                    <span className="ml-1 text-sm leading-none">
                      {tc("add_master_question")}
                    </span>
                  </button>
                </Link>
              )}
              {isValidUser("social_media_seva_reports") && (
                <Link href={"/report?url=social_media_report"}>
                  <button type="button" className={bottomButtonClass}>
                    <RiFileTextLine className="w-7 h-7 text-yellow-500" />
                    <span className="ml-1 text-sm leading-none">
                      {tc("report")}
                    </span>
                  </button>
                </Link>
              )}
              {isValidUser("social_media_seva_reports_whatsapp") && (
                <Link href={"/seva/social/whatsapp-report"}>
                  <button type="button" className={bottomButtonClass}>
                    <RiWhatsappLine className="w-7 h-7 text-green-600" />
                    <span className="ml-1 text-sm leading-none">
                      {tc("whatsapp_reports")}
                    </span>
                  </button>
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};
const bottomButtonClass = `w-full bg-black text-white rounded-lg h-12 justify-center flex items-center gap-2 px-4 text-xs sm:text-md`;

SocialSevaIndexPage.requireAuth = true;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};

export default SocialSevaIndexPage;
