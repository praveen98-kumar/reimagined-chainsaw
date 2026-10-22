import { reportTypes } from "@/constants/reports";
import { Form, Formik } from "formik";
import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import Button from "@/components/Button";
import Radio from "@/components/input/Radio";
import Select from "@/components/input/Select";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import Modal, { type ModalProps } from "@/components/modal/Modal";
import apiClient from "@/http/index";
import { useAppSelector } from "@/redux/store";
import { getDateFilters } from "@/shared/functions/filter";
import { getRegionValue } from "@/shared/functions/location";
import { splitLongMessage } from "@/shared/functions/message";
import { capitalizeWords, cn, copyToClipboard } from "@/shared/functions/utils";
import type { NextApplicationPage } from "@/shared/interfaces/app";
import type { Option } from "@/shared/interfaces/option";
import {
  all_seva_message_template,
  sevawise_report_template,
  update_pending_report_template,
  update_pending_report_upper_template,
} from "../../../utils/social_whatsapp_msg.utils";
import type { SocialMediaQuestion } from "./update";

const schema = Yup.object({
  status: Yup.array().of(Yup.string()),
  sevedar_level: Yup.string(),
});

const commonStatusOptions = [
  {
    label: "Report Pending List",
    value: "seva_pending",
  },
  { label: "All Platform Report", value: "all_seva_report" },
  {
    label: "Platform wise Report",
    value: "sevawise_report",
  },
];

const dayFilterOptions = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
];

const statusOptions: Record<string, Array<Option>> = {
  ashram: [...commonStatusOptions],
  tehsil: [...commonStatusOptions],
  district: [...commonStatusOptions],
  division: [...commonStatusOptions],
  state: [...commonStatusOptions],
  country: [...commonStatusOptions],
};

const formatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export const toDateString = (
  date: Date | string | number = new Date()
): string => {
  const parsedDate = date instanceof Date ? date : new Date(date);
  return formatter.format(parsedDate);
};

interface ChunkState {
  content: string;
  chunks: string[];
  expanded: boolean;
  copiedIndices: number[];
}

interface CopyShareActionButtonsProps extends React.ComponentProps<"div"> {
  onCopy: () => void;
  onShare: () => void;
  copyTitle?: string;
  shareTitle?: string;
}

const CopyShareActionButtons: React.FC<CopyShareActionButtonsProps> = ({
  className,
  onCopy,
  onShare,
  copyTitle,
  shareTitle,
  ...props
}) => {
  return (
    <div className={cn("flex gap-4 items-center", className)} {...props}>
      <Button
        className="text-sm py-1 px-2 min-w-[60px] bg-blue-200 focus:bg-blue-400 text-black"
        onClick={onCopy}
      >
        {copyTitle ?? "Copy"}
      </Button>
      <Button
        className="text-sm py-1 px-2 min-w-[60px] bg-indigo-200 focus:bg-indigo-400 text-black"
        onClick={onShare}
      >
        {shareTitle ?? "Share"}
      </Button>
    </div>
  );
};

