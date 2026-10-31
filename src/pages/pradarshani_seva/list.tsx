import Button from "@/components/Button";
import DateFilter from "@/components/DateFilter";
import Radio from "@/components/input/Radio";
import Select from "@/components/input/Select";
import TextInput from "@/components/input/TextInput";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { OnFieldChange } from "@/components/UserwiseDropdown";
import useValidUser from "@/hooks/useValidUser";
import {
  useCenters,
  useCountries,
  useDistricts,
  useStates,
} from "@/hooks/useLocationAPI";
import {
  buildDateRangeParams,
  buildPradarshaniLocationFilter,
  getFeedbackList,
} from "@/http/pradarshani";
import { dayFilterOptions } from "@/pages/report";
import {
  downloadFile,
  formatDate,
  objectWithValues,
} from "@/shared/functions/utils";
import { NextApplicationPage } from "@/shared/interfaces/app";
import { FeedbackRow } from "@/shared/interfaces/pradarshani";
import { Form, Formik, FormikProps, useFormikContext } from "formik";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const LIMIT = 10;

interface FilterValues {
  country_id: number | null;
  state_id: number | null;
  district_id: number | null;
  namdan_center_id: number | null;
  mobile_no: string;
  dayFilter: string;
  start: Date | null;
  end: Date | null;
}

const initialFilters: FilterValues = {
  country_id: null,
  state_id: null,
  district_id: null,
  namdan_center_id: null,
  mobile_no: "",
  dayFilter: "",
  start: null,
  end: null,
};

const buildParams = (values: FilterValues, page: number) => {
  return objectWithValues({
    ...buildPradarshaniLocationFilter(values),
    namdan_center_id: values.namdan_center_id ?? undefined,
    mobile_no: values.mobile_no,
    ...buildDateRangeParams(values.dayFilter, values.start, values.end),
    page,
    limit: LIMIT,
  });
};

const FilterFields = ({ t }: { t: (key: string) => string }) => {
  const { values, setFieldValue } = useFormikContext<FilterValues>();
  const { data: countries } = useCountries();
  const { data: states } = useStates(values.country_id ?? undefined);
  const { data: districts } = useDistricts(values.state_id ?? undefined);
  const { data: centers } = useCenters(values.district_id ?? undefined);
  const handleCalendar = () => setFieldValue("dayFilter", "");
  const handleRadio = (e: React.ChangeEvent<any>) => {
    setFieldValue("dayFilter", e.target.value);
    setFieldValue("start", null);
    setFieldValue("end", null);
  };

  return (
    <React.Fragment>
      <Select
        name="country_id"
        label={t("form.country")}
        options={countries}
        isClearable
        value={countries?.find((c) => c.value === values.country_id) ?? null}
        onChange={(opt: any) => setFieldValue("country_id", opt?.value ?? null)}
      />
      <OnFieldChange
        fields={["country_id"]}
        onChange={() => {
          setFieldValue("state_id", null);
          setFieldValue("district_id", null);
          setFieldValue("namdan_center_id", null);
        }}
      />
      <Select
        name="state_id"
        label={t("form.state")}
        options={states}
        isClearable
        value={states?.find((s) => s.value === values.state_id) ?? null}
        onChange={(opt: any) => setFieldValue("state_id", opt?.value ?? null)}
      />
      <OnFieldChange
        fields={["state_id"]}
        onChange={() => {
          setFieldValue("district_id", null);
          setFieldValue("namdan_center_id", null);
        }}
      />
      <Select
        name="district_id"
        label={t("form.district")}
        options={districts}
        isClearable
        value={districts?.find((d) => d.value === values.district_id) ?? null}
        onChange={(opt: any) =>
          setFieldValue("district_id", opt?.value ?? null)
        }
      />
      <OnFieldChange
        fields={["district_id"]}
        onChange={() => setFieldValue("namdan_center_id", null)}
      />
      <Select
        name="namdan_center_id"
        label={t("form.namdan_center")}
        options={centers}
        isClearable
        value={
          centers?.find((c) => c.value === values.namdan_center_id) ?? null
        }
        onChange={(opt: any) =>
          setFieldValue("namdan_center_id", opt?.value ?? null)
        }
      />
      <TextInput name="mobile_no" label={t("form.mobile_no")} />
      <DateFilter />
      <OnFieldChange fields={["end"]} onChange={handleCalendar} />
      <OnFieldChange fields={["start"]} onChange={handleCalendar} />
      <Radio
        options={dayFilterOptions}
        name="dayFilter"
        label=""
        onChange={handleRadio}
        inputClassName="rounded text-green-600 checked:bg-green-600 focus:ring-green-400 focus:border-green-400"
      />
    </React.Fragment>
  );
};

