import Button from "@/components/Button";
import Radio from "@/components/input/Radio";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import apiClient from "@/http/index";
import { useAppSelector } from "@/redux/store";
import { combineMessage } from "@/shared/functions/message";
import { copyToClipboard } from "@/shared/functions/utils";
import { NextApplicationPage } from "@/shared/interfaces/app";
import { Option } from "@/shared/interfaces/option";
import dayjs from "dayjs";
import { Form, Formik } from "formik";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { reportTypes } from "../../../constants/reports";
import { getRegionValue } from "@/shared/functions/location";

const schema = Yup.object({
  status: Yup.array().of(Yup.string()),
  sevadar_level: Yup.string(),
});
// received = 1
//     accepted = 2
//     delivered = 3
//     book_not_receive = 4
//     deleted = 5
//     different_area = 6
//     duplicated = 7
//     emergency = 8
//     wrong_order = 9

const statusOptions: Record<string, Array<Option>> = {
  state: [
    { label: "pending_in", value: "pending_in", status: "yesterday" },
    { label: "accepted", value: "accepted", status: "yesterday" },
    { label: "delivered_today", value: "delivered", status: "yesterday" },
    { label: "delivered_this_month", value: "delivered", status: "this_month" },
    {
      label: "book_not_receive",
      value: "book_not_receive",
      status: "this_month",
    },
    { label: "different_area", value: "different_area", status: "this_month" },
    { label: "wrong_order", value: "wrong_order", status: "this_month" },
    {
      label: "month_end_report",
      value: "month_end_report",
      status: "last_month",
    },
  ],
  division: [
    { label: "pending_in", value: "pending_in", status: "yesterday" },
    { label: "accepted", value: "accepted", status: "yesterday" },
    { label: "delivered_today", value: "delivered", status: "yesterday" },
    { label: "delivered_this_month", value: "delivered", status: "this_month" },
    {
      label: "book_not_receive",
      value: "book_not_receive",
      status: "this_month",
    },
    { label: "different_area", value: "different_area", status: "this_month" },
    { label: "wrong_order", value: "wrong_order", status: "this_month" },
  ],
  district: [
    { label: "pending_in", value: "pending_in", status: "yesterday" },
    { label: "accepted", value: "accepted", status: "yesterday" },
    { label: "delivered_today", value: "delivered", status: "yesterday" },
    { label: "delivered_this_month", value: "delivered", status: "this_month" },
    { label: "wrong_order", value: "wrong_order", status: "this_month" },
  ],
  tehsil: [
    { label: "accepted", value: "accepted", status: "yesterday" },
    { label: "delivered_today", value: "delivered", status: "yesterday" },
    { label: "delivered_this_month", value: "delivered", status: "this_month" },
    { label: "wrong_order", value: "wrong_order", status: "this_month" },
  ],
};

interface MonthEndReport {
  order_received: number;
  order_delivered: number;
  order_pending_in: number;
  order_pending_out: number;
}

const monthEndReportMSG = (
  stateName: string,
  date: string,
  data: MonthEndReport
) => {
  return `सत साहेब जी
🙏बंदी छोड़ सतगुरु रामपाल जी भगवान की जय 🙏
SMS SEWA REPORT

${date}
State- ${stateName}

Total Received Order- ${data.order_received}
Total By Hand Delivered- ${data.order_delivered}
Total By Post Delivered- 0
Total Pending Order- ${data.order_pending_in + data.order_pending_out}

🙏🏻 सतगुरु देव की जय 🙏🏻`;
};

