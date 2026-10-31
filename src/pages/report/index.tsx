import { reportTableParam } from "@/constants/app";
import { socialImages } from "@/constants/images";
import {
  getReportParams,
  reportTypes,
  reportTypesForDistrictSevadar,
} from "@/constants/reports";
import dayjs from "dayjs";
import { Form, Formik, type FormikProps } from "formik";
import type { GetStaticProps } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiPhoneCall } from "react-icons/fi";
import { IoLogoWhatsapp } from "react-icons/io5";
import * as Yup from "yup";
import AddCountryCount from "@/components/AddCountryCount";
import Button from "@/components/Button";
import DateFilter from "@/components/DateFilter";
import Radio from "@/components/input/Radio";
import Select from "@/components/input/Select";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { OnFieldChange } from "@/components/UserwiseDropdown";
import apiClient from "@/http/index";
import { useAppSelector } from "@/redux/store";
import { getDateDiff } from "@/shared/functions/date";
import { exportToExcel, getTableExportData } from "@/shared/functions/excel";
import {
  capitalizeWords,
  cn,
  downloadFile,
  isValidUser,
} from "@/shared/functions/utils";
import type { Option } from "@/shared/interfaces/option";
import type { Region } from "@/shared/interfaces/user";
import { ReportColor } from "../../constants/report-color";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/DropdownMenu";

export const dayFilterOptions: Array<Option> = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
];

export const dayFilterOptionsForDistrictSevadar: Array<Option> = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
];

// Enhanced TypeScript interfaces
interface SocialMediaQuestion {
  id: number;
  short_name: string;
  question_text?: string;
}

interface RegionData {
  [key: string]: string | number | boolean;
}

interface SevaCountData {
  question_id: number;
  seva_count: number;

  [key: string]: string | number;
}

interface AllSocialMediaReport {
  regions: RegionData[];
  questions: SocialMediaQuestion[];
  seva_count: SevaCountData[];
}

interface BackTraceItem {
  locationType: string;
  currLocationType: string;
  locationName: string;
  locationId: number;
}

interface ApiResponse<T = any> {
  data: {
    data: T;
    headers?: any[];
    report?: any[];
  };
}

interface ReportError {
  message: string;
  code?: string;
}

const schema = Yup.object({
  dayFilter: Yup.string().ensure(),
  report_type: Yup.string().default("sevadar"),
  sevadar_level: Yup.string().default("sevadar"),
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
  social_media_report_type: Yup.string()
    .oneOf(["pending_report", "all_seva_report"])
    .optional(),
});

type Payload = Yup.InferType<typeof schema>;

type TReport = Array<{ [k: string]: string | number | boolean }>;

// Improved interface replacing T1Report
interface SocialMediaReportData {
  regions: RegionData[];
  questions: SocialMediaQuestion[];
  seva_count: SevaCountData[];
}

function sortData({
  tableData,
  sortKey,
  dir,
}: {
  tableData: TReport;
  sortKey?: keyof TReport[0];
  dir?: "asc" | "desc";
}) {
  if (!sortKey || !dir) return tableData;

  const sortedData = [...tableData].sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];

    // Handle numeric sorting
    if (typeof aValue === "number" && typeof bValue === "number") {
      return dir === "asc" ? aValue - bValue : bValue - aValue;
    }

    // Handle string sorting
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();

    if (dir === "asc") {
      return aStr > bStr ? 1 : aStr < bStr ? -1 : 0;
    } else {
      return bStr > aStr ? 1 : bStr < aStr ? -1 : 0;
    }
  });

  return sortedData;
}

// Custom hook for error handling
const useErrorHandler = () => {
  const handleError = useCallback((error: unknown, context: string) => {
    console.error(`Error in ${context}:`, error);

    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes("Network")) {
        console.error("Network error occurred");
      } else if (error.message.includes("401")) {
        console.error("Authentication error");
      }
    }
  }, []);

  return { handleError };
};

