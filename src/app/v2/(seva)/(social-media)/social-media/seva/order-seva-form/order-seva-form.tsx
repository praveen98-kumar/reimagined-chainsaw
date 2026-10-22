"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useAppSelector } from "@/redux/store";
import apiClient from "@/http/index";
import {
  getMobilePin,
  allLangPincodeRegex,
} from "@/shared/functions/get-pincode";
import { getOptionArray } from "@/shared/functions/utils";
import { getCountries } from "@/shared/functions/location";
import { Option } from "@/shared/interfaces/option";
import { useCount } from "@/hooks/useCount";

import { Input } from "@/components/v2/ui/input";
import { Textarea } from "@/components/v2/ui/textarea";
import { OrderCard } from "@/components/v2/OrderCard";
import { SelectionGroup } from "@/components/v2/SelectionGroup";
import { Button } from "@/components/v2/ui/button";
import { ReactSelect } from "@/components/v2/ReactSelect";
import { Checkbox } from "@/components/v2/ui/checkbox";
import { Label } from "@/components/v2/ui/label";
import { ResultDialog } from "@/components/v2/ResultDialog";

export type OrderType = "National" | "Emergency" | "International";

type DialogMode = "success" | "error" | "warn";

interface OrderSevaFormProps {
  type: OrderType;
  isEdit?: boolean;
  order?: any;
  onClose?: () => void;
  onUpdateComplete?: (data: any) => void;
  onSubmitSuccess?: (data: any, message?: string) => void;
  onShowResult?: (mode: DialogMode, title: string, message?: string) => void;
  clearFormOnSuccess?: boolean;
  userRoleId?: number;
}

const nationalSchema = Yup.object({
  message: Yup.string().required("Address is required."),
  mobile_no: Yup.string().required("Mobile number is required"),
  alt_mobile_no: Yup.string(),
  pincode: Yup.string().matches(allLangPincodeRegex, "Invalid pincode format"),
  book: Yup.number().required("Book is required."),
  book_language_id: Yup.number()
    .required("Language is required.")
    .test(
      "book_language_id",
      "Language is required",
      (v: any) => Number(v) > 0,
    ),
});

const internationalSchema = Yup.object({
  message: Yup.string().required("Address is required."),
  mobile_no: Yup.string(),
  country_id: Yup.number()
    .required("Country is required.")
    .min(1, "Country is required."),
  alt_mobile_no: Yup.string(),
  pincode: Yup.string(),
  book: Yup.number().required("Book is required."),
  book_language_id: Yup.number()
    .required("Language is required.")
    .test(
      "book_language_id",
      "Language is required",
      (v: any) => Number(v) > 0,
    ),
});

