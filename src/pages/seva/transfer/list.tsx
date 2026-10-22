import Layout from "@/components/Layout";
import React, { useRef, useState } from "react";
import { Formik, Form } from "formik";
import TextInput from "@/components/input/TextInput";
import { useAppSelector } from "@/redux/store";
import { getOptionArray, objectWithValues } from "@/shared/functions/utils";
import Select from "@/components/input/Select";
import Button from "@/components/Button";
import UserCard from "@/components/card/UserCard";
import useInfiniteQuery from "@/hooks/useInfiniteQuery";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useRouter } from "next/router";
import { Tab } from "@/shared/interfaces/app";

const List = () => {
  const router = useRouter();
  const [tabs, setTabs] = useState<Tab[]>([
    {
      label: "पेंडिंग सेवा",
      page: 1,
      hasNext: true,
      query: "users",
    },
  ]);
  const { active_permission } = useAppSelector((state) => state.auth);
  const allotted_tehsil = active_permission?.region ?? [];
  const tehsilOptions = getOptionArray(
    allotted_tehsil,
    "tehsil_name",
    "tehsil_id"
  );
  const [sevadars, setSevadars] = useState<any[]>([]);
  const loadingRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<any>(null);

  const { loading, fetchData } = useInfiniteQuery(
    tabs,
    setTabs,
    0,
    loadingRef,
    {
      ...objectWithValues(formRef?.current?.values ?? {}),
    },
    (e) => {
      setSevadars(e);
    },
    [],
    false
  );

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: "Transfer Sevadar",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <Formik
          innerRef={formRef}
          initialValues={{
            mobile_no: "",
            tehsil_id: "",
          }}
          onSubmit={async (values) => {
            await fetchData(1, objectWithValues(values));
          }}
        >
          {({ isSubmitting }) => (
            <Form className="pb-4 border-b border-gray-400">
              <TextInput
                appendEle={
                  <p
                    className="absolute bg-gray-200 rounded p-2 px-2 font-semibold text-gray-800 -translate-y-1/2 pointer-events-none top-1/2 left-0"
                    style={{
                      marginLeft: "1px",
                    }}
                  >
                    +91
                  </p>
                }
                className="pl-12"
                name="mobile_no"
                required
                autoFocus
                maxLength={10}
                inputMode="numeric"
                placeholder="Enter mobile number"
              />
              <Select
                options={tehsilOptions}
                label="Tehsil"
                name={"tehsil_id"}
                required
              />
              <Button
                type="submit"
                ref={triggerRef}
                className="mx-auto py-2"
                disabled={loading}
                loading={loading}
              >
                खोजें
              </Button>
            </Form>
          )}
        </Formik>
        <div className="space-y-4">
          {sevadars.map((sevadar, i) => (
            <UserCard
              onClick={() =>
                router.push(`/seva/transfer/profile?userId=${sevadar?.id}`)
              }
              user={sevadar}
            />
          ))}
          <div ref={loadingRef} className="flex w-full justify-center">
            {loading ? (
              <LoadingSpinner className={"mx-auto w-10 h-10"} />
            ) : null}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default List;
