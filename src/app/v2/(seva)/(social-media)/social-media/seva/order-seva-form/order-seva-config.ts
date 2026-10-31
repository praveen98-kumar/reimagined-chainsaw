export type OrderSevaKey =
  "national_regular" | "national_emergency" | "international_regular";

export type OrderSevaConfig = {
  pageTitle: string;
  title: string;
  headerGradient: string;
  submitGradient: string;
  showCountry: boolean;
  convertTo: string[];
};
export const orderSevaConfig: Record<OrderSevaKey, OrderSevaConfig> = {
  national_regular: {
    pageTitle: "National Order",
    title: "Regular Book Order",
    headerGradient: "from-[#02233C] to-[#256AF5]",
    submitGradient: "from-green-700 to-green-500",
    showCountry: false,
    convertTo: ["Emergency", "International"],
  },
  national_emergency: {
    pageTitle: "Emergency Order",
    title: "Emergency Book Order",
    headerGradient: "from-[#3C0203] to-[#F52528]",
    submitGradient: "from-red-700 to-red-500",
    showCountry: false,
    convertTo: ["Emergency", "National"],
  },
  international_regular: {
    pageTitle: "International Order",
    title: "Regular Book Order",
    headerGradient: "from-[#023C3A] to-[#0AD4CD]",
    submitGradient: "from-teal-700 to-teal-500",
    showCountry: true,
    convertTo: ["National", "International"],
  },
};
