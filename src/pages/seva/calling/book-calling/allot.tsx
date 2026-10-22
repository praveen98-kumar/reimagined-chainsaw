import { AllotedCard, SevaAllotCard } from "@/components/card/userAllotCard";
import Layout from "@/components/Layout";
import apiClient from "@/http/index";
import { User } from "@/shared/interfaces/user";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import SevaCountModal from "@/components/modal/SevaCountModal";
import ButtonTabs from "@/components/ButtonTabs";
import { Tab } from "@/shared/interfaces/app";
import dayjs from "dayjs";
import { useAppSelector } from "@/redux/store";
import { useTranslation } from "react-i18next";
import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const Allot = () => {
  const { t } = useTranslation("common");
  const [activeTab, setActiveTab] = useState(0);
  const [tabs] = useState<Tab[]>([
    { label: t("to_be_allotted"), page: 1, hasNext: true, query: "users" },
    {
      label: t("history"),
      page: 1,
      hasNext: true,
      query: "seva_allote_list",
    },
  ]);
  const [users, setUsers] = useState<User[]>([]);
  const [allottedUsers, setAllottedUsers] = useState<User[]>([]);
  const [showButton] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const { allot_pending } = useAppSelector(
    (state) => state.counts.bookCallingCounts
  );
  const closeModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await apiClient.get("users", {
          params: { seva_type: "book_calling", limit: 0 },
        });
        const user = response?.data?.data?.result;
        setUsers(
          [...user].filter(
            (u) => dayjs(new Date()).diff(dayjs(u?.allotted_date), "d") != 0
          )
        );
        setAllottedUsers(
          [...user].filter(
            (u) => dayjs(new Date()).diff(dayjs(u?.allotted_date), "d") == 0
          )
        );
      } catch (error: any) {
        toast.error(error?.data?.error);
      }
    };
    getUsers();
    // const now =dayjs(new Date()).format('YYYY-MM-DD');
    // setShowButton( dayjs().isAfter(dayjs(`${now} 06:00:00`)) && dayjs().isBefore(dayjs(`${now} 09:00:59`)));
  }, []);

  const onAllott = useCallback(
    async ({ u, seva_count = 0 }: { u: User; seva_count: number }) => {
      setShowModal(true);
      setSelectedUser({ u, seva_count });
    },
    []
  );

  const handleConfirm = async (values?: any) => {
    try {
      const data = {
        user_id: selectedUser?.u?.id,
        ...(values && values),
      };
      const response = await apiClient.post("calling", data);
      toast.success(response.data?.message);
      setTimeout(() => {
        setShowModal(false);
      }, 500);
    } catch (e: any) {
      toast.error(e?.response.data.error);
    }
  };

  return (
    <Layout
      headerProps={{
        isBack: true,
        // heading: "Allot Book Calling Seva",
        heading: "बुक अलोट कॉलिंग सेवा",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <ButtonTabs
          handleClick={() => {}}
          items={[...tabs].map((t, i) => ({
            label: t.label,
            active: i === activeTab,
            handleClick: () => setActiveTab(i),
          }))}
        />

        {activeTab == 0 && (
          <div className="p-1 space-y-1 border bg-green-600 font-bold text-white text-center">
            Pending Seva : {allot_pending}
          </div>
        )}
        {!showButton && (
          <p className={"font-bold text-lg text-center mx-auto"}>
            Allot Timing : 06 AM to 09 AM
          </p>
        )}
        {activeTab == 1 ? (
          <>
            {users.map((u, i) => (
              <AllotedCard key={i} user={u} />
            ))}
          </>
        ) : (
          <>
            {users.map((u, i) => (
              <SevaAllotCard
                key={i}
                onAllot={onAllott}
                user={u}
                type="allot"
                showButtons={showButton}
              />
            ))}
            <hr className={"border-t-2 border-gray-500"} />
            <p className={"font-bold text-lg mt-1 text-center mx-auto mb-0"}>
              अलोट सेवादारों की लिस्ट
            </p>
            {allottedUsers.map((u, i) => (
              <SevaAllotCard
                key={i}
                onAllot={onAllott}
                user={u}
                type="allot"
                showButtons={showButton}
              />
            ))}
          </>
        )}
      </div>
      <SevaCountModal
        show={showModal}
        name={selectedUser?.u?.name}
        onClose={closeModal}
        initialValues={{ seva_count: selectedUser?.seva_count ?? 30 }}
        onConfirm={(values) => handleConfirm(values)}
      />
    </Layout>
  );
};

export default Allot;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "calling"])),
    },
  };
};
