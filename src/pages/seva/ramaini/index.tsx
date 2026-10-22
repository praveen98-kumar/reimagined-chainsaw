import Layout from "@/components/Layout";
import ListItem from "@/components/ListItem";
import StatusCard, {
  StatusCardBox,
  StatusCardGrid,
  StatusCardTitle,
} from "@/components/StatusCard";
import { cn } from "@/shared/functions/utils";
import { NextApplicationPage } from "@/shared/interfaces/app";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React from "react";
import LinkButton, { LinkButtonContainer } from "@/components/LinkButton";
import Icon from "@/components/Icon";
import { useTranslation } from "react-i18next";

const sevaItem = [
  {
    href: "/seva/ramaini/list",
    Icon: (
      <Icon containerClass="w-9 h-9" src="/assets/icons/callingIncorrect.png" />
    ),
    title: "Ramaini Seva",
    subtitle: "Ramaini Seva",
    count: 22,
    permission: ["ramaini_seva_list", "ramaini_seva_records"],
  },
];

const RamainiSevaPage: NextApplicationPage = () => {
  const { t } = useTranslation("ramaini");
  const { t: tc } = useTranslation("common");
  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: "Ramaini Seva",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <StatusCard
          path="ramaini_seva_count"
          type="ramainiCounts"
          sevadar_type=""
        >
          {({ values, isLoading }) => (
            <React.Fragment>
              <StatusCardTitle>{"Ramaini Seva Status"}</StatusCardTitle>
              <StatusCardGrid>
                <StatusCardBox
                  label="Ladka Paksha"
                  count={Number(values?.groom_member || 0)}
                  status={"red"}
                  isLoading={isLoading}
                  className={cn("mih-h-[60px")}
                />
                <StatusCardBox
                  label="Ladki Paksha"
                  count={values?.bride_member || 0}
                  status={"green"}
                  isLoading={isLoading}
                  className={cn("mih-h-[60px")}
                />
              </StatusCardGrid>
            </React.Fragment>
          )}
        </StatusCard>
        <div>
          {sevaItem.map((item) => (
            <ListItem item={item} key={item.href} t={t} />
          ))}
        </div>
        <LinkButtonContainer>
          <LinkButton
            permission="ramaini_seva_reports_pdf"
            href="/report?url=ramaini_seva_report"
            iconSrc="/assets/icons/reportYellow.png"
            title={tc("report")}
          />
        </LinkButtonContainer>
      </div>
    </Layout>
  );
};

export default RamainiSevaPage;

RamainiSevaPage.requireAuth = true;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "ramaini"])),
    },
  };
};
