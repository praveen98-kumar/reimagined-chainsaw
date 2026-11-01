import type { SevaWiseReportDateType } from "@/pages/seva/social/whatsapp-report";
import { capitalizeWords } from "@/shared/functions/utils";

export const SOCIAL_MEDIA_ICON_MAPPER = {
  twitter: "🔷",
  reply: "⬛",
  facebook: "🟦",
  sharechat: "🟨",
  instagram: "🟧",
  pinterest: "🟥",
  koo: "🟡",
  dailyhunt: "🟢",
  linkedin: "🔵",
  redit: "🔴",
  google: "🟢",
  tumblr: "⚫",
  youtube: "🛑",
  app: "🛑",
  threads: "⚫",
  reddit: "🔴",
  common: "💠",
};

export const SOCIAL_MEDIA_TITLE_MAPPER: Record<string, string> = {
  twitter: "Twiiter/X",
  facebook: "Facebook",
  sharechat: "ShareChat",
  instagram: "Instagram",
  pinterest: "Pintrest",
  koo: "Koo",
  dailyhunt: "Dailyhunt",
  linkedin: "LinkedIn",
  redit: "Reddit",
  google: "Google",
  tumblr: "Tumblr",
  youtube: "Youtube",
  app: "App",
  threads: "Threads",
  reddit: "Reddit",
};

const msg_header = `\t\t🙏🏻सत साहेब🙏🏻\nबन्दी छोड़ सतगुरु रामपाल जी महाराज जी की जय`;

const msg_footer = `\n\n\t🙏🏻सतगुरु देव की जय🙏🏻`;

type ALL_REPORT_INPUT = {
  reports: {
    question: string;
    seva_count: number;
    icon?: string;
  }[];
  total_sevadar: number;
  total_submissions: number;
};
export const all_seva_message_template = ({
  region,
  location,
  date,
  inputs,
}: {
  region: string;
  location: string;
  date: string;
  inputs: ALL_REPORT_INPUT;
}) => {
  let msg_body = `
  *${capitalizeWords(region)} - ${location} - ${date}*
  *📱 SM Report*\n`;

  const maxLength =
    inputs.reports.length > 0
      ? Math.max(...inputs.reports.map((t) => t.seva_count.toString().length))
      : 1;

  inputs.reports.forEach((item) => {
    const icon = item.icon
      ? SOCIAL_MEDIA_ICON_MAPPER[
          item.icon as keyof typeof SOCIAL_MEDIA_ICON_MAPPER
        ]
      : "❓";
    msg_body += `\n${item.seva_count
      .toString()
      .padStart(maxLength, "0")} - ${icon} ${item.question}`;
  });

  msg_body +=
    inputs.total_sevadar > 0
      ? `\n\n${inputs.total_sevadar
          .toString()
          .padStart(maxLength, "0")} - Total Sevadar\n${inputs.total_submissions
          .toString()
          .padStart(maxLength, "0")} - Update Diye Sevadar\n${(
          inputs.total_sevadar - inputs.total_submissions
        )
          .toString()
          .padStart(maxLength, "0")} - Update Pending Sevadar`
      : `\n\n`;
  return { header: msg_header, body: msg_body, footer: msg_footer };
};

export const sevawise_report_template = ({
  region,
  location,
  date,
  inputs,
  question,
  icon,
}: {
  region: string;
  location: string;
  date: string;
  inputs: SevaWiseReportDateType[];
  icon: string;
  question: string;
}) => {
  let msg_body = `\n*${capitalizeWords(region)}${
    location ? ` - ${location}` : ""
  } - ${date}*
*${
    SOCIAL_MEDIA_ICON_MAPPER[icon as keyof typeof SOCIAL_MEDIA_ICON_MAPPER]
  } ${question}*\n\n`;

  const maxLenth = Math.max(...inputs.map((i) => i.seva_sum.toString().length));

  const body = inputs
    .filter((input) => input.seva_sum > 0)
    .sort((a, b) => b.seva_sum - a.seva_sum)
    .reduce((acc: string, item) => {
      const itemLevelEntityName =
        item.sevadar_name || item.division_name || item.district_name;
      acc += `${item.seva_sum
        .toString()
        .padStart(maxLenth, "0")} ${itemLevelEntityName}\n`;
      return acc;
    }, "");
  const totalCount = inputs.reduce((a, { seva_sum }) => a + seva_sum, 0);
  const totalLine = `\n${totalCount
    .toString()
    .padStart(maxLenth, "0")} Total\n`;

  return {
    header: msg_header + msg_body,
    body: body + totalLine,
    footer: msg_footer,
  };
};
export const update_pending_report_template = ({
  region,
  location,
  date,
  inputs,
}: {
  region: string;
  location: string;
  date: string;
  inputs: {
    name: string;
    location: string;
    guardian_name: string;
    relation: string;
  }[];
}) => {
  const msg_body = `
*${capitalizeWords(region)}${location ? ` - ${location}` : ""} - ${date}*
*🔴 रिपोर्ट नहीं भरी*\n`;

  const sortedInput = inputs.sort((a, b) => {
    const locationCompare = a.location.trim().localeCompare(b.location.trim());
    if (locationCompare !== 0) {
      return locationCompare;
    }
    return a.name.trim().localeCompare(b.name.trim());
  });
  const locationUsersMap = Map.groupBy(sortedInput, (input) => input.location);
  const sevadarListText = Array.from(locationUsersMap.entries()).reduce(
    (acc, [location, inputs]) => {
      const nameList = inputs.reduce((a, { name, guardian_name, relation }) => {
        const nameString = [name, relation, guardian_name]
          .filter((t) => !!t)
          .map((t) => t.trim())
          .join(" ");
        return `${a}${nameString}\n`;
      }, "");
      return `${acc}*${location}*\n${nameList}`;
    },
    "",
  );
  return {
    header: msg_header + msg_body,
    body: sevadarListText,
    footer: msg_footer,
  };
};

