import ButtonTabs from "@/components/ButtonTabs";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { AllotedCard, SevaAllotCard } from "@/components/card/userAllotCard";
import SevaCountModal from "@/components/modal/SevaCountModal";
import apiClient from "@/http/index";
import { TCount, updateCounts } from "@/redux/features/countSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { getInitialValues } from "@/shared/functions/utils";
import { User } from "@/shared/interfaces/user";
import dayjs from "dayjs";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { sevaAllot } from "../../constants/app";

const Allot = () => {
  const { t: tc } = useTranslation("common");
  const { t } = useTranslation("calling");
  const [activeTab, setActiveTab] = useState(0);
  const { active_permission, active_region_index } = useAppSelector(
    (state) => state.auth
  );
  const [tabs] = useState<any[]>([
    { label: tc("to_be_allotted") },
    { label: tc("history") },
  ]);
  const [users, setUsers] = useState<User[]>([]);
  const [allottedUsers, setAllottedUsers] = useState<User[]>([]);
  const { counts } = useAppSelector((state) => state);
  const [showButton] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [history, setHistory] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [allotloading, setAllotLoading] = useState<boolean>(false);
  const [allotPending, setAllotpending] = useState(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const closeModal = () => {
    setShowModal(false);
  };
  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await apiClient.get("users", {
          params: {
            ...getInitialValues(active_permission, active_region_index),
            seva_type: sevaType,
            limit: 0,
          },
        });
        const user = response?.data?.data?.result;
        setUsers(
          [...user].filter(
            (u) =>
              dayjs(u.allotted_date).format("MMD") !=
              dayjs(new Date()).format("MMD")
          )
        );
        setAllottedUsers(
          [...user].filter(
            (u) =>
              dayjs(u.allotted_date).format("MMD") ==
              dayjs(new Date()).format("MMD")
          )
        );
      } catch (error: any) {
        console.error(error?.data?.error);
      }
    };
    getUsers();
  }, [router.query?.seva_type, active_permission]);

  const onAllott = useCallback(
    async ({
      u,
      seva_count = 0,
      type = "pending",
    }: {
      u: User;
      seva_count: number;
      type: "pending" | "done";
    }) => {
      setShowModal(true);
      setSelectedUser({ u, seva_count, type });
    },
    []
  );

  const getHistory = useCallback(
    async (page: number) => {
      if (activeTab == 1 && !loading) {
        setLoading(true);
        try {
          const { data } = await apiClient.get("seva_allote_list", {
            params: {
              ...getInitialValues(active_permission, active_region_index),
              seva_type: sevaType,
              page,
            },
          });
          const temphasMore = data.data.total > 10 * page;
          const temp =
            page == 1 ? data.data.result : [...history, ...data.data.result];

          setPage((p) => (page == 1 ? 2 : p + 1));
          setHasMore(temphasMore);
          setHistory(temp);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    },
    [activeTab, router.query.url, active_permission]
  );

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      getHistory(1);
    }
  }, [getHistory, inView]);

  const handleConfirm = async (values?: any) => {
    setAllotLoading(true);

    try {
      const data = {
        user_id: selectedUser?.u?.id,
        ...(values && values),
      };
      const response = await apiClient.post(url, data);
      toast.success(response.data?.message);
      setAllotpending(Number(allotPending) - values?.seva_count);
      dispatch(
        updateCounts({
          type: countKey as TCount,
          values: [
            {
              key: pendingKey,
              value: -Math.min(values.seva_count ?? 0, Number(allotPending)),
            },
          ],
        })
      );
      if (selectedUser.type == "pending") {
        setUsers(
          [...users].filter(
            (u) => u.id.toString() !== selectedUser.u.id.toString()
          )
        );
        setAllottedUsers([
          ...allottedUsers,
          {
            ...selectedUser.u,
            pending_seva:
              selectedUser.u.pending_seva +
              Math.min(
                values.seva_count ?? 0,
                Number(allotPending) - values.seva_count
              ),
          },
        ]);
      } else {
        setAllottedUsers(
          [...allottedUsers].map((u) =>
            u.id.toString() == selectedUser.u.id.toString()
              ? {
                  ...selectedUser.u,
                  pending_seva:
                    selectedUser.u.pending_seva +
                    Math.min(values.seva_count ?? 0, Number(allotPending)),
                }
              : u
          )
        );
      }
      setShowModal(false);
    } catch (e: any) {
      setAllotLoading(false);
      console.error(e?.response?.data?.error);
    } finally {
      setAllotLoading(false);
    }
  };
  if (!router.query.seva_type) {
    return null;
  }

  const { url, sevaType, countKey, pendingKey } =
    sevaAllot[router.query?.seva_type as string];

  const getHeading = (sevaType?: string) => {
    if (!sevaType) return "";
    if (sevaType == "miss_call") {
      return t("miss.allot") ?? "Miss Calling Allot Seva";
    } else if (sevaType == "duplicate_order") {
      return t("duplicate.allot") ?? "Duplicate Order Allot Seva";
    } else if (sevaType == "incorrect_message") {
      return t("incomplete.allot") ?? "Incomplete Message Calling Allot Seva";
    } else if (sevaType == "s_incomplete_calling") {
      return (
        t("sincomplete.allot") ?? "S-Incomplete Message Calling Allot Seva"
      );
    } else if (sevaType == "namdan_calling") {
      return t("namdan.allot") ?? "Namdan Calling Allot Seva";
    } else if (sevaType == "old_calling") {
      return t("old.allot") ?? "Old Calling Allot Seva";
    } else if (sevaType == "ruchi_calling") {
      return t("ruchi.allot") ?? "Jyada Ruchi Allot Seva";
    } else if (sevaType == "satnam_calling") {
      return t("satnam.allot") ?? "Satnam Calling Allot Seva";
    } else if (sevaType == "complain") {
      return t("miss.allot") ?? "Miss Calling Allot Seva";
    } else if (sevaType == "delivery") {
      return t("miss.allot") ?? "Miss Calling Allot Seva";
    } else if (sevaType == "order") {
      return t("miss.allot") ?? "Miss Calling Allot Seva";
    } else if (sevaType == "book_calling") {
      return t("book.allot") ?? "Book Calling Allot Seva";
    }
    return "";
  };

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: getHeading(router?.query?.seva_type as string),
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
          <>
            <AllotPendingBar
              title={tc("pending_seva")}
              allotPending={allotPending}
              sevaType={sevaType}
              setAllotPending={setAllotpending}
            />
            {users.length > 0 && (
              <>
                <hr className={"border-t-2 border-gray-500"} />
                <div className="p-1 space-y-1 border bg-orange-500 font-bold text-white text-center">
                  {tc("sevadar.alloted_pending_list")}
                </div>
              </>
            )}
          </>
        )}
        {!showButton && (
          <p className={"font-bold text-lg text-center mx-auto"}>
            Allot Timing : 06 AM to 09 AM
          </p>
        )}
        {activeTab == 1 ? (
          <div className="flex flex-col gap-2">
            {history.map((u, i) => (
              <AllotedCard key={i} user={u} />
            ))}
            <div ref={ref}>
              {loading && hasMore && (
                <LoadingSpinner className={"mx-auto w-8 h-8"} />
              )}
            </div>
            {history.length === 0 && !loading && (
              <p style={{ textAlign: "center" }}>
                <b>No History Found</b>
              </p>
            )}
          </div>
        ) : (
          <>
            {users.map((u, i) => (
              <SevaAllotCard
                key={i}
                onAllot={onAllott}
                user={u}
                type="allot"
                showButtons={showButton}
                loading={allotloading}
                disableAllot={+allotPending == 0}
                // disableAllot={allotPending < 30 || onAllotTiming < 6 || onAllotTiming > 8}
              />
            ))}
            {allottedUsers.length > 0 && (
              <>
                <hr className={"border-t-2 border-gray-500"} />
                <div className="p-1 space-y-1 border bg-green-600 font-bold text-white text-center">
                  {tc("sevadar.alloted_list")}
                </div>
              </>
            )}
            {allottedUsers.map((u, i) => (
              <SevaAllotCard
                key={i}
                onAllot={() =>
                  onAllott({
                    u,
                    seva_count: Math.min(30, Number(allotPending)),
                    type: "done",
                  })
                }
                user={u}
                type="allotted"
                showButtons={showButton}
                disableAllot={+allotPending == 0}
              />
            ))}
          </>
        )}
      </div>
      <SevaCountModal
        show={showModal}
        name={selectedUser?.u?.disciple?.name}
        onClose={closeModal}
        initialValues={{ seva_count: Math.min(15, Number(allotPending)) }}
        allotPending={allotPending}
        onConfirm={(values) => handleConfirm(values)}
        isLoading={allotloading}
      />
    </Layout>
  );
};

