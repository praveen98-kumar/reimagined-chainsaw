import { Form, Formik } from "formik";
import { MobileInputWithSearch } from "@/components/input/MobileInputWithSearch";
import Layout from "@/components/Layout";
import { useGetDisciples } from "@/query-options/queries/get-disciples";
import { useState } from "react";
import { BottomSheet } from "@/components/v2/BottomSheet";
import { PaginatedList } from "@/components/v2/ui/list";
import DiscipleCard from "@/components/card/DiscipleCard";
import type { Disciple } from "@/shared/interfaces/user";
import { useGetAllotRoleUsers } from "@/query-options/queries/get-alloted-users";
import Button from "@/components/Button";
import { ImArrowDown } from "react-icons/im";
import { ImCancelCircle } from "react-icons/im";
import apiClient from "@/http";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";

export default function SevaTransferPage() {
  const router = useRouter();
  const [params, setParams] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [firstDisciple, setFirstDisciple] = useState<Disciple | null>(null);
  const [secondDisciple, setSecondDisciple] = useState<Disciple | null>(null);
  const [isTransfering, setIsTransfering] = useState(false);
  const {
    isLoading,
    data,
    refetch: fetch,
    isFetchingNextPage,
    fetchNextPage,
  } = useGetDisciples(params);
  const {
    isLoading: isUserLoading,
    data: userData,
    refetch: fetchUser,
    isFetchingNextPage: isFetchingNextUserPage,
    fetchNextPage: fetchNextUserPage,
  } = useGetAllotRoleUsers(params);

  const disciples = data?.pages.flatMap((page) => page.data) || [];
  const users = userData?.pages.flatMap((page) => page.data) || [];

  async function handleSevaTransfer() {
    if (!firstDisciple || !secondDisciple) {
      return;
    }
    setIsTransfering(true);
    try {
      const { data } = await apiClient.post("seva_transfer", {
        from_disciple_id: firstDisciple.id,
        to_disciple_id: secondDisciple.id,
      });
      toast.success(data?.message ?? "All seva are transferred successfully");
      router.back();
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error?.response?.data?.error);
      }
      console.error(error);
    } finally {
      setIsTransfering(false);
    }
  }

  function renderItem(item: any) {
    const payloadDisciple = {
      ...item,
      ...item?.disciple,
      tehsil_name: item?.tehsil?.name,
      district_name: item?.district?.name,
    };
    return (
      <DiscipleCard
        disciple={payloadDisciple}
        onClick={() => {
          if (!firstDisciple && secondDisciple?.id !== payloadDisciple.id) {
            setFirstDisciple(payloadDisciple);
            setShowModal(false);
          } else if (
            firstDisciple &&
            firstDisciple?.id !== payloadDisciple.id
          ) {
            setSecondDisciple(payloadDisciple);
            setShowModal(false);
          } else {
            toast.error("Cannot choose same disciple");
          }
        }}
      />
    );
  }

  return (
    <Layout headerProps={{ isBack: true, heading: "Seva Transfer" }}>
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <Formik
          initialValues={{
            mobile_no: "",
          }}
          onSubmit={(values) => {
            if (values.mobile_no.length === 10) {
              const payload = {
                mobile_no: `+91${values.mobile_no}`,
                seva_transfer: 1,
                ...(!firstDisciple && { seva_type: "social_media" }),
              };
              setParams(payload);
              setTimeout(() => {
                if (!firstDisciple) {
                  fetchUser().then((response) => {
                    if (response.status !== "error") {
                      if (response.data?.pages[0].data?.length === 0) {
                        toast.error("User not found.");
                      } else {
                        setShowModal(true);
                      }
                    }
                  });
                } else {
                  fetch().then((res) => {
                    if (
                      res.status !== "error" &&
                      res.data?.pages[0].data?.length > 0
                    ) {
                      setShowModal(true);
                    }
                  });
                }
              }, 50);
            }
          }}
        >
          {({ values, setFieldValue }) => (
            <Form>
              <MobileInputWithSearch
                name="mobile_no"
                value={values.mobile_no}
                isLoading={isLoading || isUserLoading}
                disabled={isLoading || isUserLoading}
                onChange={(e) => {
                  setFieldValue(
                    "mobile_no",
                    String(e.target.value).replace(/[^0-9]/g, ""),
                  );
                }}
              />
            </Form>
          )}
        </Formik>
        {firstDisciple && (
          <div className="relative">
            <p className="text-xl font-semibold">From User</p>
            <button
              type="button"
              className="absolute top-1 right-1"
              onClick={() => setFirstDisciple(null)}
            >
              <ImCancelCircle className="size-5 text-red-400" />
            </button>
            <DiscipleCard disciple={firstDisciple} />
          </div>
        )}
        {firstDisciple && secondDisciple && (
          <ImArrowDown className="size-10 my-4 mx-auto fill-black" />
        )}
        {secondDisciple && (
          <div className="relative">
            <p className="text-xl font-semibold">To Disciple/User</p>
            <button
              type="button"
              className="absolute top-1 right-1"
              onClick={() => setSecondDisciple(null)}
            >
              <ImCancelCircle className="size-5 text-red-400" />
            </button>
            <DiscipleCard disciple={secondDisciple} />
          </div>
        )}
        {firstDisciple && secondDisciple ? (
          <Button
            disabled={isTransfering}
            loading={isTransfering}
            type="button"
            className="mx-auto"
            onClick={handleSevaTransfer}
          >
            Transfer
          </Button>
        ) : null}
      </div>
      <BottomSheet
        title={`Choose ${firstDisciple ? "To Disciple/User" : "From User"} Disciple`}
        open={showModal}
        onClose={() => setShowModal(false)}
      >
        <PaginatedList
          className="p-3"
          items={!firstDisciple ? users : disciples}
          keyExtractor={(item, index) => `${item.id}_${index}`}
          renderItem={(item) => renderItem(item)}
          fetchNextPage={() => {
            if (!firstDisciple) {
              if (users.length > 0 && fetchNextUserPage) {
                fetchNextUserPage();
              }
            } else {
              if (disciples.length > 0 && fetchNextPage) {
                fetchNextPage();
              }
            }
          }}
          isFetchingNextPage={
            !firstDisciple ? isFetchingNextPage : isFetchingNextUserPage
          }
        />
      </BottomSheet>
    </Layout>
  );
}
