import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import CreatedOrderCard from "@/components/card/CreatedOrderCard";
import apiClient from "@/http/index";
import { useAppSelector } from "@/redux/store";
import { NextApplicationPage } from "@/shared/interfaces/app";
import dayjs from "dayjs";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  forwardRef,
} from "react";
import { useInView } from "react-intersection-observer";
import { Option } from "@/shared/interfaces/option";
import { getCountries } from "@/shared/functions/location";
import Modal from "@/components/modal/Modal";
import { OrderIn } from "@/shared/interfaces/order-in-card";
import { Form, Formik, FormikProps, FormikValues } from "formik";
import TextArea from "@/components/input/TextArea";
import { RiBuilding4Fill } from "react-icons/ri";
import { useTranslation } from "react-i18next";
import TextInput from "@/components/input/TextInput";
import { ImMobile } from "react-icons/im";
import { MdMyLocation } from "react-icons/md";
import Select from "@/components/input/Select";
import Radio from "@/components/input/Radio";
import { getOptionArray, objectWithValues } from "@/shared/functions/utils";
import { getMobilePin } from "@/shared/functions/get-pincode";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useCount } from "@/hooks/useCount";

interface UpdateOrderFormProps {
  order: OrderIn;
  countries: Array<Option>;
  books: Array<any>;
  onUpdateComplete?: (data: any) => void;
  setUpdating?: React.Dispatch<React.SetStateAction<boolean>>;
}

const schema = Yup.object({
  book: Yup.number().required("Book is required."),
  book_language_id: Yup.number()
    .required("Language is Required.")
    .test(
      "book_language_id",
      "Language is required",
      (v: any) => Number(v) > 0,
    ),
  mobile_no: Yup.string().when(["country_id"], (country_id, schema) =>
    typeof country_id === "number" && country_id == 2
      ? schema.required("Mobile is required.")
      : schema,
  ),
});

export const UpdateOrderForm = forwardRef<
  FormikProps<FormikValues>,
  UpdateOrderFormProps
