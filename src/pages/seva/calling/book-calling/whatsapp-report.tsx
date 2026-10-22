import Button from "@/components/Button";
import Radio from "@/components/input/Radio";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import apiClient from "@/http/index";
import { useAppSelector } from "@/redux/store";
import {
  combineMessage,
  HINDI_MONTH,
  LOCATION_HINDI,
  TOTAL_TEXT,
} from "@/shared/functions/message";
import { copyToClipboard } from "@/shared/functions/utils";
import { NextApplicationPage } from "@/shared/interfaces/app";
import { Option } from "@/shared/interfaces/option";
import dayjs from "dayjs";
import { Form, Formik } from "formik";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";

const dailReportMSG = (
  date: string,
  level: string,
  locationName: string,
  ...inputs: number[]
) => {
  return `
  🙏🏻 सत साहेब🙏🏻
  बन्दी छोड़ सतगुरु रामपाल जी महाराज जी की जय

  ${date} 
  
  ${LOCATION_HINDI[level]}: ${locationName}
  
  📱Daily Calling Seva Report

  🟠 ${inputs[0]} - कॉलिंग आर्डर प्राप्त

  📞 ${inputs[1]} - संपर्क हुए
  ▪ ${inputs[2]} - अस्थाई रूप से नंबर बंद
  ▪ ${inputs[3]} - पुस्तक नही मिली
  ▪ ${inputs[4]} - गलत (not ok)
  ▪ ${inputs[5]} - सही (ok)
  ▪ ${inputs[6]} - ज्यादा रुचि है
  ▪ ${inputs[7]} - नाम दीक्षा प्राप्त है
  ▪ ${inputs[8]} - डुप्लीकेट

  🔴 ${inputs[9]} - आजतक संपर्क नहीं किया

  🔵 सतज्ञान लिंक
  ▪ ${inputs[10]} - सतज्ञान लिंक भेज दिए
  ▪ ${inputs[11]} - सतज्ञान लिंक नहीं भेजे
  
🟢 ▪ ${inputs[12]} - सेवा उपलब्ध है
  
  🙏🏻 सतगुरु देव की जय 🙏🏻
  `;
};

const summaryReportMSG = (
  date: string,
  level: string,
  locationName: string,
  ...inputs: number[]
) => {
  return `  
🙏🏻 सत साहेब🙏🏻
बन्दी छोड़ सतगुरु रामपाल जी महाराज जी की जय

${date} 

${LOCATION_HINDI[level]}: ${locationName}

📱Summary (सारांश) Report

🟠 ${inputs[0]} - आजतक कॉलिंग आर्डर प्राप्त

📞 ${inputs[1]} - आजतक संपर्क हुए
▪ ${inputs[2]} - अस्थाई रूप से नंबर बंद
▪ ${inputs[3]} - पुस्तक नही मिली
▪ ${inputs[4]} - गलत (not ok)
▪ ${inputs[5]} - सही (ok)
▪ ${inputs[6]} - ज्यादा रुचि है
▪ ${inputs[7]} - नाम दीक्षा प्राप्त है
▪ ${inputs[8]} - डुप्लीकेट

🔴 ${inputs[9]} - आजतक संपर्क नहीं किया

🔵 ${inputs[10]} - आजतक सतज्ञान लिंक भेज दिए
▪ ${inputs[11]} - आजतक सतज्ञान लिंक नहीं भेजे

🟢 ${inputs[12]} - सेवा उपलब्ध है

🙏🏻 सतगुरु देव की जय 🙏🏻
`;
};

const schema = Yup.object({
  status: Yup.array().of(Yup.string()),
  sevadar_level: Yup.string(),
});
const getRegionValue = (
  active_permission: any,
  active_region_index: number = 0
) => {
  if (active_permission && active_permission?.region?.length > 0) {
    const key = `${active_permission?.role_region}_id`;
    let item: any = {};
    item[active_permission?.role_region] =
      active_permission?.region[active_region_index][key];
    return item;
  }
  return {};
};

