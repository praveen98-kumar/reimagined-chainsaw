import Button from "@/components/Button";
import DateFilter from "@/components/DateFilter";
import Radio from "@/components/input/Radio";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { OnFieldChange } from "@/components/UserwiseDropdown";
import useValidUser from "@/hooks/useValidUser";
import { buildDateRangeParams, getFeedbackReport } from "@/http/pradarshani";
import { dayFilterOptions } from "@/pages/report";
import { cn, objectWithValues } from "@/shared/functions/utils";
import { NextApplicationPage } from "@/shared/interfaces/app";
import {
  PradarshaniReportFilters,
  PradarshaniReportRow,
} from "@/shared/interfaces/pradarshani";
import { Form, Formik, FormikProps } from "formik";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Option } from "@/shared/interfaces/option";

type Level = "country" | "state" | "district";

interface DateValues {
  dayFilter: string;
  start: Date | null;
  end: Date | null;
  report_type: string;
}

interface BreadcrumbItem {
  level: Level;
  name: string;
  filters: PradarshaniReportFilters;
}

const nextLevel: Record<Level, Level | null> = {
  country: "state",
  state: "district",
  district: null,
};
const reportTypeOptions: Array<Option> = [
  { label: "Region", value: "region" },
  { label: "Ashram", value: "ashram" },
];
const PradarshaniReportPage: NextApplicationPage = () => {
  const { t } = useTranslation("pradarshani");
  const canView = useValidUser("feedback_list");

  const formRef = useRef<FormikProps<DateValues>>(null);
  const [level, setLevel] = useState<Level>("country");
  const [rows, setRows] = useState<PradarshaniReportRow[]>([]);
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLevel = useCallback(
    async (targetLevel: Level, filters: PradarshaniReportFilters) => {
      setLoading(true);
      try {
        const values = formRef.current?.values ?? {
          dayFilter: "",
          start: null,
          end: null,
          report_type: "region",
        };
        const dateParams = buildDateRangeParams(
          values.dayFilter,
          values.start,
          values.end,
        );
        const data = await getFeedbackReport({ ...filters, ...dateParams });
        setRows(data.report);
        setLevel(targetLevel);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleRowClick = (row: PradarshaniReportRow) => {
    if (formRef.current?.values?.report_type == "ashram") return;
    const target = nextLevel[level];
    if (!target) return;
    const filters: PradarshaniReportFilters =
      level === "country" ? { country_id: row.id } : { state_id: row.id };
    setBreadcrumb((prev) => [
      ...prev,
      { level: target, name: row.name, filters },
    ]);
    fetchLevel(target, filters);
  };

  useEffect(() => {
    if (canView) {
      fetchLevel("country", {});
    }
  }, [canView, fetchLevel]);

  const handleBreadcrumbClick = (index: number) => {
    if (index < 0) {
      setBreadcrumb([]);
      fetchLevel("country", {});
      return;
    }
    const crumb = breadcrumb[index];
    setBreadcrumb(breadcrumb.slice(0, index + 1));
    fetchLevel(crumb.level, crumb.filters);
  };

  return (
    <Layout headerProps={{ isBack: true, heading: t("report.title") }}>
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        {!canView ? (
          <div className="text-center">Access denied</div>
        ) : (
          <React.Fragment>
            <Formik<DateValues>
              innerRef={formRef}
              initialValues={{
                dayFilter: "",
                start: null,
                end: null,
                report_type: "region",
              }}
              onSubmit={(values) => {
                setBreadcrumb([]);
                fetchLevel("country", objectWithValues(values));
              }}
            >
              {({ setFieldValue }) => {
                const handleCalendar = () => setFieldValue("dayFilter", "");
                const handleRadio = (e: React.ChangeEvent<any>) => {
                  setFieldValue("dayFilter", e.target.value);
                  setFieldValue("start", null);
                  setFieldValue("end", null);
                };
                return (
                  <Form>
                    <Radio
                      options={reportTypeOptions}
                      name="report_type"
                      label="Type"
                      onChange={(e) => {
                        setFieldValue("report_type", e.target.value);
                      }}
                      inputClassName="rounded text-green-600 checked:bg-green-600 focus:ring-green-400 focus:border-green-400"
                    />
                    <DateFilter />
                    <OnFieldChange fields={["end"]} onChange={handleCalendar} />
                    <OnFieldChange
                      fields={["start"]}
                      onChange={handleCalendar}
                    />
                    <Radio
                      options={dayFilterOptions}
                      name="dayFilter"
                      label=""
                      onChange={handleRadio}
                      inputClassName="rounded text-green-600 checked:bg-green-600 focus:ring-green-400 focus:border-green-400"
                    />
                    <Button
                      type="submit"
                      loading={loading}
                      disabled={loading}
                      className="mx-auto mt-4"
                    >
                      {t("list.search")}
                    </Button>
                  </Form>
                );
              }}
            </Formik>
            {formRef.current?.values.report_type === "region" && (
              <p className="text-sm">
                <span
                  className="underline cursor-pointer"
                  onClick={() => handleBreadcrumbClick(-1)}
                >
                  {t("report.country")}
                </span>
                {breadcrumb.map((crumb, i) => (
                  <span key={i}>
                    {" > "}
                    <span
                      className="underline cursor-pointer"
                      onClick={() => handleBreadcrumbClick(i)}
                    >
                      {crumb.name}
                    </span>
                  </span>
                ))}
              </p>
            )}

            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-black text-white">
                  <tr>
                    <th className="px-2 py-1 text-left">
                      {formRef.current?.values.report_type == "region"
                        ? t(`report.${level}`)
                        : "Ashram"}
                    </th>
                    <th className="px-2 py-1 text-right">
                      {t("report.count")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={2} className="text-center p-5">
                        <LoadingSpinner className="w-8 h-8 mx-auto" />
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr
                        key={row.id}
                        className={cn(
                          "border-b odd:bg-blue-100 even:bg-gray-100/50",
                          level !== "district" && "cursor-pointer",
                        )}
                        onClick={() => handleRowClick(row)}
                      >
                        <td className="px-2 py-1">{row.name}</td>
                        <td className="px-2 py-1 text-right">{row.count}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </React.Fragment>
        )}
      </div>
    </Layout>
  );
};

export default PradarshaniReportPage;

PradarshaniReportPage.requireAuth = true;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "pradarshani"])),
    },
  };
};
