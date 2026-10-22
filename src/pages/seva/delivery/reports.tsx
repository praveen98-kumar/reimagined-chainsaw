import Button from "@/components/Button";
import DatePicker from "@/components/input/DatePicker";
import FormErrorMessage from "@/components/input/FormErrorMessage";
import Layout from "@/components/Layout";
import apiClient from "@/http/index";
import { useAppSelector } from "@/redux/store";
import { Option } from "@/shared/interfaces/option";
import { getReportParams } from "@/constants/reports";
import dayjs from "dayjs";
import * as Yup from "yup";
import { Formik, Form } from "formik";
import { useRouter } from "next/router";
import React, { useState, useEffect, useRef } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Region } from "@/shared/interfaces/user";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { NextApplicationPage } from "@/shared/interfaces/app";
import { useTranslation } from "react-i18next";
import DateFilter from "@/components/DateFilter";
import { OnFieldChange } from "@/components/UserwiseDropdown";
import Radio from "@/components/input/Radio";
import { cn } from "@/shared/functions/utils";

const schema = Yup.object().shape({
  dayFilter: Yup.string().ensure(),
  start: Yup.date().when("dayFilter", (dayFilter, passSchema) => {
    if (typeof dayFilter === "string" && dayFilter === "") {
      return passSchema.required("Start Date is required").nullable();
    }
    return passSchema.nullable();
  }),
  end: Yup.date().when("dayFilter", (dayFilter, passSchema) => {
    if (typeof dayFilter === "string" && dayFilter === "") {
      return passSchema.required("End Date is required").nullable();
    }
    return passSchema.nullable();
  }),
});

