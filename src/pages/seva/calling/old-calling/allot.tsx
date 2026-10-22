import Button from "@/components/Button";
import Layout from "@/components/Layout";
import { NextApplicationPage, Tab } from "@/shared/interfaces/app";
import { Formik, Form } from "formik";
import { GetStaticProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, { useCallback, useEffect, useState } from "react";
import { Option } from "@/shared/interfaces/option";
import Select from "@/components/input/Select";
import {
  CardWrapper,
  CardMessage,
  CardIcons,
} from "@/components/card/CommonCard";
import dayjs from "dayjs";
import { cn, getInitialValues } from "@/shared/functions/utils";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast from "react-hot-toast";
import SevaCountModal from "@/components/modal/SevaCountModal";
import ButtonTabs from "@/components/ButtonTabs";
import { AllotedCard, SevaAllotCard } from "@/components/card/userAllotCard";
import { User } from "@/shared/interfaces/user";
import { useAppSelector } from "@/redux/store";
import apiClient from "@/http/index";

const OldCallingAllotPage: NextApplicationPage = () => {
  const { t } = useTranslation("calling");
  const { t: tc } = useTranslation("common");
  const [activeTab, setActiveTab] = useState(0);
  const [tabs] = useState<Tab[]>([
    { label: tc("to_be_allotted"), page: 1, hasNext: true, query: "users" },
    {
      label: tc("history"),
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
  const { active_permission, active_region_index } = useAppSelector(
    (state) => state.auth
  );
  const closeModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await apiClient.get("users", {
          params: {
            seva_type: "old_calling",
            limit: 0,
            ...getInitialValues(active_permission, active_region_index),
          },
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
      const response = await apiClient.post("old_calling", data);
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
        heading: t("old.seva.title.allot") || "Old Calling Allot Seva",
      }}
    >
      <div className="p-4 mx-auto max-w-xl w-full space-y-4 ">
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
                onAllot={() => {
                  setShowModal(true);
                  setSelectedUser({ u, seva_count: 12 });
                }}
                user={u}
                type="allot"
                showButtons={true}
              />
            ))}
            <hr className={"border-t-2 border-gray-500"} />
            <p className={"font-bold text-lg mt-1 text-center mx-auto mb-0"}>
              List of allotted sevadar
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
        onConfirm={(data) => handleConfirm(data)}
        title="Allot Old Calling"
      />
    </Layout>
  );
};

export default OldCallingAllotPage;

OldCallingAllotPage.requireAuth = true;
export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "calling"])),
    },
  };
};
