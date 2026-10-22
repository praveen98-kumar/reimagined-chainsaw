import Button from "@/components/Button";
import DatePicker from "@/components/input/DatePicker";
import FormErrorMessage from "@/components/input/FormErrorMessage";
import Layout from "@/components/Layout";
import apiClient from "@/http/index";
import { useAppSelector } from "@/redux/store";
import { objectWithValues } from "@/shared/functions/utils";
import { getReportParams } from "@/constants/reports";
import dayjs from "dayjs";
import * as Yup from "yup";
import { Formik, Form } from "formik";
import React, { useState, useEffect, useRef } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Region } from "@/shared/interfaces/user";

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
const Reports = () => {
  const { active_permission, active_region_index } = useAppSelector(
    (state) => state.auth,
  );
  const role_region = active_permission?.role_region ?? "";
  const [report, setReport] = useState([]);
  const [backTrace, setBackTrace] = useState<any[]>([]);
  const formRef = useRef<any>(null);

  const getReport = async (location: string, id: string) => {
    let params = [];
    Object.entries(objectWithValues(formRef?.current?.values)).forEach(
      ([key, value]) => {
        if (key == "dayFilter") {
          params.push(`${value}=1`);
        } else {
          let df = dayjs(value).format("YYYY-MM-DD");
          params.push(`${key}=${df}`);
        }
      },
    );
    if (location === "state" && id) {
      params.push(`country=${id}`);
    } else if (location === "district" && id) {
      params.push(`state=${id}`);
    } else if (location === "tehsil" && id) {
      params.push(`district=${id}`);
    } else if (location === "sevadar" && id) {
      params.push(`tehsil=${id}`);
    } else {
    }

    try {
      let report = await apiClient.get(
        `post_orders_reports?${params.join("&")}`,
      );
      if (report.data.data[0]?.country) {
        report.data.data = report.data.data.filter(
          (t: any) => t.country_id == 2,
        );
      }
      setReport(report.data.data);
    } catch (error) {
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
    const { keyLabel, valueLable } = getReportParams[role_region];
    // @ts-ignore
    const id = active_permission?.region[active_region_index][valueLable] ?? "";
    if (backTrace.length > 0) {
      const last = backTrace.slice(-1)[0];
      getReport(last.locationType, last.locationId);
    } else {
      getReport(keyLabel, id?.toString());
    }
  }, []);

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: `By Post Reports`,
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
          {({ handleChange, setFieldValue, values, errors }) => {
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
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <DatePicker
                      label="Start Date/तारीख से"
                      name="start"
                      onChangeRaw={handleCalendar}
                      onChange={(e: any) => handleChange(e)}
                      maxDate={new Date()}
                      dateFormat="dd-MM-yyyy"
                    />
                    {errors.start && (
                      <FormErrorMessage>{errors.start}</FormErrorMessage>
                    )}
                  </div>
                  <div className="w-1/2">
                    <DatePicker
                      label="End Date/तारीख तक"
                      name="end"
                      onChangeRaw={handleCalendar}
                      onChange={(e: any) => handleChange(e)}
                      minDate={values.start ?? undefined}
                      maxDate={new Date()}
                      dateFormat="dd-MM-yyyy"
                    />
                    {errors.end && (
                      <FormErrorMessage>{errors.end}</FormErrorMessage>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <label
                    className="flex items-center gap-2"
                    htmlFor="yesterday"
                  >
                    <span>Yesterday</span>
                    <input
                      type="radio"
                      name="dayFilter"
                      id="yesterday"
                      defaultValue={"yesterday"}
                      checked={values.dayFilter === "yesterday"}
                      onChange={handleRadio}
                      className="rounded text-green-600 focus:ring-green-400 focus:border-green-400"
                    />
                  </label>
                  <label
                    className="flex items-center gap-2"
                    htmlFor="this week"
                  >
                    <span>This Week</span>
                    <input
                      type="radio"
                      name="dayFilter"
                      id="this week"
                      defaultValue={"this_week"}
                      checked={values.dayFilter === "this_week"}
                      onChange={handleRadio}
                      className="rounded text-green-600 focus:ring-green-400 focus:border-green-400"
                    />
                  </label>
                  <label className="flex items-center gap-2" htmlFor="month">
                    <span>This Month</span>
                    <input
                      type="radio"
                      name="dayFilter"
                      id="month"
                      defaultValue={"this_month"}
                      checked={values.dayFilter === "this_month"}
                      onChange={handleRadio}
                      className="rounded text-green-600 focus:ring-green-400 focus:border-green-400"
                    />
                  </label>
                </div>
                <Button type="submit" className="mx-auto mt-4 w-1/2">
                  खोजें
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
                  {report.length > 0 && "tehsil" in report[0] && (
                    <p className="text-left">Tehsil</p>
                  )}
                  {report.length > 0 && "sevadar" in report[0] && (
                    <p className="text-left">Sevadar</p>
                  )}
                </th>
                <th className="px-2 w-28">
                  <p className="w-24 ">Total</p>
                </th>
              </tr>
            </thead>
            <tbody className="w-full">
              {report.length == 0 && (
                <tr>
                  <td className="text-center p-5" colSpan={5}>
                    <LoadingSpinner className="w-8 h-8 mx-auto" />
                  </td>
                </tr>
              )}
              {report.length > 0 &&
                "country" in report[0] &&
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
                    <td className="text-center">{obj["till_date"]}</td>
                  </tr>
                ))}

              {report.length > 0 &&
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
                    <td className="text-center">{obj["till_date"]}</td>
                  </tr>
                ))}

              {report.length > 0 &&
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
                    <td className="text-center">{obj["till_date"]}</td>
                  </tr>
                ))}

              {report.length > 0 &&
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
                    >
                      {obj["tehsil"]}
                    </td>
                    <td className="text-center">{obj["till_date"]}</td>
                    <td className="text-center">{obj["this_month"]}</td>
                    <td className="text-center">{obj["pending"]}</td>
                    <td className="text-center">{obj["completed"]}</td>
                    <td className="text-center">{obj["wrong_duplicate"]}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
