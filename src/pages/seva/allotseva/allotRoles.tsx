import Button from "@/components/Button";
import ButtonTabs from "@/components/ButtonTabs";
import UserCard from "@/components/card/UserCard";
import TextInput from "@/components/input/TextInput";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import UserwiseDropdown from "@/components/UserwiseDropdown";
import apiClient from "@/http/index";
import { objectWithValues } from "@/shared/functions/utils";
import { Form, Formik, FormikProps, FormikValues } from "formik";
import { useRouter } from "next/router";
import { useState, useRef, useCallback, useEffect } from "react";
import { FaMobileAlt } from "react-icons/fa";
import * as Yup from "yup";
import useLocalstorage from "../../../hooks/useLocalstorage";
import { MdClose } from "react-icons/md";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { useAppSelector } from "@/redux/store";
import DiscipleCard from "@/components/card/DiscipleCard";

interface Tab {
  label: string;
  page: number;
  query: string;
  hasNext: boolean;
}

const schema = Yup.object({
  mobile_no: Yup.string().length(10, "Invalid Mobile Number"),
});

const AllotRoles = () => {
  const router = useRouter();
  const [, setDisciple] = useLocalstorage("selectedDisciple", null);

  const [tabs, setTabs] = useState<Tab[]>([
    {
      label: "Allot Roles",
      page: 1,
      query: "disciples",
      hasNext: true,
    },
    {
      label: "Allotted Roles",
      page: 1,
      query: "allot_roles_users",
      hasNext: true,
    },
  ]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const { t } = useTranslation("common");
  const [loading, setLoading] = useState<boolean>(false);
  const formRef = useRef<FormikProps<FormikValues>>(null);
  const [disciples, setDisciples] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const fetchData = useCallback(
    async (
      page_no: number = page,
      params: Record<string, string | number | boolean>
    ) => {
      if (!loading) {
        setLoading(true);
        try {
          let formValues = objectWithValues(formRef?.current?.values ?? {});
          if (formValues.hasOwnProperty("mobile_no")) {
            formValues["mobile_no"] = `+91` + formValues["mobile_no"];
          }
          if (currentUser?.mobile_no === "+918625816602" && params?.state_id) {
            const { state_id, ...rest } = params;
            params = rest;
          }
          if (
            currentUser?.mobile_no === "+918625816602" &&
            formValues?.state_id
          ) {
            const { state_id, ...rest } = formValues;
            formValues = rest;
          }
          const { data } = await apiClient.get(tabs[activeIndex].query, {
            params: {
              page: page_no,
              ...formValues,
              ...(params && params),
            },
          });
          const temphasMore = data.data.total > 10 * page_no;
          setPage(page + 1);
          setHasMore(temphasMore);
          if (activeIndex == 0) {
            setDisciples((prev) =>
              page_no == 1 ? data.data.result : [...prev, ...data.data.result]
            );
          } else {
            setUsers((prev) =>
              page_no == 1 ? data.data.result : [...prev, ...data.data.result]
            );
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    },
    [activeIndex, loading]
  );
  const onTabClick = useCallback(
    (index: number) => {
      let previousIndex = activeIndex;
      let lastpage = page;
      let currPage = tabs[index].page;
      const temp = [...tabs].map((t, i) =>
        i == previousIndex ? { ...t, page: lastpage } : t
      );
      setPage(currPage);
      setTabs(temp);
      setActiveIndex(index);
    },
    [page, activeIndex]
  );

  const onDiscipleCardClick = (disciple: any, id: number, userId?: number) => {
    setDisciple(disciple);
    const nextUrl = `/seva/allotseva/allotRoleProfile?profileId=${id}${
      userId ? `&userId=${userId}` : ""
    }`;
    router.push(nextUrl);
  };

  const { ref, inView } = useInView();
  const { ref: ref2, inView: inView2 } = useInView();

  useEffect(() => {
    if (inView && page > 1 && hasMore) {
      fetchData(page, {});
    }
  }, [fetchData, inView, hasMore]);
  useEffect(() => {
    if (inView2 && page > 1 && hasMore) {
      fetchData(page, {});
    }
  }, [fetchData, inView2, hasMore]);

  return (
    <Layout headerProps={{ isBack: true, heading: "Allott Roles" }}>
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <ButtonTabs
          handleClick={() => {}}
          items={[...tabs].map((t, i) => ({
            active: i == activeIndex,
            label: t.label,
            handleClick: () => onTabClick(i),
            disabled: loading,
          }))}
        />
        <Formik
          innerRef={formRef}
          initialValues={{
            mobile_no: "",
            country_id: 0,
            state_id: 0,
            district_id: 0,
            tehsil_id: 0,
          }}
          onSubmit={async ({ mobile_no, ...values }) => {
            let data = objectWithValues({
              ...values,
              ...(mobile_no && { mobile_no: `+91${mobile_no}` }),
              no_role: activeIndex == 0 ? 1 : 0,
            });
            await fetchData(1, data);
          }}
          validationSchema={schema}
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
              <UserwiseDropdown />
              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                className="mx-auto w-1/2"
              >
                {t("search")}
              </Button>
            </Form>
          )}
        </Formik>
        {activeIndex == 0 ? (
          <div className="flex flex-col gap-2">
            {disciples.map((u) => (
              <DiscipleCard
                disciple={u}
                key={u.id}
                onClick={() => onDiscipleCardClick(u, u.id)}
              />
            ))}
            <div ref={ref}>
              {loading && hasMore && (
                <LoadingSpinner className={"mx-auto w-8 h-8"} />
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {users.map((u) => (
              <DiscipleCard
                disciple={{ ...u, ...u.disciple }}
                key={u.id}
                onClick={() => onDiscipleCardClick(u, u.disciple_id, u.id)}
              />
            ))}
            <div ref={ref2}>
              {loading && hasMore && (
                <LoadingSpinner className={"mx-auto w-8 h-8"} />
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};
export default AllotRoles;