const WhatsAppReport: NextApplicationPage = () => {
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState<string[]>([]);
  const formRef = useRef<any>(null);
  const { active_permission, active_region_index } = useAppSelector(
    (s) => s.auth
  );
  const [records, setRecords] = useState<Record<string, any[]>>({});
  const [monthEndReportData, setMonthEndReportData] = useState<MonthEndReport>({
    order_delivered: 0,
    order_pending_in: 0,
    order_pending_out: 0,
    order_received: 0,
  });

  const roleRegion = active_permission?.role_region as string;
  const [roleStatusOptions, setRoleStatusOptions] = useState<Option[]>(
    statusOptions[roleRegion!] ?? []
  );
  //@ts-ignore
  const locationName =
    //@ts-ignore
    active_permission?.region?.[active_region_index]?.[`${roleRegion}_name`];

  const { t: tc } = useTranslation("common");
  const { t: tr } = useTranslation("report");

  const copy = (status: string, dayFilter: string) => {
    let msg = "";
    if (status == "month_end_report") {
      const dateString = dayjs().subtract(1, "month").format("MMM-YYYY");
      msg = monthEndReportMSG(
        active_permission?.region[active_region_index]?.state_name || "",
        dateString,
        monthEndReportData
      );
    } else {
      msg = getMSG(status, dayFilter);
    }
    copyToClipboard(msg);
  };
  const share = async (status: string, dayFilter: string) => {
    let msg = "";
    if (status == "month_end_report") {
      const dateString = dayjs().subtract(1, "month").format("MMM-YYYY");
      msg = monthEndReportMSG(
        active_permission?.region[active_region_index]?.state_name || "",
        dateString,
        monthEndReportData
      );
    } else {
      msg = getMSG(status, dayFilter);
    }
    await navigator.share({ text: msg });
  };
  const getMSG = (status: string, dayFilter: string) => {
    const total = records?.[`${status}_${dayFilter}`].reduce(
      (a, b) => a + b?.[status],
      0
    );
    const acceptedTotal =
      status == "pending_in"
        ? records?.[`${status}_${dayFilter}`].reduce(
            (a, b) => a + b?.["accepted"],
            0
          )
        : 0;
    let highestLength = 0;
    records?.[`${status}_${dayFilter}`].forEach((a) => {
      const item =
        status == "pending_in" ? a?.[status] + a?.["accepted"] : a?.[status];
      if (item.toString().length > highestLength) {
        highestLength = item.toString().length;
      }
    });
    let temp = records?.[`${status}_${dayFilter}`]
      .sort((a, b) => {
        if (status == "pending_in") {
          if (
            a?.[status] / (a?.[status] + a?.["accepted"]) >
            b?.[status] / (b?.[status] + b?.["accepted"])
          )
            return 1;
          if (
            a?.[status] / (a?.[status] + a?.["accepted"]) <
            b?.[status] / (b?.[status] + b?.["accepted"])
          )
            return -1;
        } else {
          if (a?.[status] > b?.[status]) return -1;
          if (a?.[status] < b?.[status]) return 1;
        }
        return 0;
      })
      .reduce((a, c, i) => {
        if (
          (status != "pending_in" && Number(c?.[status]) > 0) ||
          (status == "pending_in" && Number(c?.[status] + c?.["accepted"]) > 0)
        ) {
          if (status == "pending_in") {
            const perCalac = (
              (Number(c?.["accepted"]) /
                Number(c?.[status] + c?.["accepted"])) *
              100
            ).toFixed(0);
            a += `\n${(c?.[status] + c?.["accepted"])
              .toString()
              .padStart(highestLength, "0")} | ${c?.["accepted"]
              .toString()
              .padStart(highestLength, "0")} | ${c?.[status]
              .toString()
              .padStart(highestLength, "0")} | ${perCalac.padStart(
              3,
              "0"
            )}% : ${
              c?.sevadar ?? c?.tehsil ?? c?.district ?? c?.division ?? c?.state
            }`;
          } else {
            a += `\n${c?.[status].toString().padStart(highestLength, "0")}: ${
              c?.sevadar ?? c?.tehsil ?? c?.district ?? c?.division ?? c?.state
            }`;
          }

          if (status == "delivered") {
            if (i == 0) {
              a += " 🥇";
            } else if (i == 1) {
              a += " 🥈";
            } else if (i == 2) {
              a += " 🥉";
            }
          }
        }
        if (i == records?.[`${status}_${dayFilter}`].length - 1) {
          if (status == "pending_in") {
            const perCalac = (
              (Number(total) / Number(acceptedTotal + total)) *
              100
            ).toFixed(0);
            a += `\n${(total + acceptedTotal)
              .toString()
              .padStart(highestLength, "0")} | ${acceptedTotal
              .toString()
              .padStart(highestLength, "0")} | ${total
              .toString()
              .padStart(highestLength, "0")} | ${perCalac.padStart(
              3,
              "0"
            )}% : Total`;
          } else {
            a += `\n\n${total.toString().padStart(highestLength, "0")}: Total`;
          }
        }
        return a;
      }, "");
    if (status == "pending_in") {
      let reportType = "जिला";
      if (records?.[`${status}_${dayFilter}`].length) {
        if (
          Object.keys(records?.[`${status}_${dayFilter}`][0]).includes(
            "country"
          )
        ) {
          reportType = "देश";
        } else if (
          Object.keys(records?.[`${status}_${dayFilter}`][0]).includes("state")
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
          Object.keys(records?.[`${status}_${dayFilter}`][0]).includes("tehsil")
        ) {
          reportType = "तहसील";
        } else {
          reportType = "सेवादार";
        }
      }
      temp = `\nटोटल |उठाए |पेंडिंग | % - ${reportType}` + temp;
    }
    return combineMessage(
      dayFilter,
      status,
      roleRegion,
      locationName,
      temp,
      "SMS पुस्तक सेवा",
      formRef?.current?.values?.start,
      formRef?.current?.values?.end
    );
  };

  const getReportData = async (status: Array<string>, dayFilter: string) => {
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
          start = dayjs()
            .subtract(1, "day")
            .startOf("month")
            .startOf("day")
            .toISOString();
          end = dayjs().subtract(1, "day").endOf("day").toISOString();
          break;
        case "last_month":
          start = dayjs()
            .subtract(1, "month")
            .startOf("month")
            .startOf("day")
            .toISOString();
          end = dayjs().subtract(1, "month").endOf("month").toISOString();
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
    if (active_permission?.role_region == "state") {
      params["sevadar_level"] = formRef?.current?.values?.sevadar_level;
    } else {
      params["sevadar_level"] = status.includes("wrong_order")
        ? "sevadar"
        : "region";
    }
    setLoading(true);
    try {
      const { data } = await apiClient.post(
        status[0] == "month_end_report"
          ? "book_delivery_whatsapp_monthly_report"
          : "book_delivery_whatsapp_reports",
        {
          ...params,
          status: status,
          ...getRegionValue(active_permission, active_region_index),
        }
      );
      if (status[0] == "month_end_report") {
        setMonthEndReportData(data.data);
      } else {
        setRecords((prev) => ({
          ...prev,
          [`${status[0]}_${dayFilter}`]: data.data,
        }));
      }
      setLoaded((prev) =>
        prev.includes(`${status[0]}_${dayFilter}`)
          ? prev
          : [...prev, `${status[0]}_${dayFilter}`]
      );
    } catch (err) {
      console.error(err);
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
                      disabled={
                        loading || loaded.includes(`${value}_${status}`)
                      }
                      onClick={() =>
                        getReportData(
                          i == 0
                            ? [value.toString(), "accepted"]
                            : [value.toString()],
                          status
                        )
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
