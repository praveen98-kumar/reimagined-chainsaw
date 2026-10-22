import Button from "@/components/Button";
import DatePicker from "@/components/input/DatePicker";
import Layout from "@/components/Layout";
import apiClient from "@/http/index";
import { useAppSelector } from "@/redux/store";
import { Region } from "@/shared/interfaces/user";
import { getReportParams } from "@/constants/reports";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const Report = () => {
  const { active_permission, active_region_index } = useAppSelector(
    (state) => state.auth,
  );
  const role_region = active_permission?.role_region ?? "";
  const [report, setReport] = useState([]);
  const [dayFilter, setDayFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [backTrace, setBackTrace] = useState<any[]>([]);

  const getReport = async (location: string, id: string) => {
    let params = [];
    setErrorMsg("");
    if (startDate) {
      params.push(`start=${startDate.toLocaleDateString("en-CA")}`);
      if (endDate) {
        if (startDate > endDate) {
          setErrorMsg("Start date cannot be greater than End date");
        }
        params.push(`end=${endDate.toLocaleDateString("en-CA")}`);
      }
    } else {
      params.push(`${dayFilter}=1`);
    }
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
        `jyada_ruchi_reports?${params.join("&")}`,
      );
      if (report.data.data[0]?.country) {
        report.data.data = report.data.data.filter(
          (t: any) => t.country_id == 2,
        );
      }
      setReport(report.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  const dayFilterChanged = (dayFilterVal: string) => {
    setStartDate(null);
    setEndDate(null);
    setDayFilter(dayFilterVal);
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
  useEffect(() => {
    const { keyLabel, valueLable } = getReportParams[role_region];
    // @ts-ignore
    const id = active_permission?.region[active_region_index][valueLable] ?? "";
    getReport(keyLabel, id?.toString());
  }, []);
  return (
    <Layout headerProps={{ isBack: true, heading: "Reports" }}>
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <Formik
          initialValues={{
            start_date: null,
            end_date: null,
          }}
          onSubmit={() => {
            const { keyLabel, valueLable } = getReportParams[role_region];
            // @ts-ignore
            const id =
              active_permission?.region[active_region_index][
                valueLable as keyof Region
              ] ?? "";
            getReport(keyLabel, id?.toString());
            setBackTrace([]);
          }}
        >
          {({ handleChange }) => (
            <Form>
              <div className="flex gap-4">
                <DatePicker
                  label="Start Date/तारीख से"
                  name="start_date"
                  onChange={(e: any) => handleChange(e)}
                  onSelect={(d) => setStartDate(d)}
                  maxDate={new Date()}
                  dateFormat="dd-MM-yyyy"
                />
                <DatePicker
                  label="End Date/तारीख तक"
                  name="end_date"
                  onChange={(e: any) => handleChange(e)}
                  onSelect={(d) => setStartDate(d)}
                  maxDate={new Date()}
                  dateFormat="dd-MM-yyyy"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <label className="flex items-center gap-2" htmlFor="yesterday">
                  <span>Yesterday</span>
                  <input
                    type="radio"
                    name="day_filter"
                    id="yesterday"
                    checked={dayFilter === "yesterday"}
                    className="rounded text-green-600 focus:ring-green-400 focus:border-green-400"
                    onChange={() => dayFilterChanged("yesterday")}
                  />
                </label>
                <label className="flex items-center gap-2" htmlFor="this week">
                  <span>This Week</span>
                  <input
                    type="radio"
                    name="day_filter"
                    id="this week"
                    className="rounded text-green-600 focus:ring-green-400 focus:border-green-400"
                    onChange={() => dayFilterChanged("this_week")}
                  />
                </label>
                <label className="flex items-center gap-2" htmlFor="month">
                  <span>This Month</span>
                  <input
                    type="radio"
                    name="day_filter"
                    id="month"
                    className="rounded text-green-600 focus:ring-green-400 focus:border-green-400"
                    onChange={() => dayFilterChanged("this_month")}
                  />
                </label>
              </div>
              <Button type="submit" className="mx-auto mt-4 w-1/2">
                खोजें
              </Button>
            </Form>
          )}
        </Formik>
        <div>
          {backTrace.length >= 1 && (
            <p className="p-2 border-t border-b border-gray-300 mb-4">
              Showing results for
              {backTrace.map((obj, i) => (
                <span
                  className="text-left capitalize underline"
                  onClick={() => {
                    getReport(obj.locationType, obj.locationId);
                  }}
                >
                  &nbsp;{obj.currLocationType}({obj.locationName})
                  {i < backTrace.length && " : "}
                </span>
              ))}
            </p>
          )}
        </div>
        <div className="w-full h-full overflow-x-scroll">
          <table className="w-full">
            <thead className="w-full">
              <tr className="border-b border-gray-300 w-full">
                <th className="px-2 ">
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
                  <p className="w-24 ">Will Confirm Later</p>
                </th>
                <th className="px-2 ">
                  <p className="w-24 ">Issues with Rules</p>
                </th>
                <th className="px-2 ">
                  <p className="w-24 ">Come In Satsang</p>
                </th>
                <th className="px-2 ">
                  <p className="w-24 ">Interested For Namdan</p>
                </th>
                <th className="px-2 ">
                  <p className="w-24 ">Namdan Taken</p>
                </th>
                <th className="px-2 ">
                  <p className="w-24 ">Not Interested</p>
                </th>
                <th className="px-2 ">
                  <p className="w-24 ">Out Of Reach</p>
                </th>
              </tr>
            </thead>
            <tbody className="w-full">
              {report.length == 0 && (
                <tr>
                  <td className="text-center p-5" colSpan={5}>
                    No data
                  </td>
                </tr>
              )}
              {report.map((row, i) => (
                <tr key={i} className="border-b border-t  border-gray-300">
                  {row["country"] && (
                    <td
                      className="text-left px-1 py-1.5 whitespace-nowrap "
                      onClick={() => {
                        getReport("state", row["country_id"]);
                        addNewBackTrace({
                          locationType: "state",
                          currLocationType: "Country",
                          locationName: row["country"],
                          locationId: row["country_id"],
                        });
                      }}
                    >
                      {row["country"]}
                    </td>
                  )}
                  {row["state"] && (
                    <td
                      className="text-left px-1 py-1.5 whitespace-nowrap "
                      onClick={() => {
                        getReport("district", row["state_id"]);
                        addNewBackTrace({
                          locationType: "district",
                          currLocationType: "State",
                          locationName: row["state"],
                          locationId: row["state_id"],
                        });
                      }}
                    >
                      {row["state"]}
                    </td>
                  )}
                  {row["district"] && (
                    <td
                      className="text-left px-1 py-1.5 whitespace-nowrap "
                      onClick={() => {
                        getReport("tehsil", row["district_id"]);
                        addNewBackTrace({
                          locationType: "tehsil",
                          currLocationType: "District",
                          locationName: row["district"],
                          locationId: row["district_id"],
                        });
                      }}
                    >
                      {row["district"]}
                    </td>
                  )}
                  {row["tehsil"] && (
                    <td
                      className="text-left px-1 py-1.5 whitespace-nowrap "
                      onClick={() => {
                        getReport("sevadar", row["tehsil_id"]);
                        addNewBackTrace({
                          locationType: "sevadar",
                          currLocationType: "Tehsil",
                          locationName: row["tehsil"],
                          locationId: row["tehsil_id"],
                        });
                      }}
                    >
                      {row["tehsil"]}
                    </td>
                  )}
                  <td className="text-center">{row["will_confirm_later"]}</td>
                  <td className="text-center">{row["issue_with_rule"]}</td>
                  <td className="text-center">{row["come_in_satsang"]}</td>
                  <td className="text-center">{row["interested"]}</td>
                  <td className="text-center">{row["got_initiation"]}</td>
                  <td className="text-center">{row["not_interested"]}</td>
                  <td className="text-center">{row["out_of_reach"]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Report;
