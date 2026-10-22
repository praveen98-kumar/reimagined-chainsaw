import Button from "@/components/Button";
import {
  CardDateStatus,
  CardGridContainer,
  CardIcons,
  CardMessage,
  CardWrapper,
} from "@/components/card/CommonCard";
import DateFilter from "@/components/DateFilter";
import FormLabel from "@/components/input/FormLabel";
import Radio from "@/components/input/Radio";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { RatingComponent } from "@/components/RatingComponent";
import { OnFieldChange } from "@/components/UserwiseDropdown";
import apiClient from "@/http/index";
import { setCalls } from "@/redux/features/callingSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  getInitialValues,
  getOptionArray,
  objectWithValues,
} from "@/shared/functions/utils";
import { NextApplicationPage } from "@/shared/interfaces/app";
import { Call } from "@/shared/interfaces/calling";
import { Option } from "@/shared/interfaces/option";
import dayjs from "dayjs";
import { Form, Formik } from "formik";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { dayFilterOptions } from "@/pages/report";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useInView } from "react-intersection-observer";

const BookCallingReviewCard = ({
  call,
}: {
  call: Call & { [k: string]: any };
}) => {
  const { t } = useTranslation("status");
  return (
    <CardWrapper className="w-[98%] select-none">
      <CardMessage
        className="pr-12"
        message={{
          sr_no: call.order_id,
          ...(call.name && { name: call.name }),
          address: call.message,
          mobile_no: call.mobile_no,
          ...(call?.new_mobile_no && { new_mobile_no: call.new_mobile_no }),
          ...(call.book_name && {
            book_name: call.book_name + " " + call.book_lang,
          }),
        }}
      />
      <CardIcons mobile_no={call.mobile_no} />
      <CardGridContainer className="gap-0.5">
        <CardDateStatus title={t("book_called_on")} date={call.order_at} />
        <CardDateStatus
          title={t("allot_for_delivery")}
          date={call?.order_allotted_at}
        />
        <CardDateStatus
          title={t("book_delivered_on")}
          date={call.delivered_at}
        />
        <CardDateStatus
          title={t("book_calling_allotted")}
          date={call.calling_allotted_at as string}
        />
        <CardDateStatus
          title={t("book_calling_completed")}
          date={call.calling_response_at as string}
        />
      </CardGridContainer>

      <div className={"w-full text-center py-1 capitalize"}>
        Review ({call.status.replace("_", " ")}) - {call.reason}
      </div>
    </CardWrapper>
  );
};

