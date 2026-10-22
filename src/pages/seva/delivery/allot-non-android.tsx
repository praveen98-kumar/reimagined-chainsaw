import Button from "@/components/Button";
import UserAllotCard from "@/components/card/userAllotCard";
import TextInput from "@/components/input/TextInput";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import UserwiseDropdown from "@/components/UserwiseDropdown";
import apiClient from "@/http/index";
import { objectWithValues } from "@/shared/functions/utils";
import { User } from "@/shared/interfaces/user";
import { Form, Formik } from "formik";
import useLocalstorage from "@/hooks/useLocalstorage";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaMobileAlt } from "react-icons/fa";
import { useInView } from "react-intersection-observer";
import { MdClose } from "react-icons/md";
import { NextApplicationPage } from "@/shared/interfaces/app";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const Allot: NextApplicationPage = () => {
  const router = useRouter();
  const formRef = useRef<any>(null);
  const [selectedOrders, , remove] =
    useLocalstorage<Array<any>>("selectedOrders");
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const params = {
    non_android: 1,
    ...objectWithValues(formRef?.current?.values ?? {}),
  };

  const fetchUser = async (
    page: number,
    params: Record<string, string | number | boolean>,
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
          page == 1 ? data.data.result : [...pre, ...data.data.result],
        );
        setPage((p) => (page == 1 ? 2 : p + 1));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const onAllott = async (userId: number, _: string) => {
    try {
      // Copying message to clipboard, Assuming only single order is allotted at a time.
      navigator.clipboard.writeText(selectedOrders[0].message);
      const data = {
        user_id: userId,
        orders: selectedOrders,
        non_android: 1,
      };
      const response = await apiClient.post("order_allote", data);
      toast.success(`${response.data?.message}`);
      remove();
      // setTimeout(() => {
      //   window.open(`sms://${userMob}`, "_blank", "noopener noreferrer");
      // }, 1000);
      router.back();
    } catch (e: any) {
      toast.error(e?.response.data.error);
    }
  };
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && page > 0 && hasMore) {
      fetchUser(page, params);
    }
  }, [fetchUser, inView, params, hasMore]);

  return (
    <Layout headerProps={{ isBack: true, heading: "Select Sevadar" }}>
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <h3 className="font-bold text-lg">
          <span>Allott {selectedOrders.length}</span>
          <span>{selectedOrders.length > 1 ? " orders" : " order"} to...</span>
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
                onAllott(u?.id, u?.mobile_no);
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
