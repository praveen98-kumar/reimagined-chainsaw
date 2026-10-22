import apiClient from "@/http/index";
import { capitalizeWords, cn } from "@/shared/functions/utils";
import React, { useState, useEffect, useRef } from "react";
import { Option } from "@/shared/interfaces/option";
import Layout from "@/components/Layout";
import { Form, Formik, FormikProps, FormikValues } from "formik";
import Select from "@/components/input/Select";
import Button from "@/components/Button";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import * as Yup from "yup";
import useLocalstorage from "@/hooks/useLocalstorage";
import UserCard from "@/components/card/UserCard";
import { GetStaticPaths, GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "react-i18next";

const schema = Yup.object({
  group: Yup.string()
    .required("Select Region")
    .test("region", "Select Region", (v) => v != "0"),
  region: Yup.string()
    .required("Select Region")
    .test("region", "Select Region", (v) => v != "0"),
});

const UserPermissionById = () => {
  const router = useRouter();
  const userId = router?.query.userId ?? null;
  const [groups, setGroups] = useState<Option[]>([]);
  const [pageloading, setPageLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [userPermission, setUserPermission] = useState<Array<any>>([]);
  const [roleHeader, setRoleHeader] = useState<any[]>([]);
  const [regions, setRegion] = useState<Option[]>([]);
  const formRef = useRef<FormikProps<FormikValues>>(null);
  const { t } = useTranslation("home");
  const [disciple, ,] = useLocalstorage("selectedDisciple", null);
  const [permissions, setPermission] = useState<
    { id: number; display_name: string; active: boolean }[]
  >([]);
  const getGroups = async () => {
    try {
      const { data } = await apiClient.get("permission_group");
      const temp = data.data.map(({ name }: { name: string }) => ({
        value: name,
        label: capitalizeWords(name.replace(/_/g, " ")),
      }));
      setGroups(temp);
    } catch (error) {
      console.log(error);
    }
  };

  const getRegions = async () => {
    try {
      const { data } = await apiClient.get("roles", {
        params: {
          region_list: 1,
        },
      });
      let temp = [...data.data].map((item, i) => {
        return { label: capitalizeWords(item), value: item };
      });
      setRegion(temp);
    } catch (error) {
      console.log(error);
    }
  };

  const getPermissionsByGroup = async (group: string) => {
    setPageLoading(true);
    try {
      const { data } = await apiClient.get("permission", { params: { group } });
      setPermission(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setPageLoading(false);
    }
  };

  const getData = async () => {
    if (!userId) {
      return;
    }
    try {
      const { data } = await apiClient.get("set_user_role_permission", {
        params: {
          user_id: userId,
        },
      });
      setUserPermission(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const saveUserPermissions = async (payload: any) => {
    if (userId !== null) {
      setLoading(true);
      try {
        const { data } = await apiClient.post("set_user_role_permission", {
          ...payload,
          user_id: userId,
        });
        toast.success(data.message);
      } catch (e: any) {
        toast.error(e.response.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleCheckbox = (permission_id: number, role_id: number) => {
    let temp = roleHeader.find((t) => t.role_id == role_id);
    const isChecked = temp.permissions.includes(permission_id);
    if (isChecked) {
      const index = temp.permissions.findIndex((i: any) => i == permission_id);
      temp.permissions.splice(index, 1);
    } else {
      temp.permissions = [...temp.permissions, permission_id];
    }
    setRoleHeader([
      ...roleHeader.map((i) => (i.role_id == role_id ? temp : i)),
    ]);
    setUserPermission([
      ...userPermission.map((i) => (i.role_id == role_id ? temp : i)),
    ]);
  };

  useEffect(() => {
    getGroups();
    getData();
    getRegions();
  }, []);

  const tableDataClass = (i: number, active: boolean) =>
    `sticky left-0 border-r border-blue-300 ${
      !active ? "bg-red-400" : i % 2 == 0 ? "bg-blue-200" : "bg-white"
    }`;
  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: t("seva.title.user_permission") ?? "Sevadar Permission",
      }}
    >
      <div className="space-y-4 p-4">
        <UserCard user={disciple} />
        <Formik
          innerRef={formRef}
          initialValues={{ group: "", region: "0" }}
          onSubmit={(v) => {
            if (roleHeader.length > 0) {
              const rolePermissions = userPermission.reduce((a, p) => {
                const curr = { role_id: p.role_id, permissions: p.permissions };
                return [...a, curr];
              }, []);
              saveUserPermissions({ role_permissions: rolePermissions });
            }
          }}
          validationSchema={schema}
        >
          {({ values, setFieldValue }) => (
            <Form className="z-30">
              <Select
                name="group"
                label="Group"
                required
                value={groups.find((g) => g.value == values.group) ?? null}
                options={groups}
                onChange={(opt: any) => {
                  setFieldValue("group", opt.value);
                  getPermissionsByGroup(opt.value);
                }}
              />
              <Select
                name="region"
                label="Region"
                required
                placeholder="Select Region"
                options={regions}
                onChange={(opt: any) => {
                  setFieldValue("region", opt.value);
                  const temp = userPermission
                    .filter((u) => u.region === opt.value)
                    .map((t) => ({
                      ...t,
                      role_name: capitalizeWords(
                        t.role_name.replace(/_/g, " ")
                      ),
                    }));
                  setRoleHeader(temp);
                }}
              />
            </Form>
          )}
        </Formik>

        {formRef.current?.values?.group != 0 && (
          <div className="w-full max-h-screen overflow-x-scroll">
            <table className="w-full">
              <thead
                style={{ zIndex: 1 }}
                className="w-full sticky top-0 bg-black text-white font-semibold text-md p-2"
              >
                <tr className="w-full">
                  <th className="flex-1 px-2 sticky left-0 bg-black">
                    Permissions
                  </th>
                  {roleHeader.map((item, i) => (
                    <th className="flex-1 px-2" key={i}>
                      {item.role_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissions.map((p, i) => (
                  <tr key={p.id + "-" + i} className="even:bg-blue-100">
                    <td
                      className={cn(
                        "sticky left-0 border-r-2 border-blue-300 ",
                        {
                          "bg-blue-200": i % 2 != 0,
                          "bg-white": i % 2 == 0,
                        }
                      )}
                    >
                      <span>{p.display_name}</span>
                    </td>
                    {roleHeader.map((item, j) => (
                      <td className="text-center" key={j}>
                        <input
                          type="checkbox"
                          className="rounded"
                          value={p.id}
                          name={`${i}=${p.id}-${item.role_id}-${j}`}
                          checked={item.permissions.includes(p.id)}
                          onChange={(e) => {
                            toggleCheckbox(Number(p.id), item.role_id);
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Button
          type="submit"
          loading={loading}
          disabled={loading}
          onClick={() => formRef.current?.handleSubmit()}
          className="bg-green-400 mx-auto py-2"
        >
          Save Permissions
        </Button>
      </div>
      {pageloading && (
        <div className="absolute flex items-center justify-center w-full inset-0 bg-gray-900/40 z-40">
          <LoadingSpinner className="w-16 h-16 fill-blue-50 " />
        </div>
      )}
    </Layout>
  );
};

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: "blocking", //indicates the type of fallback
  };
};

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "home"])),
    },
  };
};

export default UserPermissionById;
