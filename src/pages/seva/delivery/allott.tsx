import Button from "@/components/Button";
import UserAllotCard from "@/components/card/userAllotCard";
import TextInput from "@/components/input/TextInput";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import Modal from "@/components/modal/Modal";
import UserwiseDropdown from "@/components/UserwiseDropdown";
import apiClient from "@/http/index";
import { useAppSelector } from "@/redux/store";
import { getInitialValues, objectWithValues } from "@/shared/functions/utils";
import { NextApplicationPage } from "@/shared/interfaces/app";
import { User } from "@/shared/interfaces/user";
import { Form, Formik } from "formik";
import useLocalstorage from "@/hooks/useLocalstorage";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaMobileAlt, FaQuestionCircle } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { useInView } from "react-intersection-observer";

const Allot: NextApplicationPage = () => {
  const formRef = useRef<any>(null);
  const [sevatype] = useLocalstorage("sevaType", "");
  const { active_permission, active_region_index } = useAppSelector(
    (state) => state.auth
  );
  const [selectedOrders, , remove] =
    useLocalstorage<Array<any>>("selectedOrders");
  const [users, setUsers] = useState<User[]>([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [sevadar, setSevadar] = useState<User | null>(null);
  const router = useRouter();
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const params = {
    seva_type: sevatype,
    ...getInitialValues(active_permission, active_region_index),
    ...objectWithValues(formRef?.current?.values ?? {}),
  };
  const onAllott = async (userId: number) => {
    try {
      const data = {
        user_id: userId,
        orders: selectedOrders,
      };
      const response = await apiClient.post("order_allote", data);
      toast.success(response.data?.message);
      remove();
      router.back();
    } catch (e: any) {
      toast.error(e?.response.data.error);
    }
  };

  const fetchUser = async (
    page: number,
    params: Record<string, string | number | boolean>
  ) => {
    if (!loading) {
      try {
        const { data } = await apiClient.get("users", {
          params: {
            ...params,
            page,
          },
        });
        const temphasMore = data.data.total > 10 * page;
        setHasMore(temphasMore);
        setUsers((pre) =>
          page == 1 ? data.data.result : [...pre, ...data.data.result]
        );
        setPage((p) => (page == 1 ? 2 : p + 1));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && page > 1 && hasMore) {
      fetchUser(page, params);
    }
  }, [fetchUser, inView, params, hasMore]);

  return (
    <Layout headerProps={{ isBack: true, heading: "Select Sevadar" }}>
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <h3 className="font-bold text-lg">
          <span>Allott {selectedOrders.length}</span>
          <span>{selectedOrders.length > 1 ? "orders" : "order"} to...</span>
        </h3>
        <Formik
          innerRef={formRef}
          initialValues={{
            mobile_no: "",
            country_id: 0,
            state_id: 0,
            district_id: 0,
            tehsil_id: 0,
          }}
          onSubmit={(values) => {
            const formValue = objectWithValues(values);
            fetchUser(1, { ...params, ...formValue });
          }}
        >
          {({ values, setFieldValue }) => (
            <Form>
              <TextInput
                appendEle={
                  <p
                    style={{
                      marginLeft: "1px",
                    }}
                    className="absolute bg-gray-200 rounded p-2 font-semibold text-gray-800 -translate-y-1/2 pointer-events-none top-1/2 left-0"
                  >
                    +91
                  </p>
                }
                className="pl-12"
                name="mobile_no"
                placeholder="Type mobile number"
                label="Mobile No.:"
                prependEle={
                  <div className="flex absolute space-x-1 items-center -translate-y-1/2 top-1/2 right-4">
                    {values.mobile_no.length > 0 && (
                      <MdClose
                        onClick={() => setFieldValue("mobile_no", "")}
                        className="w-5 h-5 text-gray-500 cursor-pointer"
                      />
                    )}
                    <FaMobileAlt className="w-6 h-6 text-gray-500 pointer-events-none" />
                  </div>
                }
              />
              <UserwiseDropdown />
              <Button type="submit" className="mx-auto w-1/2">
                खोजें
              </Button>
            </Form>
          )}
        </Formik>
        <div className="flex flex-col gap-2">
          {users.map((u, i) => (
            <UserAllotCard
              key={i}
              onAllot={() => {
                setSevadar(u);
                setShowConfirmationModal(true);
              }}
              user={u}
              type="allot"
            />
          ))}
          <div ref={ref}>
            {loading && hasMore && (
              <LoadingSpinner className={"mx-auto w-8 h-8"} />
            )}
          </div>
        </div>
      </div>
      <Modal
        show={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={() => (sevadar?.id ? onAllott(sevadar?.id) : {})}
      >
        <div className="space-y-8 mb-8">
          <FaQuestionCircle className=" mx-auto w-20 h-20 text-primary" />
          <p className="font-normal text-xl text-center">
            <span>Are you sure to allot {selectedOrders.length}</span>
            <span>{selectedOrders.length > 1 ? " orders" : " order"} to </span>
            <span className="font-semibold">
              {sevadar?.disciple?.name ?? ""}
            </span>
            ?
          </p>
        </div>
      </Modal>
    </Layout>
  );
};

Allot.requireAuth = true;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "home"])),
    },
  };
};

export default Allot;
