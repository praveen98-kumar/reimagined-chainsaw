import Button from "@/components/Button";
import Layout from "@/components/Layout";
import Radio from "@/components/input/Radio";
import Select from "@/components/input/Select";
import TextArea from "@/components/input/TextArea";
import TextInput from "@/components/input/TextInput";
import apiClient from "@/http/index";
import { useAppSelector } from "@/redux/store";
import {
  allLangPincodeRegex,
  getMobilePin,
} from "@/shared/functions/get-pincode";
import { getCountries } from "@/shared/functions/location";
import { cn, getOptionArray } from "@/shared/functions/utils";
import { Option } from "@/shared/interfaces/option";
import { Form, Formik } from "formik";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { ImMobile } from "react-icons/im";
import { MdMyLocation } from "react-icons/md";
import { RiBuilding4Fill } from "react-icons/ri";
import { NextApplicationPage } from "@/shared/interfaces/app";
import * as Yup from "yup";
import { useCount } from "@/hooks/useCount";

export const schema = Yup.object({
  message: Yup.string().required("Address is required."),
  mobile_no: Yup.string().required("Mobile number is required"),
  country_id: Yup.number(),
  alt_mobile_no: Yup.string(),
  pincode: Yup.string().matches(allLangPincodeRegex, "Invalid pincode format"),
  book: Yup.number().required("Book is required."),
  book_language_id: Yup.number()
    .required("Language is required.")
    .test(
      "book_language_id",
      "Language is required",
      (v: any) => Number(v) > 0
    ),
});
export const internationalSchema = Yup.object({
  message: Yup.string().required("Address is required."),
  mobile_no: Yup.string(),
  country_id: Yup.number(),
  alt_mobile_no: Yup.string(),
  pincode: Yup.string(),
  book: Yup.number().required("Book is required."),
  book_language_id: Yup.number()
    .required("Language is required.")
    .test(
      "book_language_id",
      "Language is required",
      (v: any) => Number(v) > 0
    ),
});