>(({ order, books, countries, onUpdateComplete, setUpdating }, ref) => {
  const onSubmit = async ({ book, emergency, ...rest }: FormikValues) => {
    if (setUpdating) {
      setUpdating(true);
    }
    if (!String(rest["mobile_no"]).includes("+91")) {
      rest["mobile_no"] = `+91${rest["mobile_no"]}`;
    }
    try {
      const payload = objectWithValues({
        ...rest,
        category: order.category,
      });
      const { data } = await apiClient.put(`update_order/${order.id}`, {
        ...payload,
        emergency: emergency ? "1" : "0",
      });
      toast.success("Order has been updated");
      if (onUpdateComplete) {
        onUpdateComplete({
          book_id: book,
          emergency,
          ...rest,
          book_name: books.find((b) => b.value == book)?.label,
          book_lang: bookLanguages.find((b) => b.value == rest.book_language_id)
            ?.label,
          national: rest?.country_id == 2,
          id: data.data.order_id,
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      if (setUpdating) {
        setUpdating(false);
      }
    }
  };
  const [bookLanguages, setBookLanguges] = useState<Array<any>>([]);

  const { t: tc } = useTranslation("common");

  useEffect(() => {
    const tempL =
      books.find((b) => b.value == Number(order.book_id))?.languages ?? [];
    setBookLanguges(getOptionArray(tempL, "name", "book_language_id"));
    // @ts-ignore
    ref?.current?.setFieldValue(
      "book_language_id",
      Number(order.book_language_id) ?? 0,
    );
  }, [books, order.book_id]);

  return (
    <Formik
      innerRef={ref}
      initialValues={{
        message: order?.message ?? "",
        pincode: order?.pincode ?? "",
        mobile_no: order?.mobile_no?.slice(-10) ?? "",
        alt_mobile_no: order?.alt_mobile_no?.toString()?.slice(-10) ?? "",
        country_id: order?.country_id ?? null,
        book: order?.book_id ?? 0,
        book_language_id: order?.book_language_id ?? 0,
        emergency: order.emergency,
      }}
      validationSchema={schema}
      onSubmit={onSubmit}
    >
      {({ values, setFieldValue, touched, errors, handleChange }) => (
        <Form>
          <TextArea
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
                e.target.value,
              );
              setFieldValue("pincode", pinCodes?.[0] ?? "");
              setFieldValue("mobile_no", mobileNumber?.[0]?.slice(-10) ?? "");
              setFieldValue(
                "alt_mobile_no",
                mobileNumber?.[1]?.slice(-10) ?? "",
              );
              setFieldValue("message", converted ?? "");
            }}
          />
          {values.country_id == 2 && (
            <div className="w-full flex items-center space-x-2 mb-1">
              <input
                id="emergency"
                className="rounded"
                type={"checkbox"}
                name="emergency"
                checked={values.emergency}
                onChange={(e) => setFieldValue("emergency", e.target.checked)}
              />
              <label htmlFor="emergency">Mark As Emergency</label>
            </div>
          )}
          <Select
            name="country_id"
            options={countries}
            label={tc("country") ?? "Country"}
            isClearable
            placeholder={tc("select_country") ?? "Select Country"}
            value={countries.find((c) => c.value == values.country_id) ?? null}
            onChange={(e: any) => {
              if (e?.value) {
                setFieldValue("country_id", e?.value);
                if (e.value != 2) {
                  setFieldValue("emergency", false);
                } else {
                  setFieldValue("emergency", order.emergency);
                }
              } else {
                setFieldValue("country_id", null);
              }
            }}
          />
          <TextInput
            name="pincode"
            inputMode="numeric"
            maxLength={6}
            label={tc("pin") ?? "Pin code"}
            disabled
            Icon={MdMyLocation}
          />
          <TextInput
            name="mobile_no"
            label={tc("mobile_no") ?? "Mobile Number"}
            disabled
            inputMode="numeric"
            Icon={ImMobile}
          />
          <TextInput
            name="alt_mobile_no"
            // placeholder="Enter Mobile Number"
            label={tc("alt_mobile_no") ?? "Alt. Mobile Number"}
            Icon={ImMobile}
            disabled
          />

          <Radio
            name="book"
            onChange={(e) => {
              setFieldValue("book", e.target.value);
              const tempL =
                books.find((b) => b.value == Number(e.target.value))
                  ?.languages ?? [];
              const bookLangs = getOptionArray(
                tempL,
                "name",
                "book_language_id",
              );
              setBookLanguges(bookLangs);
              const defaultlang =
                bookLangs.find(({ label }) => label === "Hindi")?.value ??
                bookLangs[0].value ??
                0;
              setFieldValue("book_language_id", defaultlang);
            }}
            inputClassName="focus:border-pink-400 dark:focus:border-pink-300 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-pink-300 text-pink-700"
            className="text-green-600"
            options={books}
            required
            label={tc("select_book") ?? "Select Book"}
          />
          <Select
            name="book_language_id"
            options={bookLanguages}
            label={tc("language") ?? "Language"}
            placeholder={tc("select_language") ?? "Select Language"}
            required
            value={
              bookLanguages.find((c) => c.value == values.book_language_id) ??
              null
            }
            onChange={(e: any) => {
              setFieldValue("book_language_id", e.value);
            }}
            touched={!!touched?.book_language_id}
            error={errors?.book_language_id as string}
          />
        </Form>
      )}
    </Formik>
  );
});