const ReportComponent = ({ url, lang }: { url: string; lang: string }) => {
  const { active_permission, active_region_index } = useAppSelector(
    (state) => state.auth,
  );
  const role_region = active_permission?.role_region ?? "";
  const [report, setReport] = useState<TReport>([]);
  const [allReport, setAllReport] = useState<SocialMediaReportData>({
    questions: [],
    regions: [],
    seva_count: [],
  });
  const [headers, setHeaders] = useState<TReport>([]);
  const [backTrace, setBackTrace] = useState<BackTraceItem[]>([]);
  const formRef = useRef<FormikProps<Payload>>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [canDownload, setCanDownload] = useState<boolean>(false);
  const [report_color, setReportColor] = useState<string>(
    ReportColor["country"],
  );
  const [dayDiff, setDayDiff] = useState(0);
  const {
    body,
    header,
    url: apiUrl,
    downloadUrl,
    permission,
    excelExportPermission,
  } = reportTableParam[url];
  const [tableHeaders, setTableHeaders] = useState<
    { header: string; icon?: string }[]
  >(header.map((h) => ({ header: h })));
  const [tableBody, setTableBody] = useState<RegionData[]>([]);
  const [socialMediaQuestions, setSocialMediaQuestions] = useState<
    SocialMediaQuestion[]
  >([]);
  const [sortKey, setSortKey] = useState<string>(body[0]);
  const [dir, setDir] = useState<"asc" | "desc">("asc");

  const showContactIcons = isValidUser("report_whatsapp_calling");

  const { handleError } = useErrorHandler();

  // Extract common parameter building logic
  const buildDateParams = useCallback(() => {
    let start, end;
    const currentValues = formRef?.current?.values;

    if (currentValues?.dayFilter) {
      switch (currentValues.dayFilter) {
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
        case "last_month":
          start = dayjs()
            .subtract(1, "month")
            .startOf("month")
            .startOf("day")
            .toISOString();
          end = dayjs()
            .subtract(1, "month")
            .endOf("month")
            .endOf("day")
            .toISOString();
          break;
        default:
          break;
      }
    } else if (currentValues?.start && currentValues?.end) {
      start = dayjs(currentValues.start).startOf("day").toISOString();
      end = dayjs(currentValues.end).endOf("day").toISOString();
    }

    return start && end ? { start, end } : {};
  }, []);

  const getParams = useCallback(
    (location: string, id: number) => {
      const currentValues = formRef?.current?.values;
      const params: Record<string, any> = {
        ...buildDateParams(),
        report_type: currentValues?.report_type,
        sevadar_level: currentValues?.sevadar_level,
      };

      if (currentValues?.dayFilter) {
        params["day_filter"] = currentValues.dayFilter;
      }

      // Location-specific parameters
      const locationConfig: Record<string, { param: string; color: string }> = {
        state: { param: "country", color: ReportColor["state"] },
        district: {
          param: "state",
          color:
            currentValues?.sevadar_level === "region"
              ? ReportColor["division"]
              : ReportColor["district"],
        },
        division: {
          param: "state",
          color:
            currentValues?.sevadar_level === "region"
              ? ReportColor["division"]
              : ReportColor["district"],
        },
        tehsil: {
          param: "district",
          color:
            currentValues?.sevadar_level === "region"
              ? ReportColor["tehsil"]
              : ReportColor["district_sevadar"],
        },
        sevadar: { param: "tehsil", color: ReportColor["tehsil_sevadar"] },
        division1: { param: "division", color: ReportColor["district"] },
      };

      const config = locationConfig[location];
      if (config && id) {
        params[config.param] = id;
        setReportColor(config.color);
      }

      return params;
    },
    [buildDateParams],
  );

  const firstHeader = () => {
    if (report.length == 0 && tableBody.length == 0) {
      return "Country";
    }
    if (
      report?.[0]?.hasOwnProperty("country") ||
      tableBody?.[0]?.hasOwnProperty("country_id")
    )
      return "Country";
    else if (
      report?.[0]?.hasOwnProperty("state") ||
      tableBody?.[0]?.hasOwnProperty("state_id")
    )
      return "State";
    else if (
      report?.[0]?.hasOwnProperty("district") ||
      tableBody?.[0]?.hasOwnProperty("district_id")
    )
      return "District";
    else if (
      report?.[0]?.hasOwnProperty("division") ||
      tableBody?.[0]?.hasOwnProperty("division_id")
    )
      return "Division";
    else if (
      report?.[0]?.hasOwnProperty("tehsil") ||
      tableBody?.[0]?.hasOwnProperty("tehsil_id")
    )
      return "Tehsil";
    else if (
      report?.[0]?.hasOwnProperty("sevadar") ||
      tableBody?.[0]?.hasOwnProperty("sevadar_id")
    )
      return "Sevadar";
    return "Country";
  };

  const getReport = useCallback(
    async (location: string, id: number) => {
      if (
        formRef?.current?.values.social_media_report_type === "all_seva_report"
      ) {
        await getAllSocialMediaReport(location, id);
        return;
      }

      const params = getParams(location, id);
      setLoading(true);
      setCanDownload(false);

      try {
        const response: ApiResponse = await apiClient.get(apiUrl, { params });
        let reportData = response.data.data;
        // TODO : we can change this later
        // if (
        //   apiUrl === "social_media_pending_report_region_wise" &&
        //   params?.district &&
        //   params?.report_type == "sevadar" &&
        //   reportData?.report
        // ) {
        //   reportData.report = reportData?.report.filter(
        //     (r: any) => r.total_sum == 0,
        //   );
        // }
        let finalReport: TReport = [];

        // Filter by country if needed
        if (reportData[0]?.country) {
          reportData.data = reportData.filter(
            (item: any) => item.country_id === 2,
          );
        }

        // Handle different report types
        if (apiUrl === "order_reports") {
          setHeaders(reportData.headers || []);
          const sortedReport = [...(reportData.report || [])].sort((a, b) => {
            const totalA =
              Number(a["e_international"] || 0) +
              Number(a["international"] || 0) +
              Number(a["e_national"] || 0) +
              Number(a["national"] || 0);
            const totalB =
              Number(b["e_international"] || 0) +
              Number(b["international"] || 0) +
              Number(b["e_national"] || 0) +
              Number(b["national"] || 0);
            return totalB - totalA;
          });
          finalReport = sortedReport;
        } else if (
          [
            "namdan_calling_reports",
            "book_calling_reports",
            "jyada_ruchi_reports",
          ].includes(apiUrl)
        ) {
          setHeaders(reportData.headers || []);
          const sortedReport = [...(reportData.report || [])].sort((a, b) => {
            const count1 = body.reduce(
              (acc, field) => acc + Number(a[field] || 0),
              0,
            );
            const count2 = body.reduce(
              (acc, field) => acc + Number(b[field] || 0),
              0,
            );
            return count1 - count2;
          });
          finalReport = sortedReport;
        } else if (
          apiUrl === "book_delivery_reports_new" ||
          apiUrl === "ramaini_seva_report"
        ) {
          setHeaders(reportData.headers || []);
          finalReport = reportData.report || [];
        } else if (apiUrl === "social_media_pending_report_region_wise") {
          const updatedReport = (reportData.report || []).map((item: any) => ({
            ...item,
            pending: item.total_sevadar - item.total_sum,
            percentage:
              item.total_sevadar > 0
                ? Math.round((item.total_sum / item.total_sevadar) * 100)
                : 0,
          }));
          setDayDiff(getDateDiff(new Date(params.start), new Date(params.end)));
          setHeaders(reportData.headers || []);
          finalReport = updatedReport;
        } else {
          finalReport = reportData || [];
        }

        setReport(finalReport);
        setCanDownload(finalReport.length > 0);
      } catch (error) {
        handleError(error, "getReport");
        setCanDownload(false);
      } finally {
        setLoading(false);
      }
    },
    [apiUrl, body, getParams, handleError, firstHeader],
  );

  const addNewBackTrace = (obj: any) => {
    const prevBackTrace = backTrace;
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

  const handleBackTraceClick = (index: number) => {
    getReport(backTrace[index].locationType, backTrace[index].locationId);
    const temp = backTrace.slice(0, index + 1);
    setBackTrace(temp);
  };

  const downloadReport = async () => {
    if (!downloadUrl) return;
    const { keyLabel, valueLable } = getReportParams[role_region];
    // @ts-expect-error
    const id = active_permission?.region[active_region_index][valueLable] ?? "";
    let allParams: Record<string, any> = {};
    let report_date;
    if (backTrace.length > 0) {
      const last = backTrace.slice(-1)[0];
      allParams = getParams(last.locationType, last.locationId);
    } else {
      allParams = getParams(keyLabel, id?.toString());
    }
    if (
      allParams["start"] != undefined &&
      allParams["end"] != undefined &&
      formRef?.current?.values.dayFilter != "today"
    ) {
      report_date = `From ${dayjs(allParams["start"]).format(
        "DD.MM.YYYY",
      )} To ${dayjs(allParams["end"]).format("DD.MM.YYYY")}`;
    } else {
      report_date = "Date : " + dayjs().format("DD.MM.YYYY");
    }
    setDownloading(true);
    try {
      let requestData;
      let newReport = [];
      let newDownloadUrl = downloadUrl;
      if (
        formRef?.current?.values.social_media_report_type == "all_seva_report"
      ) {
        let { regions, questions, seva_count } = allReport;
        regions = regions.filter((r) => r.active);
        // @ts-expect-error
        newReport = { regions, questions, seva_count };
        newDownloadUrl = "download_social_media_seva_report_all";
      } else {
        newReport = sortedReport.filter((r) => r.active);
      }
      if (
        [
          "order_reports",
          "book_calling_reports",
          "book_calling_reports",
          "book_delivery_reports_new",
          "namdan_calling_reports",
          "social_media_pending_report_region_wise",
          "social_media_seva_wise_report_all_regions",
          "jyada_ruchi_reports",
        ].includes(apiUrl)
      ) {
        requestData = { report: newReport, headers, report_color, report_date };

        if (
          formRef?.current?.values.social_media_report_type !==
            "all_seva_report" &&
          Object.hasOwn(report[0], "state")
        ) {
          requestData["report"] = [...requestData["report"]].filter((r) => {
            return body.reduce((a, c) => a + (r[c] ? Number(r[c]) : 0), 0) > 0;
          });
        }
      } else {
        requestData = newReport;
      }
      const fileName = url
        .split("_")
        .map((a) => capitalizeWords(a))
        .join("_");
      await downloadFile({
        endPoint: newDownloadUrl,
        method: "POST",
        body: { ...requestData, lang, day_diff: dayDiff },
        fileName,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setDownloading(false);
    }
  };
  const sortedReport = useMemo(() => {
    if (
      formRef?.current?.values.social_media_report_type === "all_seva_report"
    ) {
      return tableBody;
    }
    return sortData({ tableData: report, sortKey, dir });
  }, [sortKey, dir, report]);

  const changeSort = (key: string) => {
    if (key == sortKey) {
      setDir(dir === "asc" ? "desc" : "asc");
    } else {
      setDir("asc");
    }
    setSortKey(key);
  };

  const tableDataClass = (i: number, active: boolean) =>
    `sticky left-0 border-r border-blue-300 ${
      !active ? "bg-red-400" : i % 2 == 0 ? "bg-blue-200" : "bg-white"
    }`;

  const onAddCountryCount = (payload: Record<string, string | number>) => {
    const exists = report?.find((r) => r?.state == payload.country);
    if (exists) {
      const updatedReport = report?.map((r) =>
        r?.state == payload.country ? payload : r,
      );
      setReport(updatedReport);
    } else {
      setReport((pre) => [...pre, payload]);
    }
  };

  const reportOptions = useMemo(() => {
    return role_region === "ashram" || role_region === "country"
      ? reportTypes
      : reportTypesForDistrictSevadar;
  }, [role_region]);

  const getAllSocialMediaReport = async (location: string, id: number) => {
    const params = getParams(location, id);
    setLoading(true);
    setCanDownload(false);
    try {
      const { data } = await apiClient.post<{ data: any }>(
        "social_media_seva_wise_report_all_regions",
        params,
      );
      setSocialMediaQuestions([
        { id: "contact", short_name: "contact" },
        ...data.data.report.questions,
      ]);
      const updatedHeader = data.data.report.questions.map((q: any) => ({
        header: q.short_name,
        icon: q.icon,
      }));
      const firstRegion = data.data.report.regions[0];
      const idKey = Object.keys(firstRegion).find((k) => k.endsWith("_id"))!;
      const nameKey = Object.keys(firstRegion).find((k) =>
        k.endsWith("_name"),
      )!;
      setTableHeaders([{ header: "Contact" }, ...updatedHeader]);
      const updatedRows = data.data.report.regions.map((region: any) => {
        const row: { [k: string]: any } = {
          name: region[nameKey],
          [idKey.replace("_id", "")]: region[nameKey],
          [idKey]: region[idKey],
          active: region["active"],
          mobile_no: region["mobile_no"],
          guardian_name: region["guardian_name"],
          relation: region["relation"],
        };
        data.data.report.questions.forEach((q: any) => {
          const entry = data.data.report.seva_count.find(
            (s: any) =>
              s?.[idKey] === region?.[idKey] && s.question_id === q.id,
          );
          row[q.short_name] = entry?.seva_count ?? 0;
        });
        return row;
      });
      setAllReport(data.data.report);
      setReport(data.data.report);
      setHeaders(data.data.headers);
      setTableBody(updatedRows);
      setCanDownload(updatedRows.length > 0);
    } catch (error) {
      console.error(error);
      setCanDownload(false);
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = () => {
    const table = tableRef.current;
    if (!canDownload || loading || !table) return;

    try {
      // The rendered table is the single source of truth: headings are already
      // translated and hidden columns/rows are not rendered at all.
      const data = getTableExportData(table);
      if (!data) return;

      const { start, end } = buildDateParams();
      const dateLabel =
        start && end
          ? `${dayjs(start).format("DD-MM-YYYY")}_To_${dayjs(end).format(
              "DD-MM-YYYY",
            )}`
          : dayjs().format("DD-MM-YYYY");
      const fileName = `${url
        .split("_")
        .map((part) => capitalizeWords(part))
        .join("_")}_${dateLabel}`;

      exportToExcel({
        fileName,
        sheetName: capitalizeWords(url.replaceAll("_", " ")),
        ...data,
      });
    } catch (error) {
      handleError(error, "exportExcel");
    }
  };
  const isPdfDownloadAllowed =
    downloadUrl &&
    permission &&
    active_permission?.permissions.includes(permission);
  const isExcelDownloadAllowed =
    excelExportPermission &&
    active_permission?.permissions.includes(excelExportPermission);
  const isDownloadAllowed = isPdfDownloadAllowed || isExcelDownloadAllowed;
  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: capitalizeWords(url.replaceAll("_", " ")),
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <Formik
          innerRef={formRef}
          validationSchema={schema}
          initialValues={{
            dayFilter: "today",
            start: undefined,
            end: undefined,
            report_type: "sevadar",
            sevadar_level: "region",
            social_media_report_type: "pending_report",
          }}
          onSubmit={(values) => {
            setCanDownload(false);
            const { keyLabel, valueLable } = getReportParams[role_region];
            const id =
              active_permission?.region[active_region_index][
                valueLable as keyof Region
              ] ?? "";

            if (values?.social_media_report_type === "all_seva_report") {
              setReport([]);
              getAllSocialMediaReport(keyLabel, Number(id));
              return;
            } else {
              setTableHeaders(header.map((h) => ({ header: h })));
              setTableBody([]);
            }
            if (backTrace.length > 0) {
              const last = backTrace.slice(-1)[0];
              getReport(last.locationType, last.locationId);
            } else {
              getReport(keyLabel, Number(id));
            }
          }}
        >
          {({ handleChange, setFieldValue, values }) => {
            const handleCalendar = () => {
              setFieldValue("dayFilter", "");
              setCanDownload(false);
            };
            const handleSevadarLevelChange = (e: React.ChangeEvent<any>) => {
              handleChange(e);
              setCanDownload(false);
            };
            const handleRadio = (e: React.ChangeEvent<any>) => {
              handleChange(e);
              setFieldValue("dayFilter", e.target.value);
              setFieldValue("start", undefined);
              setFieldValue("end", undefined);
              setCanDownload(false);
            };
            return (
              <Form>
                {isValidUser("book_order_pincode_filter") &&
                  url === "book_order_report" && (
                    <Select
                      name="report_type"
                      options={reportTypes}
                      label={"Pincode Report Type"}
                      placeholder={"Select Pincode Report Type"}
                      value={
                        reportTypes.find(
                          (r) => r.value == values.report_type,
                        ) ?? null
                      }
                      onChange={(e: any) => {
                        setFieldValue("report_type", e.value);
                        setCanDownload(false);
                      }}
                    />
                  )}
                {url !== "s_incomplete_calling_report" && (
                  <Radio
                    name="sevadar_level"
                    options={reportOptions}
                    label={"Report Type"}
                    placeholder={"Select Book Order Report"}
                    onChange={handleSevadarLevelChange}
                    inputClassName="rounded text-green-600 checked:bg-green-600 focus:ring-green-400 focus:border-green-400"
                  />
                )}

                <hr className="h-2 border-0" />
                {["ashram", "country", "state", "district"].includes(
                  role_region,
                ) ? (
                  <DateFilter />
                ) : null}
                <OnFieldChange fields={["end"]} onChange={handleCalendar} />
                <OnFieldChange fields={["start"]} onChange={handleCalendar} />
                <Radio
                  options={
                    role_region === "ashram" || role_region === "country"
                      ? dayFilterOptions
                      : dayFilterOptionsForDistrictSevadar
                  }
                  name="dayFilter"
                  label=""
                  onChange={handleRadio}
                  inputClassName="rounded text-green-600 checked:bg-green-600 focus:ring-green-400 focus:border-green-400"
                />
                <div className="h-2" />
                {url === "social_media_report" && (
                  <Radio
                    label={"Social Media Report Type"}
                    options={[
                      { label: "Pending Report", value: "pending_report" },
                      { label: "All Seva Report", value: "all_seva_report" },
                    ]}
                    name="social_media_report_type"
                    onChange={(e) => {
                      handleChange(e);
                      setFieldValue("social_media_report_type", e.target.value);
                      setCanDownload(false);
                    }}
                    inputClassName="rounded text-green-600 checked:bg-green-600 focus:ring-green-400 focus:border-green-400"
                  />
                )}
                <div className="flex items-center gap-4">
                  <Button
                    type="submit"
                    loading={loading}
                    disabled={loading}
                    className="mx-auto mt-4 w-1/2"
                  >
                    Search
                  </Button>
                  {isDownloadAllowed && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          loading={downloading}
                          disabled={downloading || loading || !canDownload}
                          type="button"
                          className="mx-auto mt-4 w-1/2"
                        >
                          Download
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-24" align="end">
                        {isPdfDownloadAllowed && (
                          <DropdownMenuItem onClick={downloadReport}>
                            PDF
                          </DropdownMenuItem>
                        )}
                        {isExcelDownloadAllowed && (
                          <DropdownMenuItem onClick={exportExcel}>
                            Excel
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </Form>
            );
          }}
        </Formik>
        {firstHeader() == "State" &&
          url == "book_order_report" &&
          active_permission?.permissions.includes("add_boc") && (
            <AddCountryCount onSuccess={onAddCountryCount} />
          )}
        <div>
          {backTrace.length > 0 && (
            <p className="p-2 border-t border-b border-gray-300 mb-4">
              Showing results for
              {backTrace.map((obj, i) => (
                <span
                  key={i}
                  className="text-left capitalize underline"
                  onClick={() => handleBackTraceClick(i)}
                >
                  &nbsp;{obj.currLocationType}({obj.locationName})
                  {i < backTrace.length && " : "}
                </span>
              ))}
            </p>
          )}
        </div>
        <div className="w-full max-h-screen overflow-x-scroll">
          <table ref={tableRef} className="w-full">
            <thead
              style={{ zIndex: 1 }}
              className="w-full sticky top-0 bg-black text-white"
            >
              <tr className="w-full">
                <TableHead
                  title={firstHeader()}
                  down={
                    sortKey === firstHeader()?.toLocaleLowerCase() &&
                    dir === "desc"
                  }
                  onClick={() => changeSort(firstHeader()?.toLocaleLowerCase())}
                />
                {tableHeaders.map(({ header: h, icon }, i) => {
                  if (
                    h.toLowerCase() === "contact" &&
                    firstHeader() !== "Sevadar"
                  ) {
                    return null;
                  }
                  if (
                    h.toLowerCase() === "contact" &&
                    firstHeader() === "Sevadar" &&
                    !showContactIcons
                  ) {
                    return null;
                  }
                  if (
                    url == "social_media_report" &&
                    firstHeader() === "Sevadar" &&
                    h.toLowerCase() == "done"
                  ) {
                    h = "Report Submitted";
                  }
                  if (
                    url == "social_media_report" &&
                    dayDiff > 1 &&
                    ["done", "pending"].includes(h.toLowerCase())
                  ) {
                    return null;
                  }
                  if (
                    url == "social_media_report" &&
                    firstHeader() === "Sevadar" &&
                    ["total", "pending", "percentage"].includes(h.toLowerCase())
                  ) {
                    return null;
                  }
                  if (
                    url == "social_media_report" &&
                    formRef?.current?.values?.dayFilter !== "today" &&
                    formRef?.current?.values?.dayFilter !== "yesterday" &&
                    ["percentage"].includes(h.toLowerCase())
                  ) {
                    return null;
                  }
                  return (
                    <TableHead
                      key={`${h}-${i}`}
                      title={h}
                      subtitle={
                        h === "Report Submitted" && dayDiff > 1
                          ? `(${dayDiff} days)`
                          : undefined
                      }
                      icon={icon}
                      onClick={() => changeSort(body[i])}
                      down={sortKey === body[i] && dir === "desc"}
                    />
                  );
                })}
              </tr>
            </thead>
            <tbody className="w-full">
              {loading ? (
                <tr>
                  <td className="text-center p-5" colSpan={5}>
                    <LoadingSpinner className="w-8 h-8 mx-auto" />
                  </td>
                </tr>
              ) : (
                <React.Fragment>
                  {sortedReport.map((row, i) => (
                    <tr
                      key={i}
                      data-active={row?.active == false ? "false" : "true"}
                      className={cn(
                        "border-b border-blue-300 p-1",
                        row?.active == false
                          ? "bg-red-300"
                          : "odd:bg-blue-100 even:bg-gray-100/50",
                      )}
                    >
                      {row["country"] && (
                        <td
                          className={tableDataClass(i, Boolean(row?.active))}
                          onClick={() => {
                            getReport("state", row["country_id"] as number);
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
                          className={tableDataClass(i, Boolean(row?.active))}
                          onClick={() => {
                            getReport("district", row["state_id"] as number);
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

                      {row["division"] && (
                        <td
                          className={`sticky capitalize left-0 border-r border-blue-300 ${
                            i % 2 == 0 ? "bg-blue-200" : "bg-white"
                          }`}
                          onClick={() => {
                            getReport(
                              "division1",
                              row["division_id"] as number,
                            );
                            addNewBackTrace({
                              locationType: "division1",
                              currLocationType: "Division",
                              locationName: row["division"],
                              locationId: row["division_id"],
                            });
                          }}
                        >
                          {row["division"]}
                        </td>
                      )}
                      {row["district"] && (
                        <td
                          className={tableDataClass(i, Boolean(row?.active))}
                          onClick={() => {
                            getReport("tehsil", row["district_id"] as number);
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
                          className={tableDataClass(i, Boolean(row?.active))}
                          onClick={() => {
                            getReport("sevadar", row["tehsil_id"] as number);
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
                      {row["sevadar"] && (
                        <td className={tableDataClass(i, Boolean(row?.active))}>
                          {row["sevadar"]}
                          {url === "social_media_report" &&
                            ` ${row["relation"]} ${row["guardian_name"]}`}
                        </td>
                      )}
                      {tableBody.length > 0
                        ? socialMediaQuestions.map((q: any) => {
                            if (
                              firstHeader() !== "Sevadar" &&
                              q.short_name === "contact"
                            ) {
                              return null;
                            }
                            if (
                              firstHeader() === "Sevadar" &&
                              q.short_name === "contact" &&
                              showContactIcons
                            ) {
                              return (
                                <ContactCell
                                  mobile_no={row["mobile_no"] as string}
                                />
                              );
                            }
                            if (
                              firstHeader() === "Sevadar" &&
                              q.short_name === "contact" &&
                              !showContactIcons
                            ) {
                              return null;
                            }
                            if (
                              url == "social_media_report" &&
                              firstHeader() === "Sevadar" &&
                              ["total_sevadar", "pending"].includes(
                                q.short_name,
                              )
                            ) {
                              return null;
                            }
                            if (
                              url == "social_media_report" &&
                              firstHeader() === "Sevadar" &&
                              q.short_name == "total_sum" &&
                              dayDiff === 1
                            ) {
                              return (
                                <td key={q.id} className={"text-center"}>
                                  <input
                                    type={"checkbox"}
                                    readOnly
                                    checked={Number(row[q.short_name]) > 0}
                                  />
                                </td>
                              );
                            }
                            return (
                              <td
                                key={q.id}
                                className="border px-4 py-2 text-center"
                              >
                                {row[q.short_name]}
                              </td>
                            );
                          })
                        : body?.map((b, j) => {
                            if (
                              b === "contact" &&
                              row["sevadar"] &&
                              showContactIcons
                            ) {
                              return (
                                <ContactCell
                                  mobile_no={row["mobile_no"] as string}
                                />
                              );
                            }
                            if (
                              url == "social_media_report" &&
                              firstHeader() === "Sevadar" &&
                              [
                                "total_sevadar",
                                "pending",
                                "percentage",
                              ].includes(b)
                            ) {
                              return null;
                            }
                            if (
                              url == "social_media_report" &&
                              firstHeader() !== "Sevadar" &&
                              ["total_sum", "pending"].includes(b) &&
                              dayDiff > 1
                            ) {
                              return null;
                            }
                            if (
                              url == "social_media_report" &&
                              formRef?.current?.values?.dayFilter !== "today" &&
                              formRef?.current?.values?.dayFilter !==
                                "yesterday" &&
                              ["percentage"].includes(b)
                            ) {
                              return null;
                            }
                            if (
                              url == "social_media_report" &&
                              (formRef?.current?.values?.dayFilter ===
                                "today" ||
                                formRef?.current?.values?.dayFilter ===
                                  "yesterday") &&
                              ["percentage"].includes(b)
                            ) {
                              return (
                                <td key={j} className={"text-center"}>
                                  {row[b]}
                                </td>
                              );
                            }
                            if (
                              url == "social_media_report" &&
                              firstHeader() === "Sevadar" &&
                              b == "total_sum" &&
                              dayDiff === 1
                            ) {
                              return (
                                <td key={j} className={"text-center"}>
                                  <input
                                    type={"checkbox"}
                                    readOnly
                                    checked={Number(row[b]) > 0}
                                  />
                                </td>
                              );
                            }
                            if (b !== "contact") {
                              return (
                                <td key={j} className={"text-center"}>
                                  {row[b]}
                                </td>
                              );
                            }
                          })}
                    </tr>
                  ))}
                </React.Fragment>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

const Report = () => {
  const router = useRouter();
  if (!router.query.url) {
    return null;
  }
  return (
    <ReportComponent
      url={router.query.url as string}
      lang={router.locale || "en"}
    />
  );
};

const ContactCell = ({ mobile_no }: { mobile_no: string }) => {
  const value = mobile_no.toString().replace("+", "") ?? undefined;
  return (
    <td className="text-center">
      <div className="px-2 gap-4 flex justify-center items-center">
        <a href={`tel:+${value}`}>
          <FiPhoneCall />
        </a>
        <a
          href={`https://wa.me/${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-row"
        >
          <IoLogoWhatsapp />
        </a>
      </div>
    </td>
  );
};

const TableHead = ({
  down = false,
  onClick,
  title,
  subtitle,
  icon,
}: {
  down?: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
  icon?: string;
}) => {
  const { t: tr } = useTranslation("report");
  return (
    <th className="px-2 text-center w-24" onClick={onClick}>
      {icon && (
        <Image
          height={20}
          width={20}
          style={{ width: "20px", height: "auto" }}
          src={socialImages[icon]}
          alt={`facebook_satsang_seva_alt_image`}
          className="cursor-pointer max-h-5 mx-auto mt-1 w-auto h-auto"
          priority
        />
      )}
      <p>{tr(title)}</p>
      {subtitle && <p>{subtitle}</p>}
      <p className={down ? "rotate-180 text-xs" : "text-xs"}>▲</p>
    </th>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "report"])),
    },
  };
};

export default Report;
