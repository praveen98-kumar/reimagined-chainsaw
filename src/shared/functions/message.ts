import { capitalizeWords } from "@/shared/functions/utils";

export const HINDI_MONTH = [
  "जनवरी",
  "फरवरी",
  "मार्च",
  "अप्रैल",
  "मई",
  "जून",
  "जुलाई",
  "अगस्त",
  "सितंबर",
  "अक्टूबर",
  "नवंबर",
  "दिसंबर",
];

const MSG_HEADER = `🙏🏻 सत साहेब🙏🏻\nबन्दी छोड़ सतगुरु रामपाल जी भगवान की जय\n📕📗📘📙📕📗📘\n`;
const CALLING_MSG_HEADER = `🙏🏻 सत साहेब🙏🏻\nबन्दी छोड़ सतगुरु रामपाल जी भगवान की जय\n`;

const MSG_FOOTER = `\n🙏🏻 सतगुरु देव की जय 🙏🏻`;

const getDateString = (dateType: string, date?: Date) => {
  const dd = date ?? new Date();
  let d = dd.getDate();
  let m = dd.getMonth();
  let y = dd.getFullYear();
  switch (dateType) {
    case "today":
      return [d, HINDI_MONTH[m], y].join(" ");
    case "yesterday": {
      dd.setDate(dd.getDate() - 1);
      let d = dd.getDate();
      let m = dd.getMonth();
      let y = dd.getFullYear();
      return [d, HINDI_MONTH[m], y].join(" ");
    }
    case "this_month":
      dd.setDate(dd.getDate() - 1);
      m = dd.getMonth();
      return [HINDI_MONTH[m], y].join(" ");
    case "this_year":
      return y.toString();
    default:
      return "";
  }
};
export const COUNT_EMOJIS_TEXT: Record<string, string> = {
  total: `⚪️ टोटल ऑर्डर्स`,
  different_area: `🟣 अपडेट एड्रेस पेंडिंग`,
  wrong_order: `🔴 रॉन्ग आर्डर`,
  delivered: `🟢 बुक डिलीवरी`,
  pending_in: `In - ⭕️ पेंडिंग`,
  received: `⭕️ पेंडिंग टोटल`,
  accepted: `Out - ⭕️ पेंडिंग`,
  book_not_receive: "🔵 बुक कंप्लेन",
  //book Calling
  allot_pending: "🟠उपलब्ध कॉलिंग सेवा",
  pending: "🔴 आजतक संपर्क नही किया",
  completed: "🟢 आज संपर्क हुआ",
  completed_this_month: "🟢 इस महीने संपर्क हुआ",
  completed_yesterday: "🟢 आज संपर्क हुआ",
  satgyan_link: `आजतक सत्ज्ञान लिंक नहीं भेजा`,
  seva_pending: `🟢 आज कॉलिंग सेवा दि गई\n🔴 पिछली कॉलिंग सेवा पेंडिंग`,
};
export const TOTAL_TEXT: Record<string, string> = {
  total: `⚪️ टोटल ऑर्डर्स`,
  different_area: `🟣 अपडेट एड्रेस पेंडिंग`,
  wrong_order: `🔴 रॉन्ग आर्डर`,
  delivered: `🟢 बुक डेलीवर्ड`,
  pending_in: `In - ⭕️ पेंडिंग`,
  received: `⭕️ पेंडिंग टोटल`,
  accepted: `Out - ⭕️ पेंडिंग`,
  book_not_receive: "🔵 बुक कंप्लेन",
  //book Calling
  allot_pending: "कुल उपलब्ध कॉलिंग सेवा",
  pending: "कुल आजतक संपर्क नही किया",
  completed: "कुल आज संपर्क हुआ",
  completed_this_month: "कुल इस महीने संपर्क हुआ",
  completed_yesterday: "कुल आज संपर्क हुआ",
  satgyan_link: `कुल आजतक सत्ज्ञान लिंक नहीं भेजा`,
  seva_pending: `Total`,
};

export const LOCATION_HINDI: Record<string, string> = {
  ashram: "आश्रम",
  country: "देश",
  state: "राज्य",
  division: "संभाग",
  district: "ज़िला",
  tehsil: "तहसील",
};

export const combineMessage = (
  dateType: string,
  status: string,
  level: string,
  location: string,
  data: string,
  sevaType: string,
  start?: Date,
  end?: Date
) => {
  let msg = sevaType.includes("SMS") ? MSG_HEADER : CALLING_MSG_HEADER;
  if (
    dateType == "today" ||
    dateType == "yesterday" ||
    dateType == "this_month" ||
    dateType == "this_year"
  ) {
    msg += `*${sevaType} - ${getDateString(dateType)}*\n`;
  } else {
    if (dateType == "this_week") {
      const date = new Date();
      const today = date.getDate();
      const currentDay = date.getDay();
      const newDate = date.setDate(today - (currentDay || 7));
      msg += `*${sevaType} ${getDateString(
        "today",
        new Date(newDate)
      )} - ${getDateString("today", new Date())}*\n`;
    } else if (dateType == "last_month") {
      const date = new Date();
      const lastDayOfPrevMonth = new Date(
        date.getFullYear(),
        date.getMonth(),
        0
      );
      const firstDayOfPrevMonth = new Date(
        date.getFullYear(),
        date.getMonth() - 1,
        1
      );
      msg += `*${sevaType} ${getDateString(
        "today",
        firstDayOfPrevMonth
      )} - ${getDateString("today", lastDayOfPrevMonth)}*\n`;
    } else {
      msg += `*${sevaType} - ${getDateString(dateType, start)}*\n`;
    }
  }
  if (status == "seva_pending") {
    msg += `\n${LOCATION_HINDI[level]}: ${location}\n\n`;
  }
  if (status == "delivered") {
    const dayFilterText = capitalizeWords(dateType.replaceAll("_", " "));
    msg += `${COUNT_EMOJIS_TEXT[status]} रिपोर्ट (${dayFilterText})\n`;
  } else if (status == "completed") {
    msg += `${COUNT_EMOJIS_TEXT[status + "_" + dateType]} रिपोर्ट\n`;
  } else {
    msg += `${COUNT_EMOJIS_TEXT[status]} रिपोर्ट\n`;
  }
  if (status != "seva_pending") {
    msg += `\n${LOCATION_HINDI[level]}: ${location}`;
  }
  msg += `\n${data}\n`;
  msg += MSG_FOOTER;

  return msg;
};

export const splitLongMessage = (msg: string, maxLength = 4000) => {
  const chunks: string[] = [];
  let currentChunk = "";

  const lines = msg.split("\n");

  for (const line of lines) {
    if ((currentChunk + line).length > maxLength) {
      chunks.push(currentChunk);
      currentChunk = `${line}\n`;
    } else {
      currentChunk += `${line}\n`;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
};
