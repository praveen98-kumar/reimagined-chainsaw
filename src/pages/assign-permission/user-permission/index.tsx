import Button from "@/components/Button";
import UserCard from "@/components/card/UserCard";
import TextInput from "@/components/input/TextInput";
import Layout from "@/components/Layout";
import apiClient from "@/http/index";
import { Form, Formik, FormikValues } from "formik";
import useLocalstorage from "@/hooks/useLocalstorage";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MdClose, MdOutlinePhoneIphone } from "react-icons/md";

const UserPermission = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<Array<any>>([]);
  const { t: tc } = useTranslation("common");
  const { t } = useTranslation("home");

  const [, setDisciple] = useLocalstorage("selectedDisciple", null);

  const getUsersList = async (payload: FormikValues) => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("users", {
        params: payload,
      });
      setUsers(data.data.result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: t("seva.title.user_permission") ?? "Sevadar Permission",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <Formik initialValues={{ mobile_no: "" }} onSubmit={getUsersList}>
          {({ setFieldValue, values }) => (
            <Form className="pb-2" style={{ borderBottom: "1px solid #ddd" }}>
              <label className="flex items-center text-gray-500 gap-2 mb-2">
                {tc("mobile_no")}
              </label>
              <div className="flex w-full">
                <TextInput
                  fieldClass="flex-1"
                  className="flex-1 py-2 m-0 rounded-r-none pl-12"
                  placeholder="Type mobile number"
                  prependEle={
                    <div className="flex absolute space-x-1 items-center -translate-y-1/2 top-1/2 right-4">
                      {values.mobile_no.length > 0 && (
                        <MdClose
                          onClick={() => setFieldValue("mobile", "")}
                          className="w-5 h-5 text-gray-500 cursor-pointer"
                        />
                      )}
                      <MdOutlinePhoneIphone className="w-6 h-6 text-gray-500 pointer-events-none" />
                    </div>
                  }
                  name="mobile_no"
                  autoFocus
                  required
                  maxLength={10}
                  pattern="[6789][0-9]{9}"
                  inputMode="numeric"
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
                />
                <Button
                  className="py-3 rounded-l-none"
                  style={{ maxHeight: "42px" }}
                  type="submit"
                  loading={loading}
                  disabled={loading}
                >
                  {tc("search")}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
        <div>
          {users.map((u) => (
            <Link
              href={`/assign-permission/user-permission/${u.id}`}
              key={u.id}
              onClick={() => setDisciple(u)}
            >
              <UserCard user={{ ...u, ...u.disciple }} />
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "home"])),
    },
  };
};

export default UserPermission;