const PradarshaniFeedbackListPage: NextApplicationPage = () => {
  const { t } = useTranslation("pradarshani");
  const canExport = useValidUser("feedback_export");
  const canView = useValidUser(["feedback_list", "feedback_export"]);

  const formRef = useRef<FormikProps<FilterValues>>(null);
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchFeedback = useCallback(async (nextPage: number) => {
    const values = formRef.current?.values ?? initialFilters;
    setLoading(true);
    try {
      const data = await getFeedbackList(buildParams(values, nextPage));
      setRows(data.feedback_list);
      setTotal(data.total);
      setPage(nextPage);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleExport = () => {
    const values = formRef.current?.values ?? initialFilters;
    downloadFile({
      endPoint: "pradarshani_feedback",
      params: { ...buildParams(values, 1), limit: 0, response_type: "csv" },
      method: "GET",
      fileName: "feedback.csv",
      showToast: true,
    });
  };

  if (!canView) {
    return (
      <Layout headerProps={{ isBack: true, heading: t("list.title") }}>
        <div className="p-4 text-center">Access denied</div>
      </Layout>
    );
  }

  return (
    <Layout headerProps={{ isBack: true, heading: t("list.title") }}>
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <Formik
          innerRef={formRef}
          initialValues={initialFilters}
          onSubmit={() => fetchFeedback(1)}
        >
          <Form>
            <FilterFields t={t} />
            <div className="flex items-center gap-4">
              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                className="mx-auto mt-4"
              >
                {t("list.search")}
              </Button>
              {canExport && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleExport}
                  className="mx-auto mt-4"
                >
                  {t("list.export")}
                </Button>
              )}
            </div>
          </Form>
        </Formik>

        {loading ? (
          <LoadingSpinner className="w-8 h-8 mx-auto" />
        ) : rows.length === 0 ? (
          <p className="text-center py-4">{t("list.empty")}</p>
        ) : (
          <React.Fragment>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-black text-white">
                  <tr>
                    <th className="px-2 py-1">{t("form.name")}</th>
                    <th className="px-2 py-1">{t("form.rating")}</th>
                    <th className="px-2 py-1">{t("form.remark")}</th>
                    <th className="px-2 py-1">{t("form.mobile_no")}</th>
                    <th className="px-2 py-1">{t("form.ashram")}</th>
                    <th className="px-2 py-1">{t("form.locality")}</th>
                    <th className="px-2 py-1">{t("report.country")}</th>
                    <th className="px-2 py-1">{t("report.state")}</th>
                    <th className="px-2 py-1">{t("report.district")}</th>
                    <th className="px-2 py-1">Created Date</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="odd:bg-blue-100 even:bg-gray-100/50 border-b"
                    >
                      <td className="px-2 py-1">{row.name}</td>
                      <td className="px-2 py-1 text-center">{row.rating}</td>
                      <td className="px-2 py-1">{row.remark}</td>
                      <td className="px-2 py-1">{row.mobile_no}</td>
                      <td className="px-2 py-1 capitalize">
                        {row.namdan_center_name}
                      </td>
                      <td className="px-2 py-1">{row.locality}</td>
                      <td className="px-2 py-1">{row.country?.name}</td>
                      <td className="px-2 py-1">{row.state?.name}</td>
                      <td className="px-2 py-1">{row.district?.name}</td>
                      <td className="px-2 py-1">
                        {row.created_at ? formatDate(row.created_at) : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-2">
              <Button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => fetchFeedback(page - 1)}
              >
                {t("list.prev")}
              </Button>
              <p>
                {`${(page - 1) * LIMIT + 1}-${Math.min(
                  page * LIMIT,
                  total,
                )} / ${total}`}
              </p>
              <Button
                type="button"
                disabled={page * LIMIT >= total || loading}
                onClick={() => fetchFeedback(page + 1)}
              >
                {t("list.next")}
              </Button>
            </div>
          </React.Fragment>
        )}
      </div>
    </Layout>
  );
};

export default PradarshaniFeedbackListPage;

PradarshaniFeedbackListPage.requireAuth = true;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "pradarshani"])),
    },
  };
};