const AllotPendingBar = ({
  allotPending,
  title,
  sevaType,
  setAllotPending,
}: {
  allotPending: number;
  title: string;
  sevaType?: string;
  setAllotPending: (val: number) => void;
}) => {
  useEffect(() => {
    let url: string = "";
    if (sevaType === "book_calling") {
      url = "book_calling_allot_pending";
    } else if (
      sevaType === "incomplete_message" ||
      sevaType === "s_incomplete_calling"
    ) {
      url = "incomplete_order_allot_pending";
    } else if (sevaType === "miss_call") {
      url = "miss_call_allot_pending";
    } else if (sevaType === "miss_call") {
      url = "miss_call_allot_pending";
    } else if (sevaType === "duplicate_order") {
      url = "duplicate_order_allot_pending";
    } else if (sevaType === "s_incomplete_calling") {
      url = "s_incomplete_call_allot_pending";
    }

    if (url !== "") {
      const getAllotPending = async () => {
        try {
          const { data } = await apiClient.get(url);
          setAllotPending(data?.data?.allot_pending);
        } catch (error) {
          console.error(error);
        }
      };
      getAllotPending();
    }
  }, [sevaType]);

  return (
    <div className="p-1 space-y-1 border bg-red-600 font-bold text-white text-center">
      {title} : {allotPending}
    </div>
  );
};

export default Allot;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "calling",
        "question",
      ])),
    },
  };
};
