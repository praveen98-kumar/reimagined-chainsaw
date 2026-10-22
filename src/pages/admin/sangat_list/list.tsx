import apiClient from "@/http/index";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/Button";
import Layout from "@/components/Layout";
import { Formik, Form, FormikProps, FormikValues } from "formik";
import { FiPhoneCall } from "react-icons/fi";
import { IoLogoWhatsapp } from "react-icons/io";
import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import UserwiseDropdown from "@/components/UserwiseDropdown";
import { useTranslation } from "react-i18next";
import { getOptionArray, objectWithValues } from "@/shared/functions/utils";
import DateFilter from "@/components/DateFilter";
import Select from "@/components/input/Select";
import { removeSymbols } from "@/components/card/CommonCard";
import dayjs from "dayjs";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAppSelector } from "@/redux/store";
import { Option } from "@/shared/interfaces/option";

const entriesList = [
  { label: "Pratham naam", value: "pratham_naam" },
  { label: "Pratham naam since 1 year", value: "pratham_naam_s1y" },
  { label: "Satnaam", value: "satnam" },
  { label: "Sarnaam", value: "sarnam" },
  { label: "Sarshabd", value: "sarshabd" },
  { label: "Shuddhikaran", value: "shuddhikaran" },
];

const SangatList = () => {
  const [entries, setEntries] = useState<Array<any>>([]);
  const { t: tc } = useTranslation("common");
  const [page, setPage] = useState(2);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [centerList, setCenterList] = useState<Option[]>([]);
  const { active_permission, active_region_index } = useAppSelector(
    (state) => state.auth
  );

  const activeRoleRegion = active_permission?.role_region;

  const activeId = (s: any = activeRoleRegion) => {
    switch (s) {
      case undefined:
        return {};
      case "country":
        return {
          country_id: active_permission?.region[active_region_index].country_id,
        };
      case "state":
        return {
          state_id: active_permission?.region[active_region_index].state_id,
        };
      case "division":
        return {
          division_id:
            active_permission?.region[active_region_index].division_id,
        };
      case "district":
        return {
          district_id:
            active_permission?.region[active_region_index].district_id,
        };
      case "tehsil":
        return {
          tehsil_id: active_permission?.region[active_region_index].tehsil_id,
        };
      default:
        return {};
    }
  };

  const headers = [
    "name",
    "age",
    "address",
    "contact_no",
    // "whatsapp_no",
    "form_no",
    "form_date",
    "satnam_date",
    "sarnam_date",
    "shuddhikaran",
    "occupation",
  ];
  const regionId = activeId();
  const onSearch = async (values: any, params?: any) => {
    const payload = objectWithValues(values);
    try {
      setLoading(true);
      const { data } = await apiClient.post(
        "sangat_list",
        { ...payload, ...regionId },
        {
          params: {
            limit: 10,
            page: 1,
            ...(params && params),
          },
        }
      );
      setEntries(data.data.disciples);
      setTotal(data.data.total);
      setPage(2);
    } catch (error: any) {
      if (error.response.status === 423) {
        toast.error(error.response?.data?.error);
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formRef = useRef<FormikProps<FormikValues>>(null);

  const getNamdanCenterList = async () => {
    try {
      const { data } = await apiClient.get("namdan_center_list", {
        params: { state_id: activeId()?.state_id, limit: 0 },
      });

      const updatedList = getOptionArray(data.data.namdan_center, "name", "id");
      setCenterList(updatedList);
    } catch (error) {
      console.error(error);
    }
  };

  const loadMore = async () => {
    const formValues = objectWithValues(formRef?.current?.values || {});
    const { start, end, ...values } = formValues;

    let payload = { ...values };
    if (start) payload["from_date"] = dayjs(start).format("YYYY-MM-DD");
    if (end) payload["to_date"] = dayjs(end).format("YYYY-MM-DD");

    try {
      setLoading(true);
      const { data } = await apiClient.post(
        "sangat_list",
        { ...payload, ...regionId },
        {
          params: {
            limit: 10,
            page,
          },
        }
      );
      setEntries((prev) => [...prev, ...data.data.disciples]);
      setTotal(data.data.total);
      setPage((p) => p + 1);
    } catch (error: any) {
      if (error.response.status === 423) {
        toast.error(error.response?.data?.error);
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeRoleRegion === "state") {
      getNamdanCenterList();
    }
  }, [activeRoleRegion]);

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: "Sangat List",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <Formik
          innerRef={formRef}
          initialValues={{
            country_id: 2,
            state_id: 0,
            district_id: 0,
            division_id: 0,
            tehsil_id: 0,
            view_entry: "",
            start: null,
            end: null,
            namdan_center: null,
          }}
          onSubmit={async (val) => {
            const { start, end, ...rest } = val;
            await onSearch({
              ...rest,
              ...(start && { from_date: dayjs(start).format("YYYY-MM-DD") }),
              ...(end && { to_date: dayjs(end).format("YYYY-MM-DD") }),
            });
          }}
        >
          {({ setFieldValue, values }) => {
            return (
              <Form>
                {activeRoleRegion == "state" && (
                  <Select
                    name="namdan_center"
                    options={centerList}
                    label={"Select namdan center"}
                    placeholder={"Select namdan center"}
                    value={
                      centerList.find((r) => r.value == values.namdan_center) ??
                      null
                    }
                    onChange={(e: any) => {
                      if (e?.value) {
                        setFieldValue("namdan_center", e.value);
                      } else {
                        setFieldValue("namdan_center", null);
                      }
                    }}
                    isClearable
                  />
                )}
                <DateFilter />
                <UserwiseDropdown
                  conditionalFields={{
                    country_id: false,
                  }}
                  useHirarchy={true}
                  showDivision={true}
                />
                <Select
                  options={entriesList.filter((e) =>
                    e.value == "shuddhikaran"
                      ? activeRoleRegion == "state"
                        ? true
                        : false
                      : true
                  )}
                  label="Search By Entry"
                  name="view_entry"
                  value={
                    entriesList.find((e) => e.value == values.view_entry) ??
                    null
                  }
                  onChange={(opt: any) => {
                    if (opt?.value) {
                      setFieldValue("view_entry", opt?.value);
                    } else {
                      setFieldValue("view_entry", "");
                    }
                  }}
                  isClearable
                />

                <Button type="submit" className="mx-auto mt-4 w-1/2">
                  {tc("submit")}
                </Button>
              </Form>
            );
          }}
        </Formik>
        {/* {total > 0 && (
          <p className="mt-4 mb-2">
            Showing <span className="font-semibold">{entries.length}</span> out
            of <span className="font-semibold">{total}</span> disciples
          </p>
        )} */}
        <div className="w-full max-h-screen overflow-x-scroll">
          <table className="w-full select-none">
            <thead
              style={{ zIndex: 1 }}
              className="w-full sticky top-0 bg-black text-white"
            >
              <tr className="w-full">
                {headers.map((header) => (
                  <td
                    className={"p-2 text-center capitalize w-24"}
                    key={header}
                  >
                    {removeSymbols(header)}
                  </td>
                ))}
              </tr>
            </thead>
            <tbody className="w-full">
              {entries.map((entry, index) => {
                return (
                  <tr
                    key={index}
                    className="border-b border-blue-300 odd:bg-blue-100 even:bg-gray-100/50 p-1"
                  >
                    <td className={"w-24 p-2 text-center capitalize"}>
                      <p>{entry.name}</p>
                      <p>{entry.relation}</p>
                      <p>{entry.guardian_name}</p>
                    </td>
                    <td className={"p-2 text-center capitalize"}>
                      {entry.dob ? dayjs().diff(entry.dob, "year") : "-"}
                    </td>
                    <td className={"p-2 text-center capitalize"}>
                      {[
                        entry.address,
                        entry.tehsil_name,
                        entry.tehsil_name,
                        entry.district_name,
                        entry.district_name1,
                        entry.state_name,
                        entry.country_name,
                      ].join(" ")}
                    </td>
                    <td className={"p-2 text-center capitalize"}>
                      <p className="flex flex-row gap-2">
                        <FiPhoneCall className="h-auto w-3" />
                        <a href={`tel:${entry.mobile_no}`}>{entry.mobile_no}</a>
                      </p>
                      {entry.whatsapp_no && (
                        <p className="flex flex-row gap-2 mt-4">
                          <IoLogoWhatsapp className="h-auto w-3 text-green-500" />
                          <a href={`tel:${entry.whatsapp_no}`}>
                            {entry.whatsapp_no}
                          </a>
                        </p>
                      )}
                    </td>
                    <td className={"p-2 text-center capitalize"}>
                      {entry.form_no}
                    </td>
                    <td className={"p-2 text-center capitalize"}>
                      {entry.form_date
                        ? dayjs(entry.form_date).format("DD-MM-YYYY")
                        : "-"}
                    </td>
                    <td className={"p-2 text-center capitalize"}>
                      {entry.satnam_date
                        ? dayjs(entry.satnam_date).format("DD-MM-YYYY")
                        : "-"}
                    </td>
                    <td className={"p-2 text-center capitalize"}>
                      {entry.sarnam_date
                        ? dayjs(entry.sarnam_date).format("DD-MM-YYYY")
                        : "-"}
                    </td>
                    <td className={"py-2 text-center capitalize text-sm"}>
                      <div className="w-full">
                        {entry.shuddhikaran_list.map((s: any) => (
                          <p
                            className="even:border-t pt-1 even:border-gray-400 block px-2"
                            key={s.id}
                          >
                            <span className="font-semibold">
                              {dayjs(s.date).format("YYYY-MM-DD")}
                            </span>{" "}
                            <span className="ml-1">{s.description}</span>
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className={"p-2 text-center capitalize"}>
                      {entry.occupation}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {loading && <LoadingSpinner className="w-8 h-8 mx-auto" />}
        </div>
        {entries.length > 0 && (
          <div className="w-full flex justify-center items-center">
            <button
              className="mx-auto px-2  py-1 font-xs font-semibold rounded-md bg-blue-400 text-white"
              onClick={loadMore}
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "heading"])),
    },
  };
};

export default SangatList;
