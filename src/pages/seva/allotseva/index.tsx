import DiscipleCard from "@/components/card/DiscipleCard";
import TextInput from "@/components/input/TextInput";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import apiClient from "@/http/index";
import { useAppSelector } from "@/redux/store";
import { getInitialValues, objectWithValues } from "@/shared/functions/utils";
import { Form, Formik, FormikProps, FormikValues } from "formik";
import useLocalstorage from "@/hooks/useLocalstorage";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FaSearch } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import * as Yup from "yup";
import { Disciple } from "@/shared/interfaces/user";
import Radio from "@/components/input/Radio";

const schema = Yup.object().shape({
  mobile_no: Yup.string()
    .length(10, "Mobile number is not valid.")
    .required("Mobile number is required"),
  sevadar_status: Yup.string().required("Sevadar status is required"),
});

const AllotSeva = () => {
  const { t: tc } = useTranslation("common");
  const router = useRouter();
  const [sevaType, setSevaType] = useLocalstorage("sevaType");
  const [, setRoleType] = useLocalstorage("roleType");
  const { active_permission, active_region_index } = useAppSelector(
    (state) => state.auth,
  );
  const [_, selectDisciple] = useLocalstorage("selectedDisciple", null);
  const loadingRef = useRef<HTMLDivElement>(null);

  const [disciples, setDisciples] = useState<any[]>([]);
  const formRef = useRef<FormikProps<FormikValues>>(null);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  // near other refs
  const initialFetchDoneRef = useRef(false);
  const fetchUsers = useCallback(
    async (page: number, valueOverrides?: Record<string, unknown>) => {
      const formValues = objectWithValues({
        ...(formRef?.current?.values ?? {}),
        ...valueOverrides,
      });
      // Prepend +91 to mobile_no if it exists and is 10 digits
      if (formValues?.mobile_no && formValues?.mobile_no.length === 10) {
        formValues.mobile_no = `+91${formValues.mobile_no}`;
      }
      const params = {
        ...{ seva_type: sevaType },
        ...getInitialValues(active_permission, active_region_index),
        ...formValues,
        ...(active_permission?.role === "social_media_district_sevadar" &&
        !formValues?.mobile_no
          ? { from_seva_app: 1 }
          : {}),
      };
      if (!loading) {
        setLoading(true);
        try {
          const { data } = await apiClient.get(
            params?.sevadar_status == "added" && !formValues?.mobile_no
              ? "allot_roles_users"
              : "disciples",
            {
              params: {
                ...params,
                page,
              },
            },
          );
          const temphasMore = data.data.total > 10 * page;
          const resData = params?.from_seva_app
            ? data.data.result
            : (data.data.result as Disciple[]).filter(
                ({ created_at, ...rest }) => rest,
              );
          setDisciples((pre) => (page == 1 ? resData : [...pre, ...resData]));
          setPage((p) => (page == 1 ? 2 : p + 1));
          setHasMore(temphasMore);
        } catch (error: any) {
          if (error.response.status == 404) {
            setDisciples([]);
            setHasMore(false);
          }
          toast.error(error?.response?.data?.error);
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    },
    [disciples, loading, sevaType],
  );

  const onDiscipleCardClick = (disciple: any) => {
    const discipleDistrict =
      disciple?.disciple?.district?.id ?? disciple?.district_id;
    const discipleId = disciple?.disciple?.district?.id
      ? disciple?.disciple_id
      : disciple?.id;
    selectDisciple(disciple);
    if (sevaType === "pradarshani_seva") {
      router.push(`/pradarshani_seva/allot?discipleId=${discipleId}`);
      return;
    }
    if (
      active_permission?.role_region == "district" &&
      active_permission?.region[active_region_index].district_id !==
        discipleDistrict
    ) {
      return toast.error("Sevadar belongs to another district.");
    }
    router.push(`/users/${discipleId}`);
  };

  useEffect(() => {
    if (router.query) {
      setSevaType(router.query.type as string);
      setRoleType(router.query.role as string);
    }
  }, [router.isReady]);

  useEffect(() => {
    if (
      active_permission?.role === "social_media_district_sevadar" &&
      page === 1 &&
      !initialFetchDoneRef.current
    ) {
      initialFetchDoneRef.current = true;
      fetchUsers(1);
    }
  }, [active_permission, page, fetchUsers]);

  useEffect(() => {
    if (!loadingRef.current || !hasMore || loading) {
      return;
    }
    const observer = new IntersectionObserver(
      (e) => {
        if (e[0].isIntersecting) {
          // Only load when we are past page 1 to avoid duplicate initial call
          if (page === 1) return;
          fetchUsers(page);
        }
      },
      { threshold: 1.0 },
    );
    observer.observe(loadingRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loading, fetchUsers, active_permission?.role, page]);

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: tc("add_remove") || "",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <Formik
          innerRef={formRef}
          validationSchema={schema}
          initialValues={{
            mobile_no: "",
            country_id: 0,
            state_id: 0,
            district_id: 0,
            tehsil_id: 0,
            role: 0,
            sevadar_status: "not_added",
          }}
          onSubmit={(values) => {
            const payload: any = objectWithValues(values);
            if (payload.mobile_no) {
              payload["mobile_no"] = `+91${values.mobile_no}`;
            }
            fetchUsers(1);
          }}
        >
          {({ values, setFieldValue }) => (
            <Form className="pb-4">
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
                disabled={loading}
                className="pl-12 pr-1 py-1"
                name="mobile_no"
                label={tc("mobile_no") ?? "Mobile No."}
                prependEle={
                  <div className="flex absolute space-x-1 items-center -translate-y-1/2 top-1/2 right-0 gap-2">
                    {values.mobile_no.length > 0 && (
                      <MdClose
                        onClick={() => setFieldValue("mobile_no", "")}
                        className="w-5 h-5 text-gray-500 cursor-pointer"
                      />
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="p-2 rounded-md bg-black flex items-center gap-1 disabled:opacity-80"
                    >
                      {loading ? (
                        <LoadingSpinner className="w-5 h-5 fill-white" />
                      ) : (
                        <FaSearch className="w-5 h-5 text-white" />
                      )}
                    </button>
                  </div>
                }
                type={"tel"}
                maxLength={10}
              />
              <Radio
                required
                name="sevadar_status"
                label="Search Type:"
                options={[
                  { label: "Not Added", value: "not_added" },
                  { label: "Added", value: "added" },
                ]}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setFieldValue("sevadar_status", newValue);
                  fetchUsers(1, { sevadar_status: newValue });
                }}
              />
            </Form>
          )}
        </Formik>

        <div className="space-y-4">
          {disciples.map((u, i) => (
            <DiscipleCard
              disciple={{
                ...u,
                ...u?.disciple,
                tehsil_name: u?.tehsil?.name,
                district_name: u?.district?.name,
              }}
              key={`${u.id}_${i}`}
              onClick={() => onDiscipleCardClick(u)}
            />
          ))}
        </div>
        <div ref={loadingRef}>
          {loading && hasMore && (
            <LoadingSpinner className={"mx-auto w-8 h-8"} />
          )}
        </div>
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

export default AllotSeva;
