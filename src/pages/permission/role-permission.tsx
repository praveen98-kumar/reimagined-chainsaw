import Button from "@/components/Button";
import Select from "@/components/input/Select";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import apiClient from "@/http/index";
import { capitalizeWords, getOptionArray } from "@/shared/functions/utils";
import { Option } from "@/shared/interfaces/option";
import { Form, Formik, FormikProps, FormikValues } from "formik";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";

const schema = Yup.object({
  group: Yup.string()
    .required("Select Region")
    .test("region", "Select Region", (v) => v != "0"),
  region: Yup.string()
    .required("Select Region")
    .test("region", "Select Region", (v) => v != "0"),
});
const RolePermissionn = () => {
  const [regions, setRegion] = useState<Option[]>([]);
  const [groups, setGroups] = useState<Option[]>([]);
  const [roleHeader, setRoleHeader] = useState<any[]>([]);
  const formRef = useRef<FormikProps<FormikValues>>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { t } = useTranslation("home");
  const [pageloading, setPageLoading] = useState<boolean>(false);
  const [permissions, setPermission] = useState<
    { id: number; display_name: string; active: boolean }[]
  >([]);

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

  const getRegionWiseRoles = async (region: string) => {
    setPageLoading(true);
    try {
      const { data } = await apiClient.get("roles", { params: { region } });
      let temp: any[] = [];
      const len: number = data.data.length;
      for (let index = 0; index < len; index++) {
        const permission = await getRoleWisePermission(data.data[index].id);
        temp.push({
          ...data.data[index],
          name: capitalizeWords(data.data[index].name.replace(/_/g, " ")),
          permission,
        });
      }
      setRoleHeader(temp);
    } catch (error) {
      console.log(error);
    } finally {
      setPageLoading(false);
    }
  };

  const getRoleWisePermission = async (role_id: number) => {
    if (role_id != 0) {
      try {
        const { data } = await apiClient.get("role_permission", {
          params: { role_id },
        });
        return data.data.map((item: any) => item.permission_id) as any[];
      } catch (e) {
        console.log(e);
        return [];
      }
    }
    return [];
  };

  const saveRolePermissions = async (payload: any) => {
    setLoading(true);
    try {
      const { data } = await apiClient.post("roles_permissions", payload);
      toast.success(data.message);
    } catch (e: any) {
      toast.error(e.response.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleCheckbox = (permission_id: number, role_id: number) => {
    let temp = roleHeader.find((t) => t.id == role_id);
    const isChecked = temp.permission.includes(permission_id);
    if (isChecked) {
      const index = temp.permission.findIndex((i: any) => i == permission_id);
      temp.permission.splice(index, 1);
    } else {
      temp.permission = [...temp.permission, permission_id];
    }
    setRoleHeader([...roleHeader.map((i) => (i.id == role_id ? temp : i))]);
  };

  useEffect(() => {
    getGroups();
    getRegions();
  }, []);

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: t("seva.title.role_permission") ?? "Role Wise Permission",
      }}
    >
      <div className="space-y-4 p-4">
        <Formik
          innerRef={formRef}
          initialValues={{ group: "", region: "0" }}
          onSubmit={async (_, { resetForm }) => {
            if (roleHeader.length > 0) {
              const data = roleHeader.reduce((a, p) => {
                if (p.permission.length == 0) {
                  return { ...a };
                } else {
                  return { ...a, [p.id]: p.permission };
                }
              }, {});
              await saveRolePermissions({ data });
              resetForm();
            }
          }}
          validationSchema={schema}
        >
          {({ setFieldValue, values }) => (
            <Form className="z-30">
              <Select
                name="group"
                label="Group"
                required
                placeholder="Select Permission Group"
                value={groups.find((g) => g.value == values.group) ?? null}
                options={groups}
                onChange={(opt: any) => {
                  setFieldValue("group", opt.value);
                  opt != null
                    ? getPermissionsByGroup(opt.value.toString())
                    : {};
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
                  opt != null
                    ? getRegionWiseRoles(opt.value)
                    : setRoleHeader([]);
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
                      {item.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissions.map((p, i) => (
                  <tr
                    className="border-b border-blue-300 odd:bg-blue-100 even:bg-gray-100/50 p-1"
                    key={i}
                  >
                    <td
                      className={`sticky left-0 border-r border-blue-300 ${
                        i % 2 == 0 ? "bg-blue-200" : "bg-white"
                      }`}
                    >
                      {p.display_name}
                    </td>
                    {roleHeader.map((k, j) => (
                      <td className="text-center" key={j}>
                        <input
                          className="rounded"
                          type={"checkbox"}
                          checked={k.permission.includes(p.id)}
                          value={p.id}
                          name={`${i}=${p.id}-${k.id}-${j}`}
                          onChange={(e) => {
                            toggleCheckbox(Number(e.target.value), k.id);
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

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "home"])),
    },
  };
};

export default RolePermissionn;