const Review: NextApplicationPage = () => {
  const { t: tc } = useTranslation("common");
  const { t } = useTranslation("calling");
  const { active_permission, active_region_index } = useAppSelector(
    (state) => state.auth
  );
  const region = active_permission?.role_region as string;
  const dispatch = useAppDispatch();
  const { bookCompleteCalls } = useAppSelector((state) => state.calling);
  const formRef = useRef<any>(null);
  const [sevadarList, setSevadarList] = useState<Option[]>([]);
  const [orders, setLocalOrders] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const params = useMemo(() => {
    let end: undefined | string, start: undefined | string;
    if (formRef.current?.values?.dayFilter === "today") {
      start = dayjs().startOf("day").toISOString();
      end = dayjs().endOf("day").toISOString();
    } else if (formRef.current?.values?.dayFilter === "yesterday") {
      start = dayjs().subtract(1, "day").startOf("day").toISOString();
      end = dayjs().subtract(1, "day").endOf("day").toISOString();
    } else {
      start = dayjs(formRef.current?.values?.start)
        .startOf("day")
        .toISOString();
      end = dayjs(formRef.current?.values?.end).endOf("day").toISOString();
    }
    return {
      status: "complete",
      ...getInitialValues(active_permission, active_region_index),
      ...objectWithValues(formRef.current?.values ?? {}),
      ...(end && {
        end: dayjs(end).endOf("day").toISOString(),
      }),
      ...(start && {
        start: dayjs(start).startOf("day").toISOString(),
      }),
      from_date: dayjs().subtract(30, "day").startOf("day").toISOString(),
    };
  }, [
    formRef.current?.setFieldValue,
    formRef.current?.values,
    active_permission,
  ]);
  const fetchOrder = useCallback(
    async (page: number, params: Record<string, string | number | boolean>) => {
      if (!loading) {
        setLoading(true);
        try {
          const { data } = await apiClient.get("calling", {
            params: {
              ...params,
              page,
            },
          });
          const temphasMore = data.data.total > 10 * page;
          setTotal(data.data.total);
          const temp =
            page == 1 ? data.data.result : [...orders, ...data.data.result];
          setLocalOrders((pre: any[]) =>
            page == 1 ? data.data.result : [...pre, ...data.data.result]
          );
          setPage((p) => (page == 1 ? 2 : p + 1));
          setHasMore(temphasMore);
          dispatch(setCalls({ type: "bookCompleteCalls", calls: temp }));
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    },
    [orders, loading]
  );

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && page > 1 && hasMore) {
      fetchOrder(page, params);
    }
  }, [fetchOrder, inView, params, hasMore]);

  const getSevadarList = async (district_id: number) => {
    try {
      const { data } = await apiClient.get("users", {
        params: {
          role: 27,
          district_id,
          limit: 0,
        },
      });
      setSevadarList(
        getOptionArray(
          [...data.data.result].map((u) => ({
            name: u.disciple.name,
            id: u.id,
          })),
          "name",
          "id"
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (
      active_permission?.region[active_region_index].district_id &&
      region == "district"
    ) {
      getSevadarList(
        active_permission?.region[active_region_index].district_id
      );
    }
  }, [active_permission, active_region_index, region]);

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: t("book.seva.title.review") ?? "Book Calling Review",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <Formik
          innerRef={formRef}
          initialValues={{
            country_id: 0,
            state_id: 0,
            district_id: 0,
            tehsil_id: 0,
            allocated_to: 0,
            start: "",
            end: "",
            rating: 0,
            dayFilter: "today",
          }}
          onSubmit={(values) => {
            let { start, dayFilter, end, rating, ...rest } = values;
            if (!rating) {
              toast.error("Rating is required.");
              return;
            }
            if (dayFilter === "today") {
              start = dayjs().startOf("day").toISOString();
              end = dayjs().endOf("day").toISOString();
            } else if (dayFilter === "yesterday") {
              start = dayjs().subtract(1, "day").startOf("day").toISOString();
              end = dayjs().subtract(1, "day").endOf("day").toISOString();
            } else {
              start = dayjs(start).startOf("day").toISOString();
              end = dayjs(end).endOf("day").toISOString();
            }
            const formValue = objectWithValues(
              region === "ashram" ? { ...rest, end, start, rating } : rest
            );
            const payload = {
              ...params,
              ...formValue,
              from_date: start,
            };
            fetchOrder(1, payload);
          }}
        >
          {({ values, handleChange, setFieldValue }) => {
            const handleCalendar = () => {
              setFieldValue("dayFilter", "");
            };
            const handleRadio = (e: React.ChangeEvent<any>) => {
              handleChange(e);
              setFieldValue("dayFilter", e.target.value);
              setFieldValue("start", undefined);
              setFieldValue("end", undefined);
            };
            return (
              <Form>
                {region === "ashram" ? (
                  <>
                    <DateFilter />
                    <OnFieldChange fields={["end"]} onChange={handleCalendar} />
                    <OnFieldChange
                      fields={["start"]}
                      onChange={handleCalendar}
                    />
                    <Radio
                      options={dayFilterOptions.slice(0, 2)}
                      name="dayFilter"
                      label=""
                      onChange={handleRadio}
                      inputClassName="rounded text-green-600 checked:bg-green-600 focus:ring-green-400 focus:border-green-400"
                    />

                    <div className="flex flex-row gap-4 w-full items-center">
                      <FormLabel htmlFor={"rating"} label={"Rating"} />
                      <RatingComponent
                        className="w-6 h-6"
                        rating={values.rating}
                        onClick={(i) => setFieldValue("rating", i)}
                      />
                    </div>
                  </>
                ) : null}
                {/* <UserwiseDropdown */}
                {/*   conditionalFields={{ country_id: false, tehsil_id: false }} */}
                {/*   isClearable={true} */}
                {/* /> */}
                <Button className="mx-auto mt-2" type="submit">
                  {tc("search")}
                </Button>
              </Form>
            );
          }}
        </Formik>
        {bookCompleteCalls.length > 0 ? (
          <div>
            <h3>
              {`Showing ${bookCompleteCalls.length} out of ${total} records`}
            </h3>
            <div className="flex flex-col gap-2">
              {bookCompleteCalls.map((call, index) => (
                <BookCallingReviewCard call={call} key={index} />
              ))}
            </div>
            <div ref={ref}>
              {loading && hasMore && (
                <LoadingSpinner className={"mx-auto w-8 h-8"} />
              )}
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
};

Review.requireAuth = true;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "calling",
        "status",
      ])),
    },
  };
};

export default Review;