const SocialSevaWhatsAppReport: NextApplicationPage = () => {
  const { t: tr } = useTranslation("report");
  const [dayFilter, setDayFilter] = useState<"today" | "yesterday">("today");
  const [loading, setLoading] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [socialSevaOptions, setSocialSevaOptions] = useState<Option[]>([]);
  const [loaded, setLoaded] = useState<string[]>([]);
  const formRef = useRef<any>(null);
  const { active_permission, active_region_index } = useAppSelector(
    (s) => s.auth
  );
  const [chunkStates, setChunkStates] = useState<Record<string, ChunkState>>(
    {}
  );
  const roleRegion = active_permission?.role_region as string;
  const [roleStatusOptions] = useState<Option[]>(
    statusOptions[roleRegion] ?? []
  );
  const dateString = useMemo(() => {
    const date = new Date();
    if (dayFilter === "yesterday") {
      date.setDate(date.getDate() - 1);
    }
    return toDateString(date);
  }, [dayFilter]);
  const messageParams = {
    region: roleRegion,
    location:
      //@ts-expect-error
      active_permission?.region[active_region_index][`${roleRegion}_name`],
    date: dateString,
  };

  const transformReportDataIntoText = (data: any, status: string) => {
    const selectedRecord = Array.isArray(data)
      ? data.map((t: any) => ({
          name: t.sevadar_name,
          location: t.tehsil_name,
          guardian_name: t?.guardian_name,
          relation: t?.relation,
        }))
      : data;
    const msgParams = {
      ...messageParams,
      inputs: selectedRecord,
    };
    if (status === "all_seva_report") {
      return all_seva_message_template(msgParams);
    }
    if (
      roleRegion === "state" ||
      roleRegion === "division" ||
      roleRegion === "country" ||
      roleRegion === "ashram"
    ) {
      return update_pending_report_upper_template(msgParams);
    }
    if (roleRegion === "tehsil" || roleRegion === "district") {
      return update_pending_report_template(msgParams);
    }
    return { header: "", body: "", footer: "" };
  };

  const getReportContent = (reportKey: string, chunkIndex?: number): string => {
    const chunkState = chunkStates[reportKey];
    if (!chunkState?.chunks) return "";
    const chunkStateAtIndex =
      chunkState.chunks.find((_, idx) => chunkIndex === idx) ?? undefined;
    return chunkIndex !== undefined
      ? chunkStateAtIndex
        ? chunkStateAtIndex
        : chunkState.chunks[0]
      : chunkState.content;
  };

  const copy = (reportKey: string, chunkIndex?: number) => {
    const msg = getReportContent(reportKey, chunkIndex);
    if (!msg) {
      return;
    }
    copyToClipboard(msg);
  };

  const share = async (reportKey: string, chunkIndex?: number) => {
    const msg = getReportContent(reportKey, chunkIndex);
    if (!msg) {
      return;
    }
    await navigator.share({ text: msg });
  };

  const getReportKey = (status: string, dayFilter: string) => {
    return `${status}_${dayFilter}`;
  };

  const getReport = async (status: string, dayFilter: string) => {
    const params: Record<string, any> = getDateFilters(dayFilter);
    let url: string = "social_media_pending_report";

    if (status === "seva_pending") {
      url = "social_media_pending_report";
    } else if (status === "all_seva_report") {
      url = "social_media_all_seva_report";
    } else {
      setIsOpenModal(true);
      return;
    }
    setLoading(true);
    try {
      const { data } = await apiClient.post(url, {
        ...params,
        ...formRef?.current?.values,
        ...getRegionValue(active_permission, active_region_index),
      });
      const { header, body, footer } = transformReportDataIntoText(
        data.data,
        status
      );
      const chunks = splitLongMessage(body);
      const chunksWithHeaderFooter = chunks.map(
        (chunk, idx) =>
          `Part ${idx + 1} of ${chunks.length}\n\n${header}${chunk}${footer}`
      );
      const reportKey = getReportKey(status, dayFilter);
      const newChunkState: ChunkState = {
        chunks: chunksWithHeaderFooter,
        expanded: chunks.length > 1,
        copiedIndices: [],
        content: header + body + footer,
      };
      setChunkStates((prev) => ({ ...prev, [reportKey]: newChunkState }));
      setLoaded((prev) =>
        prev.includes(`${status}_${dayFilter}`)
          ? prev
          : [...prev, `${status}_${dayFilter}`]
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const sevawiseReportParams = {
    ...getDateFilters(dayFilter),
    ...formRef?.current?.values,
    ...getRegionValue(active_permission, active_region_index),
  };

  const getAllSocialMediaSeva = useCallback(async () => {
    try {
      const { data } = await apiClient.get("social_media_question");
      const options = ((data?.data as SocialMediaQuestion[]) || []).map(
        (item) =>
          ({
            label: capitalizeWords(item.question),
            value: item.id,
          } as Option)
      );
      setSocialSevaOptions(options);
    } catch (error) {
      console.error("Error getting social seva data: ", error);
    }
  }, []);

  useEffect(() => {
    getAllSocialMediaSeva();
  }, [getAllSocialMediaSeva]);

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: "Social Media Whatsapp Report",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <div>
          <p>Date Range</p>

          <div className="flex">
            {dayFilterOptions.map((option) => (
              <label key={option.value} className="flex w-1/2 gap-2">
                <input
                  type="radio"
                  name="dateRange"
                  value={option.value}
                  checked={dayFilter === option.value}
                  onChange={() =>
                    setDayFilter(option.value as "today" | "yesterday")
                  }
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
        <Formik
          initialValues={{ sevadar_level: "sevadar" }}
          innerRef={formRef}
          validationSchema={schema}
          onSubmit={() => {}}
        >
          {({ setFieldValue, handleChange }) => {
            const handleSevadarLevelRadio = (e: React.ChangeEvent<any>) => {
              handleChange(e);
              setFieldValue("sevadar_level", e.target.value);
              setLoaded([]);
            };
            return (
              <Form>
                {active_permission &&
                  active_permission?.role_region == "state" && (
                    <Radio
                      options={reportTypes}
                      name="sevadar_level"
                      label="Report Type"
                      onChange={handleSevadarLevelRadio}
                      inputClassName="rounded text-green-600 checked:bg-green-600 focus:ring-green-400 focus:border-green-400"
                    />
                  )}
              </Form>
            );
          }}
        </Formik>
        <div className="w-full flex items-center gap-4">
          <div className="mt-2 flex flex-col w-full">
            {roleStatusOptions.map(({ label, value }, i) => {
              const reportKey = getReportKey(value.toString(), dayFilter);
              const chunkState = chunkStates[reportKey];
              const hasMultipleChunks =
                chunkState?.chunks && chunkState.chunks.length > 1;
              const isExpanded = chunkState?.expanded || false;
              return (
                <div
                  key={i.toString()}
                  className={cn(
                    "leading-4 flex py-1 justify-between mb-3 border-b border-gray-500",
                    hasMultipleChunks ? "items-start" : "items-center"
                  )}
                >
                  <p className="font-semibold text-lg">{tr(label)}</p>
                  <div className="flex gap-4 items-center">
                    {loaded.includes(reportKey) ? (
                      <div className="flex items-start space-x-1">
                        {!hasMultipleChunks ? (
                          <CopyShareActionButtons
                            onCopy={() => copy(reportKey)}
                            onShare={() => share(reportKey)}
                          />
                        ) : isExpanded ? (
                          <div className="space-y-2">
                            {chunkState.chunks.map((_, index) => (
                              <CopyShareActionButtons
                                key={`chunk_${reportKey}_${index.toString()}`}
                                onCopy={() => copy(reportKey, index)}
                                onShare={() => share(reportKey, index)}
                                copyTitle={`Copy ${index + 1}`}
                                shareTitle={`Share ${index + 1}`}
                              />
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <Button
                        disabled={
                          loading || loaded.includes(`${value}_${dayFilter}`)
                        }
                        onClick={() => getReport(value.toString(), dayFilter)}
                        className="text-sm py-1 px-2 min-w-[60px]"
                      >
                        Get Report
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {loading ? <LoadingSpinner className="mx-auto mt-6 w-6 h-6" /> : null}
        <SevaWiseReportModal
          params={sevawiseReportParams}
          msgParams={messageParams}
          show={isOpenModal}
          onClose={() => setIsOpenModal(false)}
          onConfirm={() => {}}
          withCloseHandler={false}
          options={socialSevaOptions}
        />
      </div>
    </Layout>
  );
};

SocialSevaWhatsAppReport.requireAuth = true;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "report"])),
    },
  };
};

export default SocialSevaWhatsAppReport;

export interface SevaWiseReportDateType {
  active: boolean;
  seva_count: number;
  seva_sum: number;
  sevadar_id?: number;
  sevadar_name?: string;
  district_id?: number;
  district_name?: string;
  division_id?: number;
  division_name?: string;
}
const SevaWiseReportModal = (
  props: ModalProps & {
    options: Option[];
    params: any;
    msgParams: any;
  }
) => {
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<any>(null);
  const [chunkStates, setChunkStates] = useState<Record<string, ChunkState>>(
    {}
  );
  const makeMsgTemplate = (
    inputs: SevaWiseReportDateType[] = [],
    question: SocialMediaQuestion | undefined
  ) => {
    return sevawise_report_template({
      region: props.msgParams.region,
      location: props.msgParams.location,
      date: props.msgParams.date,
      inputs,
      icon: question?.icon || "facebook",
      question: question?.question || "",
    });
  };

  const getSevaWiseReport = async (values: any) => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.post("social_media_report_seva_wise", {
        ...props.params,
        ...values,
      });
      const reportKey = `${values?.question_id}_${props.params.dayFilter}`;

      const { header, body, footer } = makeMsgTemplate(
        data?.data?.[0]?.report,
        data?.data?.[0]?.question ?? undefined
      );
      const chunks = splitLongMessage(body).map(
        (c) => `${header}${c}${footer}`
      );
      const newChunkState: ChunkState = {
        chunks,
        expanded: chunks.length > 1,
        copiedIndices: [],
        content: header + body + footer,
      };
      setChunkStates((prev) => ({ ...prev, [reportKey]: newChunkState }));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal modalClasses="h-96" {...props}>
      <div className="space-y-8 mb-8">
        <Formik
          innerRef={formRef}
          initialValues={{
            question_id: 3,
          }}
          onSubmit={getSevaWiseReport}
        >
          {({ values, setFieldValue }) => {
            const reportKey = `${values?.question_id}_${props.params.dayFilter}`;
            const chunkState = chunkStates[reportKey];
            const hasMultipleChunks =
              chunkState?.chunks && chunkState.chunks.length > 1;
            return (
              <Form>
                <Select
                  label="Select Social Media Platform"
                  name="seva_type"
                  options={props.options}
                  value={
                    props.options.find((c) => c.value === values.question_id) ??
                    null
                  }
                  onChange={(e: any) => setFieldValue("question_id", e.value)}
                  required
                />
                <div className="flex gap-2 mt-8 w-full items-center justify-center">
                  <Button
                    className="w-1/3 gap-2 px-0"
                    type="submit"
                    onClick={formRef?.current?.handleSubmit}
                    disabled={isLoading}
                  >
                    {isLoading && <LoadingSpinner className="h-4 w-4" />}
                    Submit
                  </Button>
                  {chunkState ? (
                    <div className="space-y-2 flex-1">
                      {chunkState.chunks.map((chunk, index) => (
                        <div
                          key={`${reportKey}_${index.toString}`}
                          className="flex gap-2 w-full items-center"
                        >
                          <Button
                            className="w-full px-2 bg-indigo-200 focus:bg-indigo-400 text-black disabled:bg-indigo-200 disabled:text-gray-400"
                            type="button"
                            onClick={() => copyToClipboard(chunk)}
                            disabled={isLoading}
                          >
                            Copy {hasMultipleChunks ? index + 1 : ""}
                          </Button>
                          <Button
                            className="w-full px-2 bg-blue-200 focus:bg-blue-400 text-black disabled:bg-blue-200 disabled:text-gray-400"
                            type="button"
                            onClick={() => navigator.share({ text: chunk })}
                            disabled={isLoading}
                          >
                            Share {hasMultipleChunks ? index + 1 : ""}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <Button
                        className="w-1/3 bg-indigo-200 focus:bg-indigo-400 text-black disabled:bg-indigo-200 disabled:text-gray-400"
                        type="button"
                        disabled
                      >
                        Copy
                      </Button>
                      <Button
                        className="w-1/3 bg-blue-200 focus:bg-blue-400 text-black disabled:bg-blue-200 disabled:text-gray-400"
                        type="button"
                        disabled
                      >
                        Share
                      </Button>
                    </>
                  )}
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </Modal>
  );
};
