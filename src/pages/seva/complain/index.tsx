import AddSevadarButton from "@/components/AddSevadarButton";
import Icon from "@/components/Icon";
import Layout from "@/components/Layout";
import SevaCard from "@/components/card/SevaCard";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "react-i18next";
import { NextApplicationPage } from "@/shared/interfaces/app";

interface ISevaList {
  href: string;
  Icon: React.ReactNode;
  title: string;
  subtitle?: string;
  permission: string;
}

const sevaList: ISevaList[] = [
  {
    href: "/seva/complain/track-order?type=complaint",
    Icon: <Icon src="/assets/icons/Book Order complaint.png" />,
    title: "seva.title.add_complaint",
    subtitle: "Enter National Book order details here",
    permission: "book_complain_seva",
  },
  {
    href: "/download?url=download_book_complain",
    Icon: <Icon src="/assets/icons/edit4.png" />,
    title: "seva.title.download_book_complain",
    subtitle: "Download Book Order Complain Details here.",
    //permission: "download_national_order
    permission: "download_book_complain_list",
  },
];

const Complain: NextApplicationPage = () => {
  const { t: t } = useTranslation("order");

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: t("seva.heading.main") ?? "Book Order Seva",
      }}
    >
      <div className="p-4 flex flex-col mx-auto w-full max-w-xl h-full">
        <div className="space-y-4 flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {sevaList.map((item) => {
              return (
                <SevaCard
                  key={item.href}
                  href={item.href}
                  Icon={item.Icon}
                  title={t(item.title)!}
                  subtitle={item.subtitle}
                  permission={item.permission}
                  showSubTitle={false}
                />
              );
            })}
          </div>
          <AddSevadarButton
            permission="add_book_complain_sevadar"
            params={{
              type: "book_complain",
              role: "book_complain_sevadar",
            }}
          />
        </div>
      </div>
    </Layout>
  );
};

Complain.requireAuth = true;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "order"])),
    },
  };
};

export default Complain;
