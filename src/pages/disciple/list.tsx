import TextInput from "@/components/input/TextInput";
import type { GetStaticProps } from "next";
import Button from "@/components/Button";
import { MdClose } from "react-icons/md";
import { FaMobileAlt } from "react-icons/fa";
import { Form, Formik } from "formik";
import DiscipleCard from "@/components/card/DiscipleCard";
import { PaginatedList } from "@/components/v2/ui/list";
import { useGetDisciples } from "@/query-options/queries/get-disciples";
import { useAppSelector } from "@/redux/store";
import {
  getInitialValues,
  isValidUser,
  objectWithValues,
} from "@/shared/functions/utils";
import { useState } from "react";
import Layout from "@/components/Layout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import * as Yup from "yup";
import { useRouter } from "next/router";
import useLocalstorage from "@/hooks/useLocalstorage";

const schema = Yup.object({
  mobile_no: Yup.string().length(10, "Invalid Mobile Number"),
});
const Filters = ({
  setFilters,
  loading = false,
  onSearch,
}: {
  loading: boolean;
  setFilters: (data: Record<string, unknown>) => void;
  onSearch: () => void;
}) => {
  const { active_permission, active_region_index } = useAppSelector(
    (state) => state.auth,
  );
  return (
    <Formik
      initialValues={{
        mobile_no: "",
        country_id: 0,
        state_id: 0,
        district_id: 0,
        tehsil_id: 0,
        edit_sevadar: 1,
      }}
      validationSchema={schema}
      onSubmit={async ({ mobile_no, ...values }) => {
        const payload = objectWithValues({
          ...values,
          ...{ edit_sevadar: 1 },
          ...(mobile_no && { mobile_no: `+91${mobile_no}` }),
        });
        setFilters(
          Object.keys(payload).length
            ? payload
            : getInitialValues(active_permission, active_region_index),
        );
        setTimeout(() => {
          onSearch();
        }, 50);
      }}
    >
      {({ values, setFieldValue }) => (
        <Form>
          <TextInput
            appendEle={
              <div
                style={{
                  marginLeft: "1px",
                }}
                className="absolute bg-gray-200 rounded p-2 font-semibold text-gray-800 -translate-y-1/2 pointer-events-none top-1/2 left-0"
              >
                +91
              </div>
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
          {/*<UserwiseDropdown />*/}
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
            className="mx-auto w-1/2"
          >
            Search
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default function ListDisciples() {
  const [filters, setFilters] = useState({});
  const router = useRouter();
  const {
    isLoading,
    data,
    refetch: fetch,
    isFetchingNextPage,
    fetchNextPage,
  } = useGetDisciples(filters);

  const [, setDisciple] = useLocalstorage("selectedDisciple", null);
  const disciples = data?.pages.flatMap((page) => page.data) || [];

  const canEdit = isValidUser("edit_disciple");

  const handleClick = (disciple: any) => {
    if (canEdit) {
      setDisciple(disciple);
      router.push(`/disciple/${disciple?.id}`);
    }
  };

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: "Search Disciple",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <Filters loading={isLoading} setFilters={setFilters} onSearch={fetch} />
        <PaginatedList
          items={disciples}
          keyExtractor={(item, index) => `${item.id}_${index}`}
          renderItem={(item) => (
            <DiscipleCard disciple={item} onClick={() => handleClick(item)} />
          )}
          fetchNextPage={() => {
            if (disciples.length > 0 && fetchNextPage) {
              fetchNextPage();
            }
          }}
          isFetchingNextPage={isFetchingNextPage}
        />
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};