const BookOrderForm: NextApplicationPage = () => {
  const { t: tc } = useTranslation("common");
  const { t } = useTranslation("order");
  const { update } = useCount();
  const [books, setBooks] = useState<Array<Option>>([]);
  const router = useRouter();
  const { active_permission, active_region_index } = useAppSelector(
    (state) => state.auth
  );
  const [countryType, setCountryType] = useState<string>("");
  const [languages, setLanguage] = useState<Option[]>([]);
  const [bookLanguages, setBookLanguages] = useState<Record<number, Option[]>>(
    {}
  );

  const activeRegion = active_permission?.region[active_region_index];
  const [defaultBook, setDefaultBook] = useState<string | undefined>(undefined);
  const [defaultBookLang, setDefaultBookLang] = useState<number | undefined>(
    undefined
  );
  const [isEmegencey, setIsEmergency] = useState(false);
  const [country, setCountry] = useState<Option[]>([]);
  const formRef = useRef<any>(null);

  const getBooks = async () => {
    try {
      const { data } = await apiClient.get("books?short_list=1");
      const temp = getOptionArray(data.data, "title", "id");

      const bookLanguageMap = data.data.reduce(
        (acc: any, prev: any) => ({ ...acc, [prev.id]: prev.languages }),
        {}
      );
      setBooks(temp);
      const dBook =
        temp.find(({ label }) => label === "Gyan Ganga")?.value ??
        temp[0].value;
      setDefaultBook(dBook.toString());
      setBookLanguages(bookLanguageMap);
      formRef?.current?.setFieldValue("book", dBook.toString());
      const selectedBookLanguages = getOptionArray(
        bookLanguageMap[dBook ?? 2],
        "name",
        "book_language_id"
      );
      setLanguage(selectedBookLanguages);
      const defaultlang =
        selectedBookLanguages.find(({ label }) => label === "Hindi")?.value ??
        selectedBookLanguages[0].value;
      setDefaultBookLang(Number(defaultlang));
      formRef?.current?.setFieldValue("book_language_id", defaultlang);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (router.query.countryType) {
      setCountryType(router.query.countryType as string);
      if (router.query.countryType == "international") {
        (async () => {
          const country = await getCountries();
          setCountry(
            country.filter(
              (c) =>
                c.value !=
                active_permission?.region[active_region_index].country_id
            )
          );
        })();
      }
    }
    if (router.query.emergency) {
      setIsEmergency(true);
    }
  }, [router.isReady]);

  useEffect(() => {
    getBooks();
  }, []);

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: `${t("seva.heading.order", {
          emergency: isEmegencey ? tc("emergency") : "",
          countryType: tc(countryType),
        })}`,
      }}
    >
      <Formik
        innerRef={formRef}
        initialValues={{
          message: "",
          mobile_no: "",
          alt_mobile_no: "",
          pincode: "",
          book_language_id: 0,
          book: "",
          country_id: 0,
        }}
        validationSchema={
          countryType == "national" ? schema : internationalSchema
        }
        validateOnChange
        onSubmit={async (
          { country_id, ...values },
          { resetForm, setFieldValue }
        ) => {
          try {
            if (countryType == "national") {
              country_id = Number(
                active_permission?.region[active_region_index].country_id
              );
              values.mobile_no =
                values.mobile_no != "" ? `+91${values.mobile_no}` : "";
              values.alt_mobile_no =
                values.alt_mobile_no != "" ? `+91${values.alt_mobile_no}}` : "";
            } else {
              values.pincode = "";
              values.mobile_no = "";
            }
            const { book, book_language_id, ...rest } = values;
            const response = await apiClient.post("set_order_in_queue", {
              ...values,
              ...(typeof country_id === "number" &&
                country_id > 0 && { country_id }),
              emergency: isEmegencey ? "1" : "0",
            });
            if (response.data?.message.includes("Incomplete")) {
              toast.error(response.data?.message, { duration: 7000 });
            } else {
              toast.success("Order submitted successfully", { duration: 7000 });
            }
            const seva_by = localStorage.getItem("seva_by");
            if (!response.data?.data?.complain_raise && !seva_by) {
              update("bookOrderCounts", "tehsil_id", {
                role: active_permission?.role,
                tehsil_id: activeRegion?.tehsil_id,
                counts:
                  countryType === "international"
                    ? { mic: 1, tic: 1 }
                    : { mnc: 1, tnc: 1 },
              });
            }
            // resetForm();
            setFieldValue("alt_mobile_no", "");
            setFieldValue("mobile_no", "");
            setFieldValue("pincode", "");
            setFieldValue("message", "");
          } catch (e: any) {
            toast.error(e.response.data?.error);
          }
        }}
      >
        {({
          handleChange,
          setFieldValue,
          touched,
          errors,
          isSubmitting,
          values,
        }) => (
          <Form className="flex flex-col mx-auto h-full p-4 w-full max-w-xl space-y-1">
            <TextArea
              wrapperClass="-mb-1"
              name="message"
              className={"pr-12 placeholder:text-gray-400"}
              placeholder="Paste book order message here...."
              label={tc("book_message") ?? "Book Order Detail"}
              Icon={RiBuilding4Fill}
              rows={8}
              required
              style={{ resize: "none" }}
              onChange={(e) => {
                handleChange(e);
                const { mobileNumber, pinCodes, converted } = getMobilePin(
                  e.target.value
                );
                setFieldValue("pincode", pinCodes?.[0]?.replace(" ", "") ?? "");
                setFieldValue("mobile_no", mobileNumber?.[0]?.slice(-10) ?? "");
                setFieldValue(
                  "alt_mobile_no",
                  mobileNumber?.[1]?.slice(-10) ?? ""
                );
                setFieldValue("message", converted ?? "");
              }}
            />
            {countryType == "international" && (
              <Select
                name="country_id"
                options={country}
                label={tc("country") ?? "Country"}
                isClearable
                placeholder={tc("select_country") ?? "Select Country"}
                value={
                  country.find((c) => c.value == values.country_id) ?? null
                }
                onChange={(e: any) => {
                  setFieldValue("country_id", e.value);
                }}
              />
            )}
            {countryType == "national" && (
              <>
                <TextInput
                  name="pincode"
                  inputMode="numeric"
                  maxLength={6}
                  fieldClass="flex -mt-1 items-center flex-row justify-between pb-2 border-b border-gray-400"
                  label={tc("pin") ?? "Pin code"}
                  disabled
                  Icon={MdMyLocation}
                />
                <div className="grid xs:grid-cols-2 gap-2 xs:border-b xs:border-gray-400">
                  <TextInput
                    name="mobile_no"
                    className={cn(
                      "",
                      errors?.mobile_no &&
                        touched?.mobile_no &&
                        "disabled:border-red-500"
                    )}
                    label={tc("mobile_no") ?? "Mobile Number"}
                    disabled
                    required={countryType === "national"}
                    Icon={ImMobile}
                  />
                  <TextInput
                    name="alt_mobile_no"
                    // placeholder="Enter Mobile Number"
                    label={tc("alt_mobile_no") ?? "Alt. Mobile Number"}
                    Icon={ImMobile}
                    disabled
                  />
                </div>
              </>
            )}
            <Radio
              wrapperClass="pb-2 mt-1 border-b border-gray-400"
              name="book"
              onChange={(e) => {
                setFieldValue("book", e.target.value);
                const selectedBookLanguages = getOptionArray(
                  bookLanguages[Number(e.target.value)],
                  "name",
                  "book_language_id"
                );
                setLanguage(selectedBookLanguages);
                const defaultlang =
                  selectedBookLanguages.find(({ label }) => label === "Hindi")
                    ?.value ?? selectedBookLanguages[0].value;
                formRef?.current?.setFieldValue(
                  "book_language_id",
                  defaultlang
                );
              }}
              inputClassName="focus:border-pink-400 dark:focus:border-pink-300 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-pink-300 text-pink-700"
              className="text-green-600"
              options={books}
              required
              label={tc("select_book") ?? "Select Book"}
            />
            <Radio
              radioGroupClass="xs:grid-cols-3 "
              name="book_language_id"
              onChange={(e) => {
                setFieldValue("book_language_id", e.target.value);
              }}
              inputClassName="focus:border-pink-400 dark:focus:border-pink-300 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-pink-300 text-pink-700"
              className="text-green-600"
              options={languages}
              required
              label={tc("language") ?? "Language"}
            />
            <Button
              variant="primary"
              type="submit"
              className="bg-green-600 mx-auto"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {t("submit_order")}
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

BookOrderForm.requireAuth = true;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "order"])),
    },
  };
};

export default BookOrderForm;