const CreatedOrderList: NextApplicationPage = () => {
  const { user, active_permission, active_region_index } = useAppSelector(
    (state) => state.auth,
  );
  const [page, setPage] = useState<number>(1);
  const [orders, setOrders] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [show, setShow] = useState(false);
  const { update } = useCount();
  const [selectedOrder, setSelectedOrder] = useState<OrderIn | null>(null);

  const formRef = useRef<FormikProps<FormikValues>>(null);
  const [countries, setCountries] = useState<Array<Option>>([]);
  const [books, setBooks] = useState<Array<any>>([]);
  const [orderCountry, setOrderCountry] = useState(null);
  const currentTehsilId =
    active_permission?.region[active_region_index]?.tehsil_id;

  const onEditClicked = (id: number) => {
    const tempO = orders.find((o) => o.id == id);
    if (tempO) {
      setSelectedOrder(tempO);
      setOrderCountry(tempO?.country_id);
      setShow(true);
    }
  };

  const getOrders = useCallback(
    async (page: number) => {
      if (!loading) {
        setLoading(true);
        try {
          const { data } = await apiClient.get("orders", {
            params: {
              from_date: dayjs()
                .subtract(24, "hour")
                .startOf("day")
                .toISOString(),
              to_date: dayjs().toISOString(),
              created_by: user!.id,
              page,
              ...(currentTehsilId && { tehsil_id: currentTehsilId }),
            },
          });

          const sortedData = data.data.result
            .map((a: any) => ({ ...a, order_at: new Date(a.order_at) }))
            .sort((a: any, b: any) => b.order_at - a.order_at);
          const temp = page == 1 ? sortedData : [...orders, ...sortedData];
          const temphasMore = data.data.total > 10 * page;
          setPage((p) => (page == 1 ? 2 : p + 1));
          setHasMore(temphasMore);
          setOrders(temp);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    },
    [loading],
  );

  useEffect(() => {
    if (books.length === 0 && show) {
      (async () => {
        try {
          const { data } = await apiClient.get("books?short_list=1");
          const tempB = data.data.map(({ title, id, languages }: any) => ({
            value: id,
            label: title,
            languages,
          }));
          setBooks(tempB);
        } catch (error) {
          console.error(error);
        }
      })();
    }
  }, [books, show]);

  useEffect(() => {
    if (countries.length === 0 && show) {
      (async () => {
        try {
          const tempC = await getCountries();
          setCountries(tempC);
        } catch (error) {
          console.error(error);
        }
      })();
    }
  }, [countries, show]);

  const onUpdateComplete = (data: any) => {
    if (data.hasOwnProperty("message")) {
      const country_name = countries.find(
        (c) => c.value === data?.country_id,
      )?.label;
      const tempO = [...orders].map((o) =>
        o.id == selectedOrder?.id ? { ...o, country_name, ...data } : o,
      );
      setOrders(tempO);
      setShow(false);
      setSelectedOrder(null);
      if (orderCountry !== data?.country_id) {
        update("bookOrderCounts", "tehsil_id", {
          role: active_permission?.role,
          tehsil_id: currentTehsilId,
          counts: {
            mic: data?.country_id == 2 ? -1 : 1,
            tic: data?.country_id == 2 ? -1 : 1,
            mnc: data?.country_id != 2 ? -1 : 1,
            tnc: data?.country_id != 2 ? -1 : 1,
          },
        });
      }
    }
  };
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && page > 0 && hasMore) {
      getOrders(page);
    }
  }, [getOrders, page, inView, hasMore]);

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: "Book Order List",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <div className="flex flex-col gap-2">
          {orders.map((o) => (
            <CreatedOrderCard
              key={o.id}
              order={o}
              onEditClicked={onEditClicked}
              showEdit
            />
          ))}
          <div ref={ref}>
            {loading && hasMore && (
              <LoadingSpinner className={"mx-auto w-8 h-8"} />
            )}
          </div>
        </div>
      </div>
      {selectedOrder != null && (
        <Modal
          show={show}
          modalClasses="h-full"
          onClose={() => {
            formRef?.current?.resetForm();
            setShow(false);
          }}
          onConfirm={() => {
            formRef?.current?.handleSubmit();
          }}
          loading={updating}
        >
          <div className="mb-8 space-y-8">
            <UpdateOrderForm
              ref={formRef}
              order={selectedOrder}
              countries={countries}
              books={books}
              onUpdateComplete={onUpdateComplete}
              setUpdating={setUpdating}
            />
          </div>
        </Modal>
      )}
    </Layout>
  );
};

CreatedOrderList.requireAuth = true;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "status"])),
    },
  };
};

export default CreatedOrderList;
