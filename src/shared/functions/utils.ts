import type { AxiosHeaders, AxiosRequestConfig, AxiosResponse } from "axios";
import { type ClassValue, clsx } from "clsx";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import FileSaver from "file-saver";
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge";
import apiClient from "@/http/index";
import { store } from "@/redux/store";
import type { Option } from "@/shared/interfaces/option";
import type { Region } from "@/shared/interfaces/user";

dayjs.extend(utc);

export const cn = (...inputs: Array<ClassValue>) => {
  return twMerge(clsx(inputs));
};

export const queryString = (params: object): string => {
  return Object.entries(params).reduce((pre, [currKey, currVal], index) => {
    if (index == 0) {
      return pre + `?${currKey}=${currVal}`;
    } else return pre + `&${currKey}=${currVal}`;
  }, "");
};

export const isValidUser = (permission: string, roles?: string[]) => {
  const active_permission = store.getState().auth.active_permission;
  if (active_permission != null) {
    let permission_exist = active_permission.permissions.includes(permission);
    if (roles?.length && permission_exist) {
      permission_exist =
        permission_exist && roles.includes(active_permission.role);
    }
    return permission_exist;
  }
  return false;
};

export const getOptionArray = (
  arr: any[],
  keyVar: string,
  valueVar: string,
  extendOther: boolean = false,
): Option[] => {
  return arr.reduce((acc: Option[], curr: any) => {
    let option = {
      label: capitalizeWords(curr[keyVar].replace(/_/g, " ")),
      value: curr[valueVar],
    };
    if (extendOther) {
      option = {
        ...option,
        ...curr,
      };
    }
    acc.push(option);
    return acc;
  }, []);
};

export const getSevadarTypeParams = (type: string) => {
  switch (type) {
    case "delivery":
      return { is_book_delivery_sevadar: "1" };
    case "order":
      return { is_book_order_sevadar: "1" };
    case "jyada-ruchi":
      return { is_jyada_ruchi_sevadar: "1" };
    case "calling":
      return { is_calling_sevadar: "1" };
    case "miss-call":
      return { is_miss_call_sevadar: "1" };
    default:
      return {};
  }
};

export const isInViewPort = (element: HTMLElement) => {
  if (!element) return false;

  const rect = element.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

export const objectWithValues = <T extends Object>(object: T): Partial<T> => {
  return Object.entries(object).reduce((a, [key, val]) => {
    return {
      ...a,
      ...(val != null && val != 0 && val != "" ? { [key]: val } : {}),
    };
  }, {});
};

export const setObjectKey = <T>(key: keyof T, value: any) => {
  return { [key]: value };
};

export const preleadingZero = (num: number, place: number) =>
  String(num).padStart(place, "0");

export const capitalizeWords = (w: string) => {
  if (!w) {
    return "";
  }
  return w
    .trim()
    .split(" ")
    .map((ele: string) => {
      return ele[0]?.toUpperCase() + ele.slice(1)?.toLowerCase();
    })
    .join(" ");
};

export interface DownloadOptions {
  endPoint: string;
  params?: Record<string, unknown>;
  fileName?: string;
  method?: "GET" | "POST";
  body?: Record<string, unknown>;
  showToast?: boolean;
  onSuccess?: (fileName: string) => void;
  onError?: (error: Error) => void;
}

export const downloadFile = async ({
  endPoint,
  params = {},
  fileName,
  method = "GET",
  body,
  showToast = false,
  onSuccess,
  onError,
}: DownloadOptions) => {
  const urlParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    // @ts-expect-error
    urlParams.append(k, v);
  });
  const config: AxiosRequestConfig = {
    method,
    url: endPoint,
    params: method === "GET" ? urlParams : undefined,
    data: method === "POST" ? body : undefined,
    responseType: "blob",
  };
  try {
    const response: AxiosResponse = await apiClient.request(config);

    const contentType = response.headers["content-type"] || "";
    const contentDisposition = response.headers["content-disposition"];

    // Check if it's a downloadable file
    const isExcel = (contentType as AxiosHeaders).includes(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    const isPdf = (contentType as AxiosHeaders).includes("application/pdf");
    const isDownloadable = isExcel || isPdf;

    if (
      !isDownloadable &&
      (contentType as AxiosHeaders).includes("application/json")
    ) {
      // Convert blob back to JSON to read error messages
      const text = await response.data.text();
      const jsonResponse = JSON.parse(text);

      if ("error" in jsonResponse) {
        if (showToast) toast.error(jsonResponse.error);
        throw new Error(jsonResponse.error);
      } else if ("message" in jsonResponse) {
        if (showToast) toast.success(jsonResponse.message);
        return jsonResponse;
      } else {
        if (showToast) toast("No data found");
        return jsonResponse;
      }
    }

    let finalFileName = fileName;
    if (!finalFileName) {
      // Try to extract from Content-Disposition header
      if (contentDisposition) {
        const match = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
        );
        if (match && match[1]) {
          finalFileName = match[1].replace(/['"]/g, "");
        }
      }

      // Fallback filename generation
      if (!finalFileName) {
        const timestamp = dayjs().format("DD-MM-YYYY");
        const extension = isExcel ? ".xlsx" : isPdf ? ".pdf" : "";
        const dateRange =
          params?.start && params?.end
            ? `-${params.start}-to-${params.end}`
            : "";
        finalFileName = `export-${timestamp}${dateRange}${extension}`;
      }
    }

    // Get the blob
    const blob = response.data;

    // Check if running in React Native WebView
    // @ts-expect-error
    if (typeof window.ReactNativeWebView !== "undefined") {
      // Convert to base64 for React Native
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64Data = (reader.result as string).split(",")[1];

        // @ts-expect-error
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: "blob",
            data: base64Data,
            fileName: finalFileName,
            contentType,
          }),
        );

        if (showToast) toast.success("Download initiated");
        if (onSuccess) onSuccess(finalFileName || "");
      };

      reader.onerror = () => {
        const error = new Error("Failed to convert file to base64");
        if (showToast) toast.error(error.message);
        if (onError) onError(error);
      };

      reader.readAsDataURL(blob);
    } else {
      // Web browser download
      FileSaver.saveAs(blob, finalFileName);

      if (showToast) toast.success(`File downloaded: ${finalFileName}`);
      if (onSuccess) onSuccess(finalFileName);
    }

    return { success: true, fileName: finalFileName };
  } catch (error) {
    console.error("Download error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Error while downloading file";

    if (showToast) toast.error(errorMessage);
    if (onError) onError(error as Error);

    throw error;
  }
};