type Input = {
  sevadar_list: { region_id: number; count: number }[];
  seva_count: { region_id: number; count: number }[];
  regions: { id: number; name: string }[];
};

export const update_pending_report_upper_template = ({
  region,
  location,
  date,
  inputs,
}: {
  region: string;
  location: string;
  date: string;
  inputs: Input;
}) => {
  const locationColumnHeader = region === "ashram" ? "state" : region;
  let msg_body = `
*${capitalizeWords(region)}${location ? ` - ${location}` : ""} - ${date}*
*📱 SM Update Report*

👨‍👩‍👧‍👦 Total Sevadar
🟢 Update Diye Sevadar
🔴 Update Pending Sevadar\n\n
👨‍👩‍👧‍👦  - 🟢  -  🔴 -   %  - ${capitalizeWords(locationColumnHeader)}\n`;

  const maxSevadarCount =
    inputs.sevadar_list.length > 0
      ? Math.max(
          ...inputs.sevadar_list.map((item) => item.count.toString().length),
        )
      : 1;
  let maxPerCount = 2;
  const maxLength = Number(String(maxSevadarCount).replace(/[^0-9]/g, ""));

  const totalSevadarCount = inputs.sevadar_list
    .reduce((a, c) => a + c.count, 0)
    .toString()
    .padStart(maxLength, "0");
  const totalSevaCount = inputs.seva_count
    .reduce((a, c) => a + c.count, 0)
    .toString()
    .padStart(maxLength, "0")
    .padStart(3, " ");
  const totalPendingSevaCount = (
    Number(totalSevadarCount) - Number(totalSevaCount)
  )
    .toString()
    .padStart(maxLength, "0")
    .padStart(3, " ");

  inputs.regions.forEach((regionItem) => {
    const sevadarItem = inputs.sevadar_list.find(
      (item) => item.region_id === regionItem.id,
    );
    const sevaCountItem = inputs.seva_count.find(
      (item) => item.region_id === regionItem.id,
    );
    const sevadarCount = sevadarItem ? sevadarItem.count : 0;
    const sevaCount = sevaCountItem ? sevaCountItem.count : 0;
    if (sevadarCount && sevadarCount === sevaCount) {
      maxPerCount = 3;
    }
  });
  const totalPercentage = (
    (Number(totalSevaCount) / Number(totalSevadarCount)) * 100 || 0
  )
    .toFixed(1)
    .padStart(maxPerCount, "0")
    .padStart(3, " ");
  inputs.regions.forEach((regionItem) => {
    const sevadarItem = inputs.sevadar_list.find(
      (item) => item.region_id === regionItem.id,
    );
    const sevaCountItem = inputs.seva_count.find(
      (item) => item.region_id === regionItem.id,
    );

    const sevadarCount = sevadarItem ? sevadarItem.count : 0;
    const sevadarCountStr = sevadarCount.toString().padStart(maxLength, "0");
    const sevaCount = sevaCountItem ? sevaCountItem.count : 0;
    const sevaCountStr = sevaCount
      .toString()
      .padStart(maxLength, "0")
      .padStart(3, " ");
    const pendingSevaCount =
      sevadarCount - sevaCount > 0 ? sevadarCount - sevaCount : 0;
    const pendingSevaCountStr = pendingSevaCount
      .toString()
      .padStart(maxLength, "0")
      .padStart(3, " ");
    const percentage =
      sevaCount > 0 ? ((sevaCount / sevadarCount) * 100).toFixed(0) : "0";
    const percentageStr = percentage
      .toString()
      .padStart(maxPerCount, "0")
      .padStart(3, " ");

    msg_body += `\n${sevadarCountStr} - ${sevaCountStr} - ${pendingSevaCountStr} - ${percentageStr}% - ${capitalizeWords(
      regionItem.name,
    )}`;
  });

  msg_body += `\n\n${totalSevadarCount} - ${totalSevaCount} - ${totalPendingSevaCount} - ${totalPercentage}% - Total\n\n`;

  return { header: msg_header, body: msg_body, footer: msg_footer };
};