const Reports: NextApplicationPage = () => {
  const { t: tc } = useTranslation("common");
  const router = useRouter();
  const { active_permission, active_region_index } = useAppSelector(
    (state) => state.auth,
  );
  const role_region = active_permission?.role_region ?? "";
  const [isEmergency, setIsEmergency] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState([]);
  const [backTrace, setBackTrace] = useState<any[]>([]);
  const formRef = useRef<any>(null);

  const dayFilterOptions: Array<Option> = [
    { label: tc("today"), value: "today" },
    { label: tc("yesterday"), value: "yesterday" },
    { label: tc("this_week"), value: "this_week" },
    { label: tc("this_month"), value: "this_month" },
  ];

  const getReport = async (location: string, id: string) => {
    let params = [];
    let start;
    let end;
    params.push(`day_filter=${formRef?.current?.values.dayFilter}`);
    if (formRef?.current?.values.dayFilter) {
      switch (formRef?.current?.values.dayFilter) {
        case "today":
          start = dayjs().startOf("day").toISOString();
          end = dayjs().endOf("day").toISOString();
          break;
        case "yesterday":
          start = dayjs().subtract(1, "day").startOf("day").toISOString();
          end = dayjs().subtract(1, "day").endOf("day").toISOString();
          break;
        case "this_week":
          start = dayjs().startOf("week").startOf("day").toISOString();
          end = dayjs().endOf("day").toISOString();
          break;
        case "this_month":
          start = dayjs().startOf("month").startOf("day").toISOString();
          end = dayjs().endOf("day").toISOString();
          break;
        default:
          break;
      }
    } else if (formRef?.current?.values.start && formRef?.current?.values.end) {
      const startDate = formRef?.current?.values.start;
      const endDate = formRef?.current?.values.end;
      start = dayjs(startDate).startOf("day").toISOString();
      end = dayjs(endDate).endOf("day").toISOString();
    }
    if (router.query?.emergency) {
      params.push("emergency=1");
    }
    if (start != undefined && end != undefined) {
      params.push(`start=${start}`);
      params.push(`end=${end}`);
    }
    if (location === "state" && id) {
      params.push(`country=${id}`);
    } else if (location === "district" && id) {
      params.push(`state=${id}`);
    } else if (location === "division" && id) {
      params.push(`state=${id}`);
    } else if (location === "tehsil" && id) {
      params.push(`district=${id}`);
    } else if (location === "sevadar" && id) {
      params.push(`tehsil=${id}`);
    } else if (location === "division1" && id) {
      params.push(`division=${id}`);
    } else {
    }
    setLoading(true);
    try {
      let report = await apiClient.get(
        `book_delivery_reports_new?${params.join("&")}`,
      );
      if (report.data.data.report[0]?.country) {
        report.data.data.report = report.data.data.report.filter(
          (t: any) => t.country_id == 2,
        );
      }
      setReport(report.data.data.report);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const addNewBackTrace = (obj: any) => {
    let prevBackTrace = backTrace;
    let exists = false;
    for (let i = 0; i < prevBackTrace.length; i += 1) {
      if (prevBackTrace[i].locationType == obj.locationType) {
        exists = true;
      }
    }
    if (!exists) {
      prevBackTrace.push(obj);
    }
    setBackTrace(prevBackTrace);
  };
  const handleBackTraceClick = (obj: any) => {
    const index = backTrace.findIndex(
      (b) => b.locationType == obj.locationType,
    );
    getReport(obj.locationType, obj.locationId);
    const temp = backTrace.slice(0, index + 1);
    setBackTrace(temp);
  };

  useEffect(() => {
    if (router.query.emergency) setIsEmergency(true);
  }, [router.isReady]);

  // useEffect(() => {
  //     const {keyLabel, valueLable} = getReportParams[role_region];
  //     // @ts-ignore
  //     const id = active_permission?.region[active_region_index][valueLable] ?? "";
  //     if (backTrace.length > 0) {
  //         const last = backTrace.slice(-1)[0];
  //         getReport(last.locationType, last.locationId);
  //     } else {
  //         getReport(keyLabel, id?.toString());
  //     }
  // }, []);

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: `${isEmergency ? "Emeregency" : "Regular"} Reports`,
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <Formik
          innerRef={formRef}
          validationSchema={schema}
          initialValues={{
            dayFilter: "yesterday",
            start: null,
            end: null,
          }}
          onSubmit={() => {
            const { keyLabel, valueLable } = getReportParams[role_region];
            // @ts-ignore
            const id =
              active_permission?.region[active_region_index][
                valueLable as keyof Region
              ] ?? "";
            if (backTrace.length > 0) {
              const last = backTrace.slice(-1)[0];
              getReport(last.locationType, last.locationId);
            } else {
              getReport(keyLabel, id?.toString());
            }
          }}
        >
          {({ handleChange, setFieldValue }) => {
            const handleCalendar = () => {
              setFieldValue("dayFilter", "");
            };
            const handleRadio = (e: React.ChangeEvent<any>) => {
              handleChange(e);
              setFieldValue("dayFilter", e.target.value);
              setFieldValue("start", null);
              setFieldValue("end", null);
            };
            return (
              <Form>
                {/*<DateFilter/>*/}
                <OnFieldChange fields={["end"]} onChange={handleCalendar} />
                <OnFieldChange fields={["start"]} onChange={handleCalendar} />
                <Radio
                  options={dayFilterOptions}
                  name="dayFilter"
                  label=""
                  onChange={handleRadio}
                  inputClassName="rounded text-green-600 checked:bg-green-600 focus:ring-green-400 focus:border-green-400"
                />
                <Button
                  type="submit"
                  className="mx-auto mt-4 w-1/2"
                  disabled={loading}
                >
                  {tc("search")}
                </Button>
              </Form>
            );
          }}
        </Formik>
        <div>
          {backTrace.length >= 1 && (
            <p className="p-2 border-t border-b border-gray-300 mb-4">
              Showing results for
              {backTrace.map((obj, i) => (
                <span
                  key={i}
                  className="text-left capitalize "
                  onClick={() => handleBackTraceClick(obj)}
                >
                  &nbsp;{obj.currLocationType}({obj.locationName})
                  {i < backTrace.length && " : "}
                </span>
              ))}
            </p>
          )}
        </div>
        <div className="w-full max-h-screen overflow-x-scroll">
          <table className="w-full">
            <thead
              style={{ zIndex: 1 }}
              className="w-full sticky top-0 bg-black text-white"
            >
              <tr className="w-full">
                <th className="px-2 sticky left-0 bg-black">
                  {report.length == 0 && <p className="text-left">Country</p>}
                  {report.length > 0 && "country" in report[0] && (
                    <p className="text-left">Country</p>
                  )}
                  {report.length > 0 && "state" in report[0] && (
                    <p className="text-left">State</p>
                  )}
                  {report.length > 0 && "district" in report[0] && (
                    <p className="text-left">District</p>
                  )}
                  {report.length > 0 && "division" in report[0] && (
                    <p className="text-left">Division</p>
                  )}
                  {report.length > 0 && "tehsil" in report[0] && (
                    <p className="text-left">Tehsil</p>
                  )}
                  {report.length > 0 && "sevadar" in report[0] && (
                    <p className="text-left">Sevadar</p>
                  )}
                </th>

                {/*{report.length > 0 && !("country" in report[0]) && (*/}
                {/*  <th className="px-2 w-28">*/}
                {/*    <p className="w-24 ">This Month</p>*/}
                {/*  </th>*/}
                {/*)}*/}
                <th className="px-2 ">
                  <p className="w-18 ">Pending In</p>
                </th>
                <th className="px-2">
                  <p className="w-18 ">Total Out</p>
                </th>
                <th className="px-2 ">
                  <p className="w-18 ">Pending Out</p>
                </th>
                <th className="px-2 ">
                  <p className="w-18 ">Delivered</p>
                </th>
                <th className="px-2 ">
                  <p className="w-18 ">Duplicate</p>
                </th>
                <th className="px-2 ">
                  <p className="w-18 ">Wrong Orders</p>
                </th>
              </tr>
            </thead>
            <tbody className="w-full">
              {loading && (
                <tr>
                  <td className="text-center p-5" colSpan={5}>
                    <LoadingSpinner className="w-8 h-8 mx-auto" />
                  </td>
                </tr>
              )}
              {report.length > 0 &&
                !loading &&
                "country" in report[0] &&
                report.map((obj, i) => (
                  <tr
                    key={i}
                    className={cn(
                      "border-b border-blue-300 odd:bg-blue-100 even:bg-gray-100/50 p-1",
                      {
                        "bg-red-200": obj?.["active"],
                      },
                    )}
                  >
                    <td
                      className={`sticky capitalize left-0 border-r border-blue-300 ${
                        i % 2 == 0 ? "bg-blue-200" : "bg-white"
                      }`}
                      onClick={() => {
                        getReport("state", obj["country_id"]);
                        addNewBackTrace({
                          locationType: "state",
                          currLocationType: "Country",
                          locationName: obj["country"],
                          locationId: obj["country_id"],
                        });
                      }}
                    >
                      {obj["country"]}
                    </td>
                    <td className="text-center">{obj["pending_in"]}</td>
                    <td className="text-center">
                      {obj["pending_out"] +
                        obj["delivered"] +
                        obj["duplicated"] +
                        obj["wrong_order"]}
                    </td>
                    <td className="text-center">{obj["pending_out"]}</td>
                    <td className="text-center">{obj["delivered"]}</td>
                    <td className="text-center">{obj["duplicated"]}</td>
                    <td className="text-center">{obj["wrong_order"]}</td>
                  </tr>
                ))}

              {report.length > 0 &&
                !loading &&
                "state" in report[0] &&
                report.map((obj, i) => (
                  <tr
                    key={i}
                    className="border-b border-blue-300 odd:bg-blue-100 even:bg-gray-100/50 p-1"
                  >
                    <td
                      className={`sticky capitalize left-0 border-r border-blue-300 ${
                        i % 2 == 0 ? "bg-blue-200" : "bg-white"
                      }`}
                      onClick={() => {
                        getReport("district", obj["state_id"]);
                        addNewBackTrace({
                          locationType: "district",
                          currLocationType: "State",
                          locationName: obj["state"],
                          locationId: obj["state_id"],
                        });
                      }}
                    >
                      {obj["state"]}
                    </td>
                    <td className="text-center">{obj["pending_in"]}</td>
                    <td className="text-center">
                      {obj["pending_out"] +
                        obj["delivered"] +
                        obj["duplicated"] +
                        obj["wrong_order"]}
                    </td>
                    {/*<td className="text-center">{obj["this_month"]}</td>*/}
                    <td className="text-center">{obj["pending_out"]}</td>
                    <td className="text-center">{obj["delivered"]}</td>
                    <td className="text-center">{obj["duplicated"]}</td>
                    <td className="text-center">{obj["wrong_order"]}</td>
                  </tr>
                ))}

              {report.length > 0 &&
                !loading &&
                "division" in report[0] &&
                report.map((obj, i) => (
                  <tr
                    key={i}
                    className="border-b border-blue-300 odd:bg-blue-100 even:bg-gray-100/50 p-1"
                  >
                    <td
                      className={`sticky capitalize left-0 border-r border-blue-300 ${
                        i % 2 == 0 ? "bg-blue-200" : "bg-white"
                      }`}
                      onClick={() => {
                        getReport("division1", obj["division_id"]);
                        addNewBackTrace({
                          locationType: "division1",
                          currLocationType: "Division",
                          locationName: obj["division"],
                          locationId: obj["division_id"],
                        });
                      }}
                    >
                      {obj["division"]}
                    </td>
                    <td className="text-center">{obj["pending_in"]}</td>
                    <td className="text-center">
                      {obj["pending_out"] +
                        obj["delivered"] +
                        obj["duplicated"] +
                        obj["wrong_order"]}
                    </td>
                    {/*<td className="text-center">{obj["this_month"]}</td>*/}
                    <td className="text-center">{obj["pending_out"]}</td>
                    <td className="text-center">{obj["delivered"]}</td>
                    <td className="text-center">{obj["duplicated"]}</td>
                    <td className="text-center">{obj["wrong_order"]}</td>
                  </tr>
                ))}
              {report.length > 0 &&
                !loading &&
                "district" in report[0] &&
                report.map((obj, i) => (
                  <tr
                    key={i}
                    className="border-b border-blue-300 odd:bg-blue-100 even:bg-gray-100/50 p-1"
                  >
                    <td
                      className={`sticky capitalize left-0 border-r border-blue-300 ${
                        i % 2 == 0 ? "bg-blue-200" : "bg-white"
                      }`}
                      onClick={() => {
                        getReport("tehsil", obj["district_id"]);
                        addNewBackTrace({
                          locationType: "tehsil",
                          currLocationType: "District",
                          locationName: obj["district"],
                          locationId: obj["district_id"],
                        });
                      }}
                    >
                      {obj["district"]}
                    </td>
                    <td className="text-center">{obj["pending_in"]}</td>
                    <td className="text-center">
                      {obj["pending_out"] +
                        obj["delivered"] +
                        obj["duplicated"] +
                        obj["wrong_order"]}
                    </td>
                    {/*<td className="text-center">{obj["this_month"]}</td>*/}
                    <td className="text-center">{obj["pending_out"]}</td>
                    <td className="text-center">{obj["delivered"]}</td>
                    <td className="text-center">{obj["duplicated"]}</td>
                    <td className="text-center">{obj["wrong_order"]}</td>
                  </tr>
                ))}

              {report.length > 0 &&
                !loading &&
                "tehsil" in report[0] &&
                report.map((obj, i) => (
                  <tr
                    key={i}
                    className="border-b border-blue-300 odd:bg-blue-100 even:bg-gray-100/50 p-1"
                  >
                    <td
                      className={`sticky capitalize left-0 border-r border-blue-300 ${
                        i % 2 == 0 ? "bg-blue-200" : "bg-white"
                      }`}
                      onClick={() => {
                        getReport("sevadar", obj["tehsil_id"]);
                        addNewBackTrace({
                          locationType: "sevadar",
                          currLocationType: "Tehsil",
                          locationName: obj["tehsil"],
                          locationId: obj["tehsil_id"],
                        });
                      }}
                    >
                      {obj["tehsil"]}
                    </td>
                    <td className="text-center">{obj["pending_in"]}</td>
                    <td className="text-center">
                      {obj["pending_out"] +
                        obj["delivered"] +
                        obj["duplicated"] +
                        obj["wrong_order"]}
                    </td>
                    {/*<td className="text-center">{obj["this_month"]}</td>*/}
                    <td className="text-center">{obj["pending_out"]}</td>
                    <td className="text-center">{obj["delivered"]}</td>
                    <td className="text-center">{obj["duplicated"]}</td>
                    <td className="text-center">{obj["wrong_order"]}</td>
                  </tr>
                ))}

              {report.length > 0 &&
                !loading &&
                "sevadar" in report[0] &&
                report.map((obj, i) => (
                  <tr
                    key={i}
                    className="border-b border-blue-300 odd:bg-blue-100 even:bg-gray-100/50 p-1"
                  >
                    <td
                      className={`sticky capitalize left-0 border-r border-blue-300 ${
                        i % 2 == 0 ? "bg-blue-200" : "bg-white"
                      }`}
                    >
                      {obj["sevadar"]}
                    </td>
                    <td className="text-center">{obj["pending_in"]}</td>
                    <td className="text-center">
                      {obj["pending_out"] +
                        obj["delivered"] +
                        obj["duplicated"] +
                        obj["wrong_order"]}
                    </td>
                    {/*<td className="text-center">{obj["this_month"]}</td>*/}
                    <td className="text-center">{obj["pending_out"]}</td>
                    <td className="text-center">{obj["delivered"]}</td>
                    <td className="text-center">{obj["duplicated"]}</td>
                    <td className="text-center">{obj["wrong_order"]}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

Reports.requireAuth = true;

const TableHead = ({
  down = false,
  onClick,
  title,
}: {
  down?: boolean;
  onClick: () => void;
  title: string;
}) => {
  return (
    <th className="px-2 text-center w-18" onClick={onClick}>
      <p>{title}</p>
      <p className={down ? "rotate-180 text-xs" : "text-xs"}>▲</p>
    </th>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "status"])),
    },
  };
};

export default Reports;
