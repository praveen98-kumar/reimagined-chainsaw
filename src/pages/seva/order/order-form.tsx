import React, { useEffect, useMemo, useRef, useState } from "react";
import { Form, Formik } from "formik";
import Layout from "@/components/Layout";
import Select from "@/components/input/Select";
import TextInput from "@/components/input/TextInput";
import TextArea from "@/components/input/TextArea";
import Radio from "@/components/input/Radio";
import Button from "@/components/Button";
import { FaMobileAlt } from "react-icons/fa";
import { useRouter } from "next/router";
import {
  getCountries,
  handleCountryChange,
  handleStateChange,
} from "@/shared/functions/location";
import { Option } from "@/shared/interfaces/option";
import apiClient from "@/http/index";
import { NamdanCenter } from "@/shared/interfaces/calling";
import toast from "react-hot-toast";
import { capitalizeWords, getOptionArray } from "@/shared/functions/utils";
import * as Yup from "yup";
import { MdClose } from "react-icons/md";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "react-i18next";
import UserwiseDropdown from "@/components/UserwiseDropdown";
import { INCOMPLETE_ORDER_STATUS } from "@/shared/interfaces/app";
import { useCount } from "@/hooks/useCount";
import { useAppSelector } from "@/redux/store";

export interface Book {
  title: string;
  id: number;
  languages: Language[];
}

export interface Language {
  book_language_id: number;
  name: string;
}