const statusOptions: Record<string, Array<Option>> = {
  ashram: [
    {
      label: "calling_allot_pending",
      value: "allot_pending",
      status: "yesterday",
    },
    { label: "calling_pending", value: "pending", status: "yesterday" },
    {
      label: "calling_completed_today",
      value: "completed",
      status: "yesterday",
    },
    {
      label: "calling_completed_this_month",
      value: "completed",
      status: "this_month",
    },
    { label: "calling_satgyan_link", value: "satgyan_link", status: "today" },
    { label: "calling_seva_pending", value: "seva_pending", status: "today" },
  ],
  state: [
    {
      label: "calling_allot_pending",
      value: "allot_pending",
      status: "yesterday",
    },
    { label: "calling_pending", value: "pending", status: "yesterday" },
    {
      label: "calling_completed_today",
      value: "completed",
      status: "yesterday",
    },
    {
      label: "calling_completed_this_month",
      value: "completed",
      status: "this_month",
    },
    { label: "calling_satgyan_link", value: "satgyan_link", status: "today" },
    { label: "calling_seva_pending", value: "seva_pending", status: "today" },
  ],
  division: [
    {
      label: "calling_allot_pending",
      value: "allot_pending",
      status: "yesterday",
    },
    { label: "calling_pending", value: "pending", status: "yesterday" },
    {
      label: "calling_completed_today",
      value: "completed",
      status: "yesterday",
    },
    {
      label: "calling_completed_this_month",
      value: "completed",
      status: "this_month",
    },
    { label: "calling_satgyan_link", value: "satgyan_link", status: "today" },
    { label: "calling_seva_pending", value: "seva_pending", status: "today" },
  ],
  district: [
    { label: "calling_pending", value: "pending", status: "yesterday" },
    {
      label: "calling_completed_today",
      value: "completed",
      status: "yesterday",
    },
    {
      label: "calling_completed_this_month",
      value: "completed",
      status: "this_month",
    },
    { label: "calling_satgyan_link", value: "satgyan_link", status: "today" },
    { label: "calling_seva_pending", value: "seva_pending", status: "today" },
  ],
  tehsil: [
    {
      label: "calling_allot_pending",
      value: "allot_pending",
      status: "yesterday",
    },
    { label: "calling_pending", value: "pending", status: "yesterday" },
    {
      label: "calling_completed_today",
      value: "completed",
      status: "yesterday",
    },
    {
      label: "calling_completed_this_month",
      value: "completed",
      status: "this_month",
    },
    { label: "calling_satgyan_link", value: "satgyan_link", status: "today" },
    { label: "calling_seva_pending", value: "seva_pending", status: "today" },
  ],
};

