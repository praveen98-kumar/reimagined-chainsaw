import Layout from "@/components/Layout";
import React, { useEffect } from "react";
import ListItem from "@/components/ListItem";
import { NextApplicationPage } from "@/shared/interfaces/app";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import useLocalstorage from "@/hooks/useLocalstorage";
import Icon from "@/components/Icon";
import { isValidUser } from "@/shared/functions/utils";
import AddSevadarButton from "@/components/AddSevadarButton";
import LinkButton, { LinkButtonContainer } from "@/components/LinkButton";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetStaticProps } from "next";
import { useTranslation } from "react-i18next";
import StatusCard, {
  StatusCardGrid,
  StatusCardTitle,
  StatusCardBox,
} from "@/components/StatusCard";
import { setCalls } from "@/redux/features/callingSlice";

interface ISevaList {
  href: string;
  Icon: React.ReactNode;
  title: string;
  subtitle?: string;
  count?: number;
  permission: string;
}

const sevalist: ISevaList[] = [
  {
    href: "/users/allot?seva_type=book_calling",
    Icon: (
      <Icon
        containerClass="w-9 h-full mt-2"
        src="/assets/icons/allotUser.png"
        className="w-10 h-10"
      />
    ),
    title: "book.seva.title.allot",
    subtitle: "book.seva.subtitle.allot",
    count: 22,
    permission: "book_calling_seva_allot_seva",
  },

  {
    href: "/seva/calling/book-calling/records",
    Icon: <Icon containerClass="w-9 h-9" src="/assets/icons/calling.png" />,
    title: "book.seva.title.records",
    subtitle: "book.seva.subtitle.records",
    count: 22,
    permission: "book_calling_seva_records",
  },
  {
    href: "/seva/calling/book-calling/list",
    Icon: <Icon containerClass="w-9 h-9" src="/assets/icons/calling.png" />,
    title: "book.seva.title.list",
    subtitle: "book.seva.subtitle.list",
    count: 22,
    permission: "book_calling_seva_list",
  },
];

const BookCalling: NextApplicationPage = () => {
  const { t } = useTranslation("calling");
  const { t: tc } = useTranslation("common");
  const { active_permission } = useAppSelector((state) => state.auth);
  const [, , removeState] = useLocalstorage("searchSevadars");
  const dispatch = useAppDispatch();
  useEffect(() => {
    removeState("searchSevadars");
    removeState("searchDisciples");
    dispatch(setCalls({ type: "bookCompleteCalls", calls: [] }));
  }, []);

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: t("book.heading") ?? "Book Calling Seva",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <StatusCard
          path="book_calling_count"
          type="bookCallingCounts"
          sevadar_type="book_calling_sevadar"
        >
          {({ values, isLoading }) => (
            <React.Fragment>
              <StatusCardTitle>
                {t("book.status") ?? "Book Order Status"}
              </StatusCardTitle>
              <StatusCardGrid>
                {active_permission?.role_region == "tehsil" ? (
                  <StatusCardBox
                    label={tc("pending")}
                    count={values?.pending_order ?? 0}
                    status={"red"}
                    isLoading={isLoading}
                  />
                ) : null}
                {active_permission?.role !== "book_calling_sevadar" ? (
                  <>
                    <StatusCardBox
                      label={tc("allot_pending")}
                      count={values?.allot_pending ?? 0}
                      status={"red"}
                      isLoading={isLoading}
                    />
                  </>
                ) : null}
                <StatusCardBox
                  className={
                    active_permission?.role === "book_calling_sevadar"
                      ? "col-span-2"
                      : ""
                  }
                  label={
                    active_permission?.role === "book_calling_sevadar"
                      ? tc("pending_seva")
                      : tc("sevadar_pending")
                  }
                  count={values?.pending_order ?? 0}
                  isLoading={isLoading}
                  status={"red"}
                />

                {/* <StatusCardBox */}
                {/*   label={"Issued Till Date"} */}
                {/*   count={bookCallingCounts?.otd} */}
                {/*   statusColor={"yellow"} */}
                {/* /> */}

                <StatusCardBox
                  label={tc("otm")}
                  count={values?.otm ?? 0}
                  isLoading={isLoading}
                  status={"yellow"}
                />
                {/* <StatusCardBox */}
                {/*   label={tc("ctd")} */}
                {/*   count={bookCallingCounts?.ctd} */}
                {/* /> */}
                <StatusCardBox
                  isLoading={isLoading}
                  label={tc("ctm")}
                  count={values?.ctm ?? 0}
                  status={"green"}
                />
              </StatusCardGrid>
            </React.Fragment>
          )}
        </StatusCard>
        <div>
          {sevalist.map((item) => {
            return (
              isValidUser(item.permission) && (
                <ListItem key={item.href} item={item} />
              )
            );
          })}
        </div>
        <AddSevadarButton
          permission="add_calling_sevadar"
          params={{
            type: "book_calling",
            role: "book_calling_sevadar",
          }}
        />
        <LinkButtonContainer>
          <LinkButton
            permission="book_calling_seva_reports"
            href="/report?url=book_calling_report"
            iconSrc="/assets/icons/reportYellow.png"
            title={tc("report")}
          />
          {
            <LinkButton
              permission="book_calling_seva_reports"
              href="/seva/calling/book-calling/whatsapp-report"
              iconSrc="/assets/icons/reportYellow.png"
              title={tc("whatsapp_reports")}
            />
          }
          <LinkButton
            permission="book_calling_seva_upload_list"
            href="/seva/calling/book-calling/upload"
            iconSrc="/assets/icons/reportYellow.png"
            title={t("book.upload")}
          />
          <LinkButton
            permission="book_calling_seva_download_list"
            href="/download?url=download_calling_orders"
            iconSrc="/assets/icons/reportYellow.png"
            title={t("book.download")}
          />
          <LinkButton
            permission="book_calling_seva_review"
            href="/seva/calling/book-calling/review"
            iconSrc="/assets/icons/reportYellow.png"
            title={tc("review")}
          />
        </LinkButtonContainer>
      </div>
    </Layout>
  );
};

BookCalling.requireAuth = true;
export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "calling"])),
    },
  };
};

export default BookCalling;