const OrderForm = () => {
  const { t: tc } = useTranslation("common");
  const { t } = useTranslation("order");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [fromComplain, setFromComplain] = useState(false);
  const [channels, setChannels] = useState<Option[]>([]);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [books, setBooks] = useState([]);
  const [languages, setLanguage] = useState<Option[]>([]);
  const [countries, setCountries] = useState<Option[]>([]);
  const [states, setStates] = useState<Option[]>([]);
  const [districts, setDistricts] = useState<Option[]>([]);
  const [states1, setStates1] = useState<Option[]>([]);
  const [districts1, setDistricts1] = useState<Option[]>([]);
  const [pincodes, setPincodes] = useState<Option[]>([]);
  const [namdan_center_list, setNamdanCenter] = useState<NamdanCenter[]>([]);
  const { update: updateCounts } = useCount();
  const { active_permission, active_region_index } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    const getBooks = async () => {
      try {
        const response = await apiClient.get("books?short_list=1");
        const tempBooks = response.data?.data.map((item: any) => ({
          label: item.title.toString(),
          value: item.id.toString(),
        }));
        setBooks(tempBooks);
        setAllBooks(response.data?.data);
      } catch (error) {
        console.log(error);
      }
    };
    const getSatsangList = async () => {
      try {
        if (!fromComplain) {
          const response = await apiClient.get("satsang_channel_list");
          const list = response.data?.data.map((item: any) => ({
            label: item.name.toString(),
            value: item.id.toString(),
          }));
          setChannels(list);
        }
      } catch (error) {
        console.log(error);
      }
    };

    getBooks();
    getSatsangList();
  }, []);

  const orderDetail = JSON.parse(localStorage.getItem("orderDetail") || "");
  const bookChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let language: Option[] = allBooks
      .filter((book) => book.id == +e.target.value)
      .map((r) => r?.languages)[0]
      .reduce((pre: any, curr: any) => {
        return [
          ...pre,
          {
            value: curr.book_language_id,
            label: curr.name,
          },
        ];
      }, []);
    setLanguage(language);
  };
  useEffect(() => {
    if (router.isReady) {
      setQuery(router.query?.type as string);
      setFromComplain(router.query?.complain == "1");
    }
  }, [router.isReady]);

  useEffect(() => {
    (async () => {
      const countries = await getCountries();
      setCountries(countries);
      handleCountryChange(2, setStates);
    })();
  }, []);

  const formRef = useRef<any>(null);
  const schema = React.useMemo(
    () =>
      Yup.object({
        satsang_channel_id:
          router.query?.seva_type == "miss_call_response"
            ? Yup.number().test(
                "satsang_channel_id",
                "Select Satsang channel",
                (v: any) => Number(v) > 0,
              )
            : Yup.number(),
        name: Yup.string().required("Name is required"),
        mobile_no: Yup.string().required("Mobile No is required"),
        alt_mobile_no: Yup.number(),
        country_id: Yup.number()
          .required("Country is required")
          .test("country_id", "Select Country", (v: any) => Number(v) > 0),
        state_id: Yup.number().required("State is required"),
        district_id: Yup.number().required("District is required"),
        tehsil_id: Yup.number().required("Tehsil is required"),
        message: Yup.string().required("Address is required"),
        pincode: Yup.number()
          .required("Pincode is required")
          .typeError("Invalid pincode."),
        book_language_id: Yup.number()
          .required("Select Language")
          .test(
            "book_language_id",
            "Language is required",
            (v: any) => Number(v) > 0,
          ),
        book: Yup.number().required("Select book"),
        emergency: Yup.number(),
      }),
    [router.query?.seva_type],
  );
  return (
    <Layout
      headerProps={{
        isBack: true,
        heading:
          router.query?.seva_type === "incorrect_order_response"
            ? "Update Details"
            : router.query?.seva_type === "miss_call_response" &&
                router.query.type == "interested"
              ? (t("seva.heading.namdan_form") ?? "Interested (Namdan) Form")
              : (t("seva.heading.order_complain_form") ??
                "Book Order Complain Form"),
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-0 flex flex-col justify-center items-start">
        <Formik
          innerRef={formRef}
          validationSchema={schema}
          initialValues={{
            satsang_channel_id: 0,
            name: "",
            mobile_no: router.query?.mobile_no ?? orderDetail.mobile_no ?? "",
            alt_mobile_no: "",
            country_id: 0,
            state_id: 0,
            district_id: 0,
            tehsil_id: 0,
            message: "",
            pincode: "",
            book_language_id: 0,
            book: "",
            emergency:
              router.query?.seva_type == "incorrect_order_response" ? 0 : 1,
          }}
          onSubmit={async ({ book, ...rest }) => {
            try {
              let data: any = {
                ...rest,
                response_type:
                  router.query?.seva_type == "miss_call_response"
                    ? query
                    : INCOMPLETE_ORDER_STATUS.WANT_BOOK,
              };
              if (router.query?.seva_type == "miss_call_response") {
                data["miss_call_id"] = orderDetail.order_id;
              } else if (
                router.query?.seva_type == "incorrect_order_response"
              ) {
                data["incorrect_order_id"] = orderDetail.id;
              } else if (router.query?.complain == "1") {
                data["from_complain"] = "1";
                delete data["response_type"];
              } else {
                return;
              }
              if (!data["mobile_no"].includes("+91")) {
                data["mobile_no"] = "+91" + data["mobile_no"];
              }
              const response = await apiClient.post(
                fromComplain
                  ? "set_order_in_queue"
                  : (router.query?.seva_type as string),
                data,
              );
              if (router.query?.seva_type == "incorrect_order_response") {
                updateCounts("incorrectCounts", "country_id", {
                  role: active_permission?.role,
                  country_id:
                    active_permission?.region[active_region_index]?.country_id,
                  counts: {
                    pending_order: -1,
                    ctm: 1,
                    ctd: 1,
                  },
                });
              } else if (router.query?.seva_type == "s_imcomplete_calling") {
                updateCounts("sincorrectCounts", "country_id", {
                  role: active_permission?.role,
                  country_id:
                    active_permission?.region[active_region_index]?.country_id,
                  counts: {
                    pending_order: -1,
                    ctm: 1,
                    ctd: 1,
                  },
                });
              }
              router.back();
              toast.success(response.data?.message);
            } catch (error: any) {
              toast.success(error.resposne.data.error);
            }
          }}
        >
          {({ handleChange, values, errors, touched, setFieldValue }) => (
            <Form className="w-full max-w-xl">
              {router.query?.seva_type === "miss_call_response" && (
                <Select
                  options={channels}
                  label={tc("satsang_channel") ?? "Satsang Channel"}
                  name="satsang_channel_id"
                  error={errors.satsang_channel_id}
                  touched={touched.satsang_channel_id}
                  onChange={(e: any) =>
                    setFieldValue("satsang_channel_id", e.value)
                  }
                  value={
                    channels.find(
                      (c) => c.value == values.satsang_channel_id,
                    ) ?? null
                  }
                />
              )}
              <TextInput
                name="name"
                label={tc("name") ?? "Name"}
                required
                fieldClass={"mb-1 space-y-0"}
              />
              <TextInput
                name="mobile_no"
                label={tc("mobile_no") ?? "Mobile Number"}
                inputMode="numeric"
                required
                prependEle={
                  <div className="flex absolute space-x-1 items-center -translate-y-1/2 top-1/2 right-4">
                    <FaMobileAlt className="w-6 h-6 text-gray-500 pointer-events-none" />
                  </div>
                }
                disabled
                fieldClass={"mb-1 space-y-0"}
              />
              <TextInput
                name="alt_mobile_no"
                label={tc("alt_mobile_no") ?? "Alt Mobile Number"}
                inputMode="numeric"
                prependEle={
                  <div className="flex absolute space-x-1 items-center -translate-y-1/2 top-1/2 right-4">
                    {values.alt_mobile_no.length > 0 && (
                      <MdClose
                        onClick={() => setFieldValue("alt_mobile_no", "")}
                        className="w-5 h-5 text-gray-500 cursor-pointer"
                      />
                    )}
                    <FaMobileAlt className="w-6 h-6 text-gray-500 pointer-events-none" />
                  </div>
                }
                fieldClass={"mb-1 space-y-0"}
              />
              <UserwiseDropdown
                useHirarchy={false}
                required={true}
                fieldClass={"mb-0 space-y-0"}
                onChange={{
                  state_id: () => setPincodes([]),
                  district_id: () => setPincodes([]),
                  tehsil_id: async ({ value }) => {
                    const { data } = await apiClient.get(
                      "pincode_from_pincode_orders",
                      {
                        params: {
                          tehsil_id: value,
                        },
                      },
                    );
                    setPincodes(
                      getOptionArray(data.data, "pincode", "pincode"),
                    );
                  },
                }}
              />
              <TextArea
                name="message"
                label={tc("address") ?? "Address"}
                required
                rows={3}
                wrapperClass={"mb-1 space-y-0"}
              />
              <Select
                options={pincodes}
                label={tc("pin") ?? "Pin Code"}
                name="pincode"
                required
                placeholder={tc("pin") ?? "Pin Code"}
                onChange={(e: any) => setFieldValue("pincode", e.value)}
                error={errors.pincode}
                touched={touched.pincode}
              />
              <Radio
                options={books}
                onChange={(e) => {
                  handleChange(e);
                  bookChange(e);
                }}
                required
                name="book"
                label={tc("select_book") ?? "Select Book"}
                wrapperClass={"mb-1 space-y-0"}
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
                wrapperClass={"mb-1 space-y-0"}
              />
              {/* <Select */}
              {/*   options={languages} */}
              {/*   label={tc("language") ?? "Language"} */}
              {/*   name="book_language_id" */}
              {/*   required */}
              {/*   placeholder={tc("select_language") ?? "Select Language"} */}
              {/*   } */}
              {/*   onChange={(e: any) => */}
              {/*     setFieldValue("book_language_id", e.value) */}
              {/*   } */}
              {/*   error={errors.book_language_id} */}
              {/*   touched={touched.book_language_id} */}
              {/* /> */}
              {!fromComplain && (
                <Radio
                  options={[
                    { label: tc("regular"), value: 0 },
                    { label: tc("emergency"), value: 1 },
                  ]}
                  required
                  name="emergency"
                  label={tc("select_order_type") ?? "Select Order Type"}
                  wrapperClass={"mb-1 space-y-0"}
                />
              )}
            </Form>
          )}
        </Formik>
        {query === "interested" && (
          <>
            <Formik
              initialValues={{ country_id1: 0, state_id1: 0, district_id1: 0 }}
              onSubmit={async (values) => {
                try {
                  let data: any = {
                    country_id: values.country_id1,
                    state_id: values.state_id1,
                  };
                  if (values.district_id1 > 0) {
                    data.district_id = values.district_id1;
                  }
                  const response = await apiClient.get("namdan_center_list", {
                    params: data,
                  });
                  setNamdanCenter(response.data?.data?.namdan_center);
                } catch (error: any) {
                  console.log(error.resposne.data.error);
                }
              }}
            >
              {({ values, setFieldValue }) => (
                <Form className="w-full">
                  <hr
                    className="hr-text"
                    data-content="Namdan Center Details"
                  />
                  <Select
                    options={countries}
                    label={tc("country") ?? "Country"}
                    required={true}
                    name="country_id1"
                    placeholder={tc("select_country") ?? "Select Country"}
                    value={
                      countries.find((c) => c.value == values.country_id1) ??
                      null
                    }
                    onChange={(e: any) => {
                      if (e?.value) {
                        setFieldValue("country_id1", e.value);
                        handleCountryChange(e.value, setStates1);
                      }
                    }}
                    isClearable
                  />
                  <Select
                    options={states1}
                    label={tc("state") ?? "State"}
                    required={true}
                    name="state_id1"
                    placeholder={tc("select_state") ?? "Select State"}
                    value={
                      states1.find((c) => c.value == values.state_id1) ?? null
                    }
                    onChange={(e: any) => {
                      if (e?.value) {
                        setFieldValue("state_id1", e.value);
                        handleStateChange(e.value, setDistricts1);
                      }
                    }}
                  />
                  <Select
                    options={districts1}
                    label={tc("district") ?? "District"}
                    name="district_id1"
                    required={true}
                    placeholder={tc("select_district") ?? "Select District"}
                    value={
                      districts1.find((c) => c.value == values.district_id1) ??
                      null
                    }
                    onChange={(e: any) => {
                      e?.value && setFieldValue("district_id1", e.value);
                    }}
                  />
                  <Button type="submit" className="mx-auto w-1/2">
                    {tc("get_center")}
                  </Button>
                </Form>
              )}
            </Formik>

            {namdan_center_list.map((namdan_center) => (
              <CenterDetail detail={namdan_center} />
            ))}
          </>
        )}
        <div
          className={
            query == "interested" ? "border-t border-gray-300 pt-4" : "py-2"
          }
        />
        <Button
          type="submit"
          className="mx-auto mb-2"
          onClick={() => formRef.current.handleSubmit()}
        >
          {t("submit_order")}
        </Button>
      </div>
    </Layout>
  );
};

const CenterDetail = ({ detail }: { detail: NamdanCenter }) => {
  const {
    name,
    mobile_no,
    alt_mobile_no,
    address,
    tehsil_name,
    tehsil_name1,
    district_name,
    state_name,
    country_name,
    pincode,
    maps_link,
  } = detail;
  const { t: tc } = useTranslation("common");
  const combinedAddress = useMemo(() => {
    let temp = [
      address,
      tehsil_name,
      tehsil_name1,
      district_name,
      state_name,
      country_name,
    ]
      .filter((t) => t != null)
      .join(", ");
    temp = pincode ? `${temp} Pincode - ${pincode}` : temp;
    temp = capitalizeWords(temp);
    return temp;
  }, []);

  const MapLink = ({ link }: { link: string }) => (
    <a href={link} target="_blank">
      {link}
    </a>
  );
  return (
    <div>
      <p className={"capitalize font-bold underline text-green-600"}>{name}</p>
      <p className={"capitalize"}>
        <span className="font-semibold">Contact No.:</span>
        <span className="ml-1">
          {[mobile_no, alt_mobile_no].filter((t) => t != null).join(", ")}
        </span>
      </p>
      <p className={"capitalize"}>
        <span className="font-semibold">{tc("address")}:</span>
        <span className="ml-1">{combinedAddress}</span>
      </p>
      {maps_link && (
        <p>
          <span className="font-semibold">{tc("map_link")}:</span>
          <MapLink link={maps_link} />
        </p>
      )}
    </div>
  );
};
export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "order"])),
    },
  };
};

export default OrderForm;
