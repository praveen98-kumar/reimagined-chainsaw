import Layout from "@/components/Layout";
import ListItem, { IListItem } from "@/components/ListItem";
import { NextApplicationPage } from "@/shared/interfaces/app";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Icon from "@/components/Icon";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { isValidUser } from "@/shared/functions/utils";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import apiClient from "@/http/index";
import dayjs from "dayjs";
import AddSevadarButton from "@/components/AddSevadarButton";

export const satnamCallingPageList: Array<{
  title: string;
  subtitle?: string;
}> = [
  { title: "1st", subtitle: "General Call" },
  { title: "2nd", subtitle: "General Call" },
  { title: "3rd", subtitle: "2nd Hajri" },
  { title: "4th", subtitle: "General Call" },
  { title: "5th", subtitle: "3rd Hajri" },
  { title: "6th", subtitle: "General Call" },
  { title: "7th", subtitle: "4th Hajri" },
  { title: "8th", subtitle: "General Call" },
  { title: "9th", subtitle: "Satnam" },
];
const sevaItems: Array<IListItem> = [
  {
    href: "allot",
    title: "satnam.seva.title.allot",
    subtitle: "satnam.seva.subtitle.allot",
    permission: "allot_satnam_calling",
    Icon: <Icon containerClass="w-9 h-9" src="/assets/icons/allotUser.png" />,
  },
  {
    href: "not_interested",
    title: "satnam.seva.title.not_interested",
    subtitle: "satnam.seva.subtitle.not_interested",
    permission: "allot_satnam_calling",
    Icon: <Icon containerClass="w-9 h-9" src="/assets/icons/calling.png" />,
  },
];

const PageCard = ({
  title,
  subtitle,
  count = 0,
}: {
  title: string;
  subtitle?: string;
  count?: number;
}) => {
  return (
    <div className="w-full h-20 min-h-full flex flex-col border border-gray-400 drop-shadow-lg bg-white rounded-md p-2 text-center relative">
      <p className="text-lg font-bold">{title} Call</p>
      {subtitle && (
        <p className="text-xs leading-3  font-semibold text-gray-400">
          ( {subtitle} )
        </p>
      )}
      <p className="text-red-500 text-sm font-semibold text-center">{count}</p>
    </div>
  );
};

const SatnamCallingPage: NextApplicationPage = () => {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation("calling");
  const [callingCounts, setCallingCounts] = useState<any[]>([]);
  const [allotPending, setAllotPending] = useState<number>(0);

  const nextPageRoute =
    isValidUser("satnam_calling_records") ||
    isValidUser("satnam_calling_list", ["satnam_calling_district_sevadar"])
      ? "records"
      : isValidUser("satnam_calling_list")
      ? "list"
      : "";

  const getCounts = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get("satnam_calling_count", {
        params: {
          end: dayjs().format("YYYY-MM-DD"),
        },
      });
      setCallingCounts(data.data.satnam_calling_counts);
      setAllotPending(data.data.allotPending);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCounts();
  }, []);

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: t("satnam.heading") ?? "Satnam Calling Seva",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        {sevaItems.map((sevaItem) => (
          <ListItem
            item={{
              ...sevaItem,
              href: `satnam-calling/${sevaItem.href}`,
              count: sevaItem.href == "allot" ? allotPending : 100,
            }}
            key={sevaItem.href}
          />
        ))}
        <AddSevadarButton
          permission="add_satnam_calling_sevadar"
          params={{
            type: "satnam_calling",
            role: "satnam_calling_sevadar",
          }}
        />
        {loading ? (
          <div className="flex items-center p-5">
            <LoadingSpinner className="h-8 w-8 mx-auto" />
          </div>
        ) : (
          <div className="w-full">
            <h3 className="text-center my-4 font-semibold text-xl capitalize">
              Satnam Calling {nextPageRoute}
            </h3>
            <div className="grid grid-cols-3 gap-x-4 gap-y-6">
              {satnamCallingPageList.map(({ title, subtitle }, i) => (
                <Link href={`satnam-calling/${title}/${nextPageRoute}`} key={i}>
                  <PageCard
                    title={title}
                    subtitle={subtitle}
                    count={
                      callingCounts.find((calling) => calling.sequence == i + 1)
                        ?.pending_seva ?? 0
                    }
                  />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

SatnamCallingPage.requireAuth = true;
export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "calling"])),
    },
  };
};

export default SatnamCallingPage;