const WhatsAppReport: NextApplicationPage = () => {
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState<string[]>([]);
  const formRef = useRef<any>(null);
  const { active_permission, active_region_index } = useAppSelector(
    (s) => s.auth
  );
  const [records, setRecords] = useState<Record<string, any[]>>({});

  const roleRegion = active_permission?.role_region as string;
  const [roleStatusOptions, setRoleStatusOptions] = useState<Option[]>(
    statusOptions[roleRegion!] ?? []
  );
  const [dailySummeryData, setDailySummaryData] = useState<Array<Option>>([
    { label: "Summary (Today)", value: "daily" },
    { label: "Summary (Till Date)", value: "summary" },
  ]);
  //@ts-ignore
  const locationName =
    //@ts-ignore
    active_permission?.region?.[active_region_index]?.[`${roleRegion}_name`];

  const { t: tc } = useTranslation("common");
  const { t: tr } = useTranslation("report");
  const sevadarLevelOptions: Array<Option> = [
    { label: "District Wise", value: "sevadar" },
    { label: "Division Wise", value: "region" },
  ];
  const copy = (status: string, dayFilter: string) => {
    const msg = getMSG(status, dayFilter);
    copyToClipboard(msg);
  };
  const share = async (status: string, dayFilter: string) => {
    const msg = getMSG(status, dayFilter);
    await navigator.share({ text: msg });
  };
  const getMSG = (status: string, dayFilter: string) => {
    const total = records?.[`${status}_${dayFilter}`].reduce(
      (a, b) => a + b?.[status],
      0
    );
    const todayAllotTotal =
      status == "seva_pending"
        ? records?.[`${status}_${dayFilter}`].reduce(
            (a, b) => a + b?.["today_allot"],
            0
          )
        : 0;
    let highestLength = 0;
    records?.[`${status}_${dayFilter}`].forEach((a) => {
      if (a?.[status].toString().length > highestLength) {
        highestLength = a?.[status].toString().length;
      }
    });
    let temp = records?.[`${status}_${dayFilter}`]
      .sort((a, b) => {
        if (a?.[status] > b?.[status]) return -1;
        if (a?.[status] < b?.[status]) return 1;
        return 0;
      })
      .reduce((a, c, i) => {
        if (i == 0 && status == "seva_pending") {
          let reportType = "जिला";
          if (records?.[`${status}_${dayFilter}`].length) {
            if (
              Object.keys(records?.[`${status}_${dayFilter}`][0]).includes(
                "country"
              )
            ) {
              reportType = "देश";
            } else if (
              Object.keys(records?.[`${status}_${dayFilter}`][0]).includes(
                "state"
              )
            ) {
              reportType = "राज्य";
            } else if (
              Object.keys(records?.[`${status}_${dayFilter}`][0]).includes(
                "division"
              )
            ) {
              reportType = "संभाग";
            } else if (
              Object.keys(records?.[`${status}_${dayFilter}`][0]).includes(
                "district"
              )
            ) {
              reportType = "जिला";
            } else if (
              Object.keys(records?.[`${status}_${dayFilter}`][0]).includes(
                "tehsil"
              )
            ) {
              reportType = "तहसील";
            } else {
              reportType = "सेवादार";
            }
            a += `🟢  -  🔴 : ${reportType}`;
          }
        }
        if (Number(c?.[status]) > 0) {
          if (status == "seva_pending") {
            a += `\n${c?.["today_allot"]
              .toString()
              .padStart(highestLength, "0")} | ${(c?.[status])
              .toString()
              .padStart(highestLength, "0")} : ${
              c?.sevadar ?? c?.tehsil ?? c?.district ?? c?.division ?? c?.state
            }`;
          } else {
            a += `\n${c?.[status].toString().padStart(highestLength, "0")}: ${
              c?.sevadar ?? c?.tehsil ?? c?.district ?? c?.division ?? c?.state
            }`;
          }
        }
        if (i == records?.[`${status}_${dayFilter}`].length - 1) {
          if (status == "seva_pending") {
            a += `\n${todayAllotTotal
              .toString()
              .padStart(highestLength, "0")} | ${total
              .toString()
              .padStart(highestLength, "0")} : Total`;
          } else if (status == "completed") {
            a += `\n\n${total.toString().padStart(highestLength, "0")}: ${
              TOTAL_TEXT[status + "_" + dayFilter]
            }`;
          } else {
            a += `\n\n${total.toString().padStart(highestLength, "0")}: ${
              TOTAL_TEXT[status]
            }`;
          }
        }
        return a;
      }, "");
    return combineMessage(
      dayFilter,
      status,
      roleRegion,
      locationName,
      temp,
      "📱Calling Seva Report",
      formRef?.current?.values?.start,
      formRef?.current?.values?.end
    );
  };

  const getMoreMSGData = async (status: string, yesterday: boolean) => {
    setLoading(true);
    try {
      const { data } = await apiClient.post(
        "calling_overall_whatsapp_reports",
        {
          ...(yesterday
            ? {
                start: dayjs().subtract(1, "day").startOf("day").toISOString(),
              }
            : {}),
          end: dayjs().subtract(1, "day").endOf("day").toISOString(),
          ...getRegionValue(active_permission, active_region_index),
        }
      );
      let value = "";
      const {
        allot_pending,
        allotted,
        book_not_receive,
        duplicate,
        got_initiation,
        jyada_ruchi,
        mobile_no_issue,
        not_interested,
        ok,
        pending_seva,
        satgyan_link_not_sent,
        satgyan_link_sent,
      } = data.data;
      const monthIndex = dayjs().get("month");
      const dateString = `Date: ${dayjs().get("date")} ${
        HINDI_MONTH[monthIndex]
      } ${dayjs().get("year")}`;
      if (yesterday) {
        value = dailReportMSG(
          dateString,
          roleRegion,
          locationName,
          allotted,
          book_not_receive +
            duplicate +
            got_initiation +
            jyada_ruchi +
            mobile_no_issue +
            not_interested +
            ok,
          mobile_no_issue,
          book_not_receive,
          not_interested,
          ok,
          jyada_ruchi,
          got_initiation,
          duplicate,
          pending_seva,
          satgyan_link_sent,
          satgyan_link_not_sent,
          allot_pending
        );
      } else {
        value = summaryReportMSG(
          dateString,
          roleRegion,
          locationName,
          allotted,
          book_not_receive +
            duplicate +
            got_initiation +
            jyada_ruchi +
            mobile_no_issue +
            not_interested +
            ok,
          mobile_no_issue,
          book_not_receive,
          not_interested,
          ok,
          jyada_ruchi,
          got_initiation,
          duplicate,
          pending_seva,
          satgyan_link_sent,
          satgyan_link_not_sent,
          allot_pending
        );
      }
      setDailySummaryData((prev) =>
        prev.map((a) => (a.label === status ? { ...a, value } : a))
      );
      setLoaded((prev) =>
        prev.includes(`${status}`) ? prev : [...prev, `${status}`]
      );
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const getReportData = async (status: string, dayFilter: string) => {
    let params: Record<string, any> = {};
    let start;
    let end;
    if (dayFilter) {
      switch (dayFilter) {
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
          end = dayjs().subtract(1, "day").endOf("day").toISOString();
          break;
        case "last_month":
          start = dayjs()
            .subtract(1, "month")
            .startOf("month")
            .startOf("day")
            .toISOString();
          end = dayjs().subtract(1, "month").endOf("day").toISOString();
          break;
        default:
          break;
      }
      params["day_filter"] = dayFilter;
    }

    if (start != undefined && end != undefined) {
      params["start"] = start;
      params["end"] = end;
    }
    params["sevadar_level"] = formRef?.current?.values?.sevadar_level;
    setLoading(true);
    try {
      const { data } = await apiClient.post("calling_whatsapp_reports", {
        ...params,
        status: status,
        ...getRegionValue(active_permission, active_region_index),
      });

      setRecords((prev) => ({
        ...prev,
        [`${status}_${dayFilter}`]: data.data,
      }));
      setLoaded((prev) =>
        prev.includes(`${status}_${dayFilter}`)
          ? prev
          : [...prev, `${status}_${dayFilter}`]
      );
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };
  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: "Whatsapp Report",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
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
                      options={sevadarLevelOptions}
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
        <div className="w-full flex items-center gap-4 border-t-2 border-gray-200">
          <div className="mt-2 flex flex-col w-full" role={"group"}>
            {roleStatusOptions.map(({ label, value, status }, i) => (
              <div
                key={i}
                className="leading-4 flex py-1 items-center justify-between mb-3 border-b border-gray-500"
              >
                <p className="font-semibold text-lg">{tr(label)}</p>
                <div className="flex gap-4 items-center">
                  {loaded.includes(`${value}_${status}`) ? (
                    <div className="flex items-start space-x-1">
                      <Button
                        className="text-sm py-1 px-2 min-w-[60px] bg-blue-200 focus:bg-blue-400 text-black"
                        onClick={() => copy(value.toString(), status)}
                      >
                        Copy
                      </Button>
                      <Button
                        className="text-sm py-1 px-2 min-w-[60px] bg-indigo-200 focus:bg-indigo-400 text-black"
                        onClick={() => share(value.toString(), status)}
                      >
                        Share
                      </Button>
                    </div>
                  ) : (
                    <Button
                      // loading={loading && !loaded.includes(value.toString())}
                      // disabled={loading && !loaded.includes(value.toString())}
                      disabled={loading || loaded.includes(value.toString())}
                      onClick={() => getReportData(value.toString(), status)}
                      className="text-sm py-1 px-2 min-w-[60px]"
                    >
                      {tc("search")}
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {dailySummeryData.map(({ label }, i) => (
              <div
                key={i}
                className="leading-4 flex py-1 items-center justify-between mb-3 border-b border-gray-500"
              >
                <p className="font-semibold text-lg">{tr(label)}</p>
                <div className="flex gap-4 items-center">
                  {loaded.includes(`${label}`) ? (
                    <div className="flex items-start space-x-1">
                      <Button
                        className="text-sm py-1 px-2 min-w-[60px] bg-blue-200 focus:bg-blue-400 text-black"
                        onClick={() => {
                          const exist = dailySummeryData.find(
                            (a) => a.label == label
                          );
                          if (exist) {
                            copyToClipboard(exist.value.toString());
                          }
                        }}
                      >
                        Copy
                      </Button>
                      <Button
                        className="text-sm py-1 px-2 min-w-[60px] bg-indigo-200 focus:bg-indigo-400 text-black"
                        onClick={async () => {
                          const exist = dailySummeryData.find(
                            (a) => a.label == label
                          );
                          if (exist) {
                            await navigator.share({
                              text: exist.value.toString(),
                            });
                          }
                        }}
                      >
                        Share
                      </Button>
                    </div>
                  ) : (
                    <Button
                      disabled={loading || loaded.includes(label.toString())}
                      onClick={() =>
                        i == 0
                          ? getMoreMSGData(label, true)
                          : getMoreMSGData(label, false)
                      }
                      className="text-sm py-1 px-2 min-w-[60px]"
                    >
                      {tc("search")}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        {loading ? <LoadingSpinner className="mx-auto mt-6 w-6 h-6" /> : null}
      </div>
    </Layout>
  );
};

WhatsAppReport.requireAuth = true;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "report"])),
    },
  };
};
export default WhatsAppReport;
