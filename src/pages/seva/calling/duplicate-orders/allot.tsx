import { AllotedCard, SevaAllotCard } from "@/components/card/userAllotCard";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import apiClient from "@/http/index";
import { useAppSelector } from "@/redux/store";
import { User } from "@/shared/interfaces/user";
import useInfiniteQuery from "@/hooks/useInfiniteQuery";
import React, { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";
import SevaCountModal from "@/components/modal/SevaCountModal";
import ButtonTabs from "@/components/ButtonTabs";
import { Tab } from "@/shared/interfaces/app";

const Allot = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [tabs, setTabs] = useState<Tab[]>([
    {
      label: "पेंडिंग सेवा",
      page: 1,
      hasNext: true,
      query: "users",
    },
    {
      label: "पूर्ण सेवा",
      page: 1,
      hasNext: true,
      query: "seva_allote_list",
    },
  ]);
  const { active_permission, active_region_index } = useAppSelector(
    (state) => state.auth
  );
  const [users, setUsers] = useState<User[]>([]);
  const loadingRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const closeModal = () => {
    setShowModal(false);
  };
  const { loading } = useInfiniteQuery(
    tabs,
    setTabs,
    activeTab,
    loadingRef,
    {
      district_id: active_permission?.region[active_region_index].district_id,
      seva_type: "duplicate_order",
    },
    (e) => {
      setUsers(e);
    },
    [activeTab],
    true
  );

  const onAllott = useCallback(async (u: User) => {
    setShowModal(true);
    setSelectedUser(u);
  }, []);

  const handleConfirm = async (values?: any) => {
    try {
      const data = {
        user_id: selectedUser?.id,
        ...(values && values),
      };
      const response = await apiClient.post("duplicate_orders", data);
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
        heading: "Allott Duplicate Order Seva",
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
                onAllot={() => onAllott(u)}
                user={u}
                type="allot"
              />
            ))}
          </>
        )}
        <div ref={loadingRef} className="flex w-full justify-center">
          {loading ? <LoadingSpinner className={"mx-auto w-8 h-8"} /> : null}
        </div>
      </div>
      <SevaCountModal
        show={showModal}
        name={selectedUser?.name}
        onClose={closeModal}
        initialValues={{ seva_count: 30 }}
        onConfirm={(values) => handleConfirm(values)}
      />
    </Layout>
  );
};

export default Allot;
