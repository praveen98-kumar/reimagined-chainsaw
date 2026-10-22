import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { downloadPageParams } from "@/constants/app";
import Layout from "@/components/Layout";
import Button from "@/components/Button";
import { Formik, Form, Field } from "formik";
import ButtonTabs from "@/components/ButtonTabs";
import * as Yup from "yup";
import {
  objectWithValues,
  downloadFile,
  getOptionArray,
  capitalizeWords,
} from "@/shared/functions/utils";
import dayjs from "dayjs";
import UserwiseDropdown from "@/components/UserwiseDropdown";
import DateFilter from "@/components/DateFilter";
import { useTranslation } from "react-i18next";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import apiClient from "@/http/index";
import { Option } from "@/shared/interfaces/option";
import { useAppSelector } from "@/redux/store";

const tabs = ["regular", "emergency"];

const schema = Yup.object({
  start: Yup.date().nullable(),
  end: Yup.date().max(new Date()).nullable(),
  book_ids: Yup.array().of(Yup.string()),
  emergency: Yup.string(),
  status: Yup.array().of(Yup.string()),
});

type Schema = Yup.InferType<typeof schema>;

const DownloadByUrl = ({ url }: { url: string }) => {
  const { t: tc } = useTranslation("common");
  const { t: th } = useTranslation("heading");
  const [activeIndex, setActiveIndex] = useState(0);
  const [books, setBooks] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAppSelector((s) => s.auth);

  const {
    showTab,
    heading,
    url: apiUrl,
    params,
    showLocationFilters,
    showInternational,
    downloadFileName,
  } = downloadPageParams[url];

  const getBooks = useCallback(async () => {
    try {
      const { data } = await apiClient.get("books?short_list=1");
      const temp = getOptionArray(data.data, "title", "id");
      setBooks(temp);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleSubmit = async (values: Schema) => {
    let data: any = {
      ...(values.start && {
        start: dayjs(values.start).startOf("day").toISOString(),
      }),
      // ...(user?.id == 11849 && {
      //   start: dayjs(new Date(2023, 5, 30)).startOf("day").toISOString(),
      // }),
      ...(values.start && {
        start: dayjs(values.start).startOf("day").toISOString(),
      }),
      ...(values.end && {
        end: dayjs(values.end).endOf("day").toISOString(),
      }),
      ...(values.book_ids && values.book_ids.length > 0,
      {
        book_ids:
          values?.book_ids?.length !== books.length
            ? values?.book_ids?.map((v: any) => Number(v))
            : undefined,
      }),
      ...(showInternational && { international: 1 }),
      ...(params && params),
      ...(values.status?.length == 1 &&
        url !== "download_book_complain" && { status: values.status[0] }),
      ...(url === "download_book_complain" && { from_complain: 1 }),
    };
    data = objectWithValues({ ...values, ...data });
    if (
      url !== "download_book_complain" &&
      url !== "download_international_orders"
    ) {
      data["emergency"] = values.emergency == "regular" ? 0 : 1;
    } else {
      delete data["emergency"];
    }
    let dates = dayjs(new Date()).format("DD/MM/YYYY");
    if (values.start) {
      dates =
        "From " +
        dayjs(values.start).startOf("day").format("DD/MM/YYYY") +
        " To " +
        dayjs(values.end).endOf("day").format("DD/MM/YYYY");
    }
    setLoading(true);
    try {
      const fileName = `${
        downloadFileName + capitalizeWords(values.emergency || "")
      }-${dates}`;
      await downloadFile({ endPoint: apiUrl, params: data, fileName });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (apiUrl === "download_orders") {
      getBooks();
    }
  }, [apiUrl]);

  return (
    <Layout headerProps={{ isBack: true, heading: th(heading) ?? heading }}>
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        {showTab && (
          <ButtonTabs
            handleClick={() => {}}
            items={tabs.map((t, i) => ({
              label: tc(t) ?? t,
              active: activeIndex == i,
              handleClick: () => setActiveIndex(i),
            }))}
          />
        )}
        <Formik
          initialValues={{
            start: null,
            end: null,
            state: 0,
            district: 0,
            tehsil: 0,
            country: 0,
            book_ids: [],
            emergency: "regular",
            status: [],
          }}
          validationSchema={schema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, setFieldValue }) => (
            <Form>
              <div
                className="my-2 grid grid-cols-2 gap-4"
                role="group"
                aria-labelledby="checkbox-group"
              >
                {heading === "download_national_orders" &&
                  tabs.map((b) => (
                    <label key={b}>
                      <Field
                        className="rounded"
                        type="radio"
                        name="emergency"
                        value={b}
                      />
                      <span className="ml-2 capitalize">{b}</span>
                    </label>
                  ))}
              </div>
              <DateFilter
                properties={{
                  start: {
                    maxDate: new Date(),
                  },
                  end: {
                    maxDate: new Date(),
                  },
                }}
              />
              {apiUrl === "download_orders" && (
                <div className="my-2 grid grid-cols-2 gap-4" role="group">
                  {books.map((b) => (
                    <label key={b.label}>
                      <Field
                        className="rounded"
                        type="checkbox"
                        name="book_ids"
                        value={b.value.toString()}
                      />
                      <span className="ml-2">{b.label}</span>
                    </label>
                  ))}
                </div>
              )}
              <UserwiseDropdown
                conditionalFields={{
                  country_id: showLocationFilters,
                  state_id: showLocationFilters,
                  district_id: showLocationFilters && !showInternational,
                  tehsil_id: showLocationFilters && !showInternational,
                }}
                useHirarchy={false}
              />

              <div
                className="my-2 grid grid-cols-2 gap-4"
                role="group"
                aria-labelledby="checkbox-group"
              >
                {![
                  "download_national_orders",
                  "download_international_orders",
                  "download_book_complain",
                ].includes(heading) &&
                  ["pending", "completed"].map((b) => (
                    <label key={b}>
                      <Field
                        className="rounded"
                        type="checkbox"
                        name="status"
                        value={b}
                      />
                      <span className="ml-2 capitalize">{b}</span>
                    </label>
                  ))}
              </div>
              <Button
                type="submit"
                className="mx-auto mt-4 w-1/2"
                loading={loading}
                disabled={loading}
              >
                {tc("download")}
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </Layout>
  );
};

const Download = () => {
  const router = useRouter();

  if (!router.query.url) {
    return null;
  }
  return <DownloadByUrl url={router.query.url as string} />;
};

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "heading"])),
    },
  };
};

export default Download;