//   endPoint: string,
//   params: any = {},
//   downloadFileName: string = ""
// ) => {
//   try {
//     const paramsString = queryString(params);
//     let token, user_role_id;
//     if (typeof window !== "undefined") {
//       token = localStorage.getItem("token")
//         ? (localStorage.getItem("token") as string)
//         : null;

//       const activeParmission = localStorage.getItem("active_permission")
//         ? JSON.parse(localStorage.getItem("active_permission") as string)
//         : null;
//       const active_region_index =
//         localStorage.getItem("active_region_index") ?? 0;

//       if (activeParmission != null) {
//         user_role_id =
//           activeParmission?.region[active_region_index]?.user_role_id;
//       }
//     }
//     const resp = await fetch(
//       `${process.env.NEXT_PUBLIC_API_URL}/${endPoint}${paramsString}`,
//       {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//           "x-functions-key": process.env.NEXT_PUBLIC_FUNCTION_KEY as string,
//           user_role_id,
//         },
//       }
//     );
//     if (
//       resp.headers.get("Content-Type") !==
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     ) {
//       // return Promise.resolve({"message": "No data found"})
//       const response = await resp.json();
//       if ("error" in response) {
//         toast.error(response["error"]);
//       } else if ("message" in response) {
//         toast.success(response["message"]);
//       } else {
//         toast.success("No data found");
//       }
//     } else {
//       let fileName = downloadFileName;
//       if (!downloadFileName) {
//         fileName = `export-${new Date().getTime()}${
//           params["start"] ? "-" + params["start"] : ""
//         }${params["end"] ? "-" + params["end"] : ""}`;
//       }
//       const file = await resp.blob();
//       FileSaver.saveAs(file, fileName);
//     }
//   } catch (error) {
//     console.error(error, "Error while downloading orders");
//   }
// };
export const getInitialValues = (
  active_permission: any,
  active_region_index: number = 0,
  active_region: Region | null = null,
) => {
  const key =
    active_permission?.role_region === "ashram"
      ? "country_id"
      : (`${active_permission?.role_region}_id` as keyof Region);
  if (active_region) {
    return { [key]: active_region?.[key] };
  }
  if (active_permission && active_permission?.region?.length > 0) {
    const item: any = {};
    item[key] = active_permission?.region[active_region_index][key];
    return item;
  }
  return {};
};

export const copyToClipboard = (value: string, msg?: string) => {
  navigator.clipboard
    .writeText(value)
    .then(() => {
      toast.success(msg ?? "Text copied to clipboard");
    })
    .catch((e) => {
      console.error(e);
      toast.error("Unable to copy");
    });
};

export const bettterResponse = (resp: object): Record<string, string> => {
  const total = Object.values(resp).reduce((p, a) => a + Number(p), 0);
  const tempobj = { ...resp, total };
  const arr = Object.values(tempobj).map((v: any) => v.toString().length);
  const max = Math.max(...arr);

  return Object.entries(tempobj).reduce((pre, [key, value]) => {
    return {
      ...pre,
      [key]: preleadingZero(value, max),
    };
  }, {});
};

export const getMSG_HN = (
  name: string,
  sr_no: number,
  type: string | null = "will_confirm_later",
) => {
  switch (type) {
    case "will_confirm_later":
      return `क्या आप Sr. No. ${sr_no} के लिए 'बाद मे बताएंगे' चुनना चाहते है?`;
    case "issue_with_rule":
      return `क्या आप Sr. No. ${sr_no} के लिए 'नियम मे दिक्कत' चुनना चाहते है?`;
    case "come_in_satsang":
      return `क्या आप Sr. No. ${sr_no} के लिए 'सत्संग मे आएंगे' चुनना चाहते है?`;
    case "interested":
      return `क्या आप Sr. No. ${sr_no} के लिए 'नामदान लेना है' चुनना चाहते है?`;
    case "jyada_ruchi":
      return `क्या आप Sr. No. ${sr_no} के लिए 'ज्यादा रूचि' चुनना चाहते है?`;
    case "satgyan_link_sent":
      return `क्या आप Sr. No. ${sr_no} के लिए 'सतज्ञान लिंक भेज दी' चुनना चाहते है?`;
    case "duplicate":
      return `क्या आप Sr. No. ${sr_no} के लिए 'डुप्लिकेट' चुनना चाहते है?`;
    case "book_not_receive":
      return `क्या आप Sr. No. ${sr_no} के लिए 'पुस्तक नहीं मिली' चुनना चाहते है?`;
    case "not_on_wa":
      return `क्या आप Sr. No. ${sr_no} के लिए 'व्हाट्सएप पर नहीं' चुनना चाहते है?`;
    case "not_interested":
      return `क्या आप Sr. No. ${sr_no} के लिए 'नामदान नहीं लेना है' चुनना चाहते है?`;
    case "mobile_no_issue":
      return `क्या आप Sr. No. ${sr_no} के लिए 'मोबाइल नंबर समस्या' चुनना चाहते है?`;
    case "got_initiation":
      return `क्या आप Sr. No. ${sr_no} के लिए 'नामदान प्राप्त है' चुनना चाहते है?`;
    case "out_of_reach":
      return `क्या आप Sr. No. ${sr_no} के लिए 'पहुँच से बाहर' चुनना चाहते है?`;
    case "ok":
      return `क्या आप Sr. No. ${sr_no} के लिए 'सही' चुनना चाहते है?`;
    case "want_book":
      return `क्या आप Sr. No. ${sr_no} के लिए 'बुक चाहिए' चुनना चाहते है?`;
    default:
      break;
  }
};

export const getHN_STATUS = (type: string | null = "will_confirm_later") => {
  switch (type) {
    case "will_confirm_later":
      return "बाद मे बताएंगे";
    case "issue_with_rule":
      return "नियम मे दिक्कत";
    case "come_in_satsang":
      return "सत्संग मे आएंगे";
    case "interested":
    case "interested_for_namdan":
      return "नामदान लेना है";
    case "jyada_ruchi":
      return "ज्यादा रूचि";
    case "satgyan_link_sent":
      return "सतज्ञान लिंक भेज दी";
    case "duplicate":
    case "Duplicate":
      return "डुप्लिकेट";
    case "book_not_receive":
      return "पुस्तक नहीं मिली";
    case "not_on_wa":
      return "व्हाट्सएप पर नहीं";
    case "not_interested":
      return "नामदान नहीं लेना है";
    case "mobile_no_issue":
      return "मोबाइल नंबर समस्या";
    case "got_initiation":
      return "नामदान प्राप्त है";
    case "out_of_reach":
      return "पहुँच से बाहर";
    case "ok":
      return "सही";
    case "want_book":
      return "बुक चाहिए";
    default:
      break;
  }
};

export const getHN_Lable = (str: string) => {
  switch (str) {
    case "Delivered":
      return "सेवा हो गयी";
    case "Duplicate":
      return "डुप्लिकेट";
    case "Different Area":
      return "गलत पता";
    case "Wrong Order":
      return "गलत ऑर्डर";

    default:
      return str;
  }
};

export const getHN_Reason = (str: string) => {
  switch (str) {
    case "Wrong Number":
    case "Wrong/Invalid Number":
      return "गलत नंबर";
    case "Number does not exist":
      return "मोबाइल नंबर अस्तित्व में नहीं";
    case "Fake Address":
      return "गलत पता";
    case "Select Issue":
      return "समस्या चुनें";
    case "Select reason":
      return "कारण चुनें";
    default:
      return str;
  }
};

export const formatDate = (date: string | Date, format = "DD-MM-YYYY") =>
  dayjs(date).utc(true).format(format);