export const OrderSevaForm: React.FC<OrderSevaFormProps> = ({
  type,
  isEdit,
  order,
  onClose,
  onUpdateComplete,
  onSubmitSuccess,
  onShowResult,
  clearFormOnSuccess = true,
  userRoleId,
}) => {
  const [activeType, setActiveType] = useState<OrderType>(type);

  useEffect(() => {
    setActiveType(type);
  }, [type]);

  const formRef = useRef<any>(null);
  const { update } = useCount();
  const [resultDialog, setResultDialog] = useState<{
    open: boolean;
    mode: DialogMode;
    title: string;
    message?: string;
  }>({ open: false, mode: "success", title: "", message: undefined });
  const [books, setBooks] = useState<Option[]>([]);
  const [bookLanguages, setBookLanguages] = useState<Record<number, Option[]>>(
    {},
  );
  const [languages, setLanguages] = useState<Option[]>([]);
  const [countries, setCountries] = useState<Option[]>([]);

  const { active_permission, active_region_index } = useAppSelector(
    (state) => state.auth,
  );
  const activeRegion = active_permission?.region[active_region_index];

  const themeConfig = {
    National: {
      gradient: "from-[#02233C] to-[#256AF5]",
      title: "Regular Book Order",
    },
    Emergency: {
      gradient: "from-[#3C0203] to-[#F52528]",
      title: "Emergency Book Order",
    },
    International: {
      gradient: "from-[#023C3A] to-[#0AD4CD]",
      title: isEdit ? "International Book Order" : "Regular Book Order",
    },
  }[activeType];

  const isInternational = activeType === "International";
  const isEmergency = activeType === "Emergency";

  const fetchBooks = async () => {
    try {
      const { data } = await apiClient.get("books?short_list=1");
      const bookOptions = getOptionArray(data.data, "title", "id");

      const bookLangMap = data.data.reduce((acc: any, book: any) => {
        acc[book.id] = getOptionArray(
          book.languages,
          "name",
          "book_language_id",
        );
        return acc;
      }, {});

      setBooks(bookOptions);
      setBookLanguages(bookLangMap);

      if (bookOptions.length > 0) {
        const initialBookId = isEdit
          ? order?.book_id
          : bookOptions.find((b) => b.label === "Gyan Ganga")?.value ||
            bookOptions[0].value;
        formRef.current?.setFieldValue("book", initialBookId);

        const langOptions = bookLangMap[initialBookId as number] || [];
        setLanguages(langOptions);

        if (langOptions.length > 0) {
          const initialLangId = isEdit
            ? order?.book_language_id
            : langOptions.find((l: Option) => l.label === "Hindi")?.value ||
              langOptions[0].value;
          formRef.current?.setFieldValue("book_language_id", initialLangId);
        }
      }
    } catch (error) {
      console.error("Failed to fetch books:", error);
      toast.error("Failed to load books");
    }
  };

  const fetchCountries = async () => {
    try {
      const countryData = await getCountries();
      setCountries(countryData);
    } catch (error) {
      console.error("Failed to fetch countries:", error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    if (isInternational) {
      fetchCountries();
    }
  }, [type, isInternational]);

  const handleAddressChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    setFieldValue: any,
  ) => {
    const val = e.target.value;
    setFieldValue("message", val);

    if (!isInternational) {
      const { mobileNumber, pinCodes, converted } = getMobilePin(val);
      setFieldValue("pincode", pinCodes?.[0]?.replace(" ", "") ?? "");
      setFieldValue("mobile_no", mobileNumber?.[0]?.slice(-10) ?? "");
      setFieldValue("alt_mobile_no", mobileNumber?.[1]?.slice(-10) ?? "");
      setFieldValue("message", converted ?? "");
    }
  };

  const handleSubmit = async (
    values: any,
    { setSubmitting, setFieldValue }: any,
  ) => {
    try {
      let payload = { ...values };

      if (!isInternational) {
        payload.country_id = activeRegion?.country_id;
        payload.mobile_no = payload.mobile_no ? `+91${payload.mobile_no}` : "";
        payload.alt_mobile_no = payload.alt_mobile_no
          ? `+91${payload.alt_mobile_no}`
          : "";
      } else {
        payload.pincode = "";
        payload.mobile_no = "";
      }
      payload.book = values?.book + "";

      if (isEdit) {
        payload.category = order?.category;
      }
      const endpoint = isEdit
        ? `update_order/${order.id}`
        : "set_order_in_queue";
      const method = isEdit ? "put" : "post";
      const headers = userRoleId ? { user_role_id: userRoleId } : {};

      const response = await apiClient[method](
        endpoint,
        {
          ...payload,
          emergency: isEmergency ? "1" : "0",
        },
        {
          headers,
        },
      );

      if (response.data?.message?.includes("Incomplete")) {
        if (onShowResult) {
          onShowResult("error", "Error!", response.data.message);
        } else {
          setResultDialog({
            open: true,
            mode: "error",
            title: "Error!",
            message: response.data.message,
          });
        }
      } else {
        const successTitle = isEdit ? "Order Updated!" : "Order Submitted!";
        if (onShowResult) {
          onShowResult("success", successTitle, response.data?.message);
        } else {
          setResultDialog({
            open: true,
            mode: "success",
            title: successTitle,
            message: response.data?.message,
          });
        }

        if (isEdit) {
          if (onUpdateComplete) {
            onUpdateComplete(response.data.data);
          }
          if (onSubmitSuccess) {
            onSubmitSuccess(response.data.data, response.data?.message);
          }
          if (!clearFormOnSuccess) {
            onClose?.();
          }
        } else {
          if (onSubmitSuccess) {
            onSubmitSuccess(response.data.data, response.data?.message);
          }

          const seva_by =
            typeof window !== "undefined"
              ? localStorage.getItem("seva_by")
              : null;
          if (!response.data?.data?.complain_raise && !seva_by) {
            update("bookOrderCounts", "tehsil_id", {
              role: active_permission?.role,
              tehsil_id: activeRegion?.tehsil_id,
              counts: isInternational ? { mic: 1, tic: 1 } : { mnc: 1, tnc: 1 },
            });
          }

          if (clearFormOnSuccess) {
            setFieldValue("message", "");
            setFieldValue("pincode", "");
            setFieldValue("mobile_no", "");
            setFieldValue("alt_mobile_no", "");
          }
        }
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error ||
        `Failed to ${isEdit ? "update" : "submit"} order`;
      const mode: DialogMode = errorMsg.toLowerCase().includes("duplicate")
        ? "warn"
        : "error";
      const title = mode === "warn" ? "Duplicate!" : "Error!";
      if (onShowResult) {
        onShowResult(mode, title, errorMsg);
      } else {
        setResultDialog({ open: true, mode, title, message: errorMsg });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Formik
        innerRef={formRef}
        initialValues={{
          message: isEdit ? order?.message : "",
          mobile_no: isEdit ? order?.mobile_no?.slice(-10) || "" : "",
          alt_mobile_no: isEdit
            ? order?.alt_mobile_no?.toString().slice(-10) || ""
            : "",
          pincode: isEdit ? order?.pincode || "" : "",
          book: isEdit ? order?.book_id : "",
          book_language_id: isEdit ? order?.book_language_id : 0,
          country_id: isEdit ? order?.country_id : 0,
        }}
        validationSchema={
          isInternational ? internationalSchema : nationalSchema
        }
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, setFieldValue, isSubmitting, errors, touched }) => (
          <Form className="flex flex-col gap-4 p-4">
            <OrderCard
              title={themeConfig.title}
              gradientClass={themeConfig.gradient}
            >
              {isEdit && (
                <div className="flex flex-col gap-2 mb-4 px-4 pt-1.5">
                  <span className="text-sm font-semibold text-slate-700">
                    Convert to:
                  </span>
                  <div className="flex gap-4">
                    {activeType !== "Emergency" && (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="convert-emergency"
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setActiveType("Emergency");
                            }
                          }}
                        />
                        <Label
                          htmlFor="convert-emergency"
                          className="text-sm text-red-500 font-medium"
                        >
                          Emergency Order
                        </Label>
                      </div>
                    )}
                    {activeType !== "International" && (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="convert-international"
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setActiveType("International");
                            }
                          }}
                        />
                        <Label
                          htmlFor="convert-international"
                          className="text-sm text-slate-700 font-medium"
                        >
                          International Order
                        </Label>
                      </div>
                    )}
                    {activeType !== "National" && (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="convert-national"
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setActiveType("National");
                            }
                          }}
                        />
                        <Label
                          htmlFor="convert-national"
                          className="text-sm text-blue-500 font-medium"
                        >
                          National Order
                        </Label>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-1 px-4 py-1.5">
                <Textarea
                  name="message"
                  value={values.message}
                  onChange={(e) => handleAddressChange(e, setFieldValue)}
                  placeholder="Paste Book Order Address Here"
                  className={`h-40 rounded-2xl border-[#D1D5DB] placeholder:text-slate-400 ${
                    errors.message && touched.message ? "border-red-500" : ""
                  }`}
                />
                {errors.message && touched.message && (
                  <span className="text-red-500 text-xs px-1">
                    {errors.message as string}
                  </span>
                )}
              </div>

              {isInternational ? (
                <div className="flex flex-col gap-1 px-4 py-1.5 pb-4">
                  <label htmlFor="country_id" className="text-sm font-medium">
                    Country<span className="text-red-500">*</span>
                  </label>
                  <ReactSelect
                    options={countries}
                    placeholder="Select Country"
                    value={
                      countries.find(
                        (c) => Number(c.value) === Number(values.country_id),
                      ) || null
                    }
                    onChange={(val: any) =>
                      setFieldValue("country_id", val?.value || 0)
                    }
                    classNamePrefix="react-select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: "12px",
                        minHeight: "40px",
                        borderColor:
                          errors.country_id && touched.country_id
                            ? "#ef4444"
                            : "#D1D5DB",
                        boxShadow: "none",
                        "&:hover": {
                          borderColor:
                            errors.country_id && touched.country_id
                              ? "#ef4444"
                              : "#D1D5DB",
                        },
                      }),
                      menu: (old: any) => ({ ...old, zIndex: 1000 }),
                    }}
                  />
                  {errors.country_id && touched.country_id && (
                    <span className="text-red-500 text-xs px-1">
                      {errors.country_id as string}
                    </span>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 px-4 pb-4">
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="pincode"
                      className="text-[11px] text-slate-600"
                    >
                      Pincode<span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="pincode"
                      value={values.pincode}
                      readOnly
                      disabled
                      className={`h-10 rounded-xl border-[#D1D5DB] text-center bg-slate-50 ${
                        errors.pincode && touched.pincode
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="mobile_no"
                      className="text-[11px] text-slate-600"
                    >
                      Mobile Number<span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="mobile_no"
                      value={values.mobile_no}
                      readOnly
                      disabled
                      className={`h-10 rounded-xl border-[#D1D5DB] text-center bg-slate-50 ${
                        errors.mobile_no && touched.mobile_no
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="alt_mobile_no"
                      className="text-[11px] text-slate-600 text-nowrap"
                    >
                      Alt Mobile Number
                    </label>
                    <Input
                      name="alt_mobile_no"
                      value={values.alt_mobile_no}
                      readOnly
                      disabled
                      className="h-10 rounded-xl border-[#D1D5DB] text-center bg-slate-50"
                    />
                  </div>
                </div>
              )}
            </OrderCard>

            <OrderCard
              title="Book Details"
              gradientClass={themeConfig.gradient}
            >
              <SelectionGroup
                title="Book"
                name="book"
                items={books}
                value={values.book}
                onChange={(val) => {
                  setFieldValue("book", val);
                  const bookLangs = bookLanguages[val as number] || [];
                  setLanguages(bookLangs);
                  if (bookLangs.length > 0) {
                    const defaultLang =
                      bookLangs.find((l) => l.label === "Hindi")?.value ||
                      bookLangs[0].value;
                    setFieldValue("book_language_id", defaultLang);
                  } else {
                    setFieldValue("book_language_id", 0);
                  }
                }}
                required
              />
              {errors.book && touched.book && (
                <span className="text-red-500 text-xs">
                  {errors.book as string}
                </span>
              )}

              <hr className="h-px bg-slate-300" />
              <SelectionGroup
                title="Language"
                name="book_language_id"
                items={languages}
                value={values.book_language_id}
                onChange={(val) => setFieldValue("book_language_id", val)}
                required
              />
              {errors.book_language_id && touched.book_language_id && (
                <span className="text-red-500 text-xs">
                  {errors.book_language_id as string}
                </span>
              )}
            </OrderCard>

            <div className="flex justify-center gap-4 mt-2">
              <Button
                variant="submit"
                type="submit"
                disabled={isSubmitting}
                className="w-1/2 h-12 font-bold text-xl shadow-lg active:scale-95 transition-transform"
              >
                {isSubmitting
                  ? isEdit
                    ? "Updating..."
                    : "Submitting..."
                  : isEdit
                    ? "Update"
                    : "Submit"}
              </Button>
              {onClose && (
                <Button
                  variant="cancel"
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-12 font-bold text-xl shadow-lg active:scale-95 transition-transform"
                >
                  Cancel
                </Button>
              )}
            </div>
          </Form>
        )}
      </Formik>

      <ResultDialog
        mode={resultDialog.mode}
        title={resultDialog.title}
        description={resultDialog.message}
        open={resultDialog.open}
        onOpenChange={(open) => {
          setResultDialog((prev) => ({ ...prev, open }));
        }}
      />
    </>
  );
};
