import Button from "@/components/Button";
import CreatedOrderCard from "@/components/card/CreatedOrderCard";
import TextInput from "@/components/input/TextInput";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import Modal from "@/components/modal/Modal";
import apiClient from "@/http/index";
import { useAppSelector } from "@/redux/store";
import { getCountries } from "@/shared/functions/location";
import { isValidUser } from "@/shared/functions/utils";
import { NextApplicationPage } from "@/shared/interfaces/app";
import { Option } from "@/shared/interfaces/option";
import { OrderIn } from "@/shared/interfaces/order-in-card";
import { Form, Formik } from "formik";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, { useEffect, useRef, useState } from "react";
import { MdClose, MdOutlinePhoneIphone } from "react-icons/md";
import { UpdateOrderForm } from "./list";
import { Region } from "@/shared/interfaces/user";

const SearchOrder: NextApplicationPage = () => {
  const [orders, setOrders] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const formRef = useRef<any>(null);
  const [notFound, setNotFound] = useState(false);
  const { active_permission, active_region_index } = useAppSelector(
    (state) => state.auth
  );

  const [show, setShow] = useState(false);
  const roleRegion = active_permission?.role_region;
  const [selectedOrder, setSelectedOrder] = useState<OrderIn | null>(null);
  const [countries, setCountries] = useState<Array<Option>>([]);
  const [books, setBooks] = useState<Array<any>>([]);

  const canEdit = isValidUser("update_order");
  const canDelete = isValidUser("delete_order");

  const onEditClicked = (id: number) => {
    const tempO = orders.find((o) => o.id == id);
    if (tempO) {
      setSelectedOrder(tempO);
      setShow(true);
    }
  };

  const searchBookOrder = async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const res = await apiClient.get("search_book_order", {
        params: {
          mobile_no: formRef?.current?.values?.mobile_no,
        },
      });
      setOrders(res.data.data);
    } catch (error: any) {
      console.error(`Cannot search orders`);
      if (error?.response?.status == 404) {
        setNotFound(true);
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const onUpdateComplete = (data: any) => {
    if (data.hasOwnProperty("message")) {
      const tempO = [...orders].map((o) =>
        o.id == selectedOrder?.id ? { ...o, ...data } : o
      );
      setOrders(tempO);
      setSelectedOrder(null);
    }
  };

  function onDeleteConfirm(id: number) {
    const tempOrders = orders.filter((o) => o.id != id);
    setOrders(tempOrders);
  }

  useEffect(() => {
    if (books.length === 0 && selectedOrder != null) {
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
  }, [books, selectedOrder]);

  useEffect(() => {
    if (countries.length === 0) {
      (async () => {
        try {
          const tempC = await getCountries();
          setCountries(tempC);
        } catch (error) {
          console.error(error);
        }
      })();
    }
  }, [countries]);

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: "Search Orders",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <Formik
          innerRef={formRef}
          initialValues={{
            mobile_no: "",
          }}
          onSubmit={searchBookOrder}
        >
          {({ values, setFieldValue }) => (
            <Form>
              <TextInput
                fieldClass="flex-1"
                className="flex-1 py-2 m-0 rounded pl-12"
                placeholder="Enter mobile number"
                prependEle={
                  <div className="flex absolute space-x-1 items-center -translate-y-1/2 top-1/2 right-4">
                    {values.mobile_no.length > 0 && (
                      <MdClose
                        onClick={() => setFieldValue("mobile", "")}
                        className="w-5 h-5 text-gray-500 cursor-pointer"
                      />
                    )}
                    <MdOutlinePhoneIphone className="w-6 h-6 text-gray-500 pointer-events-none" />
                  </div>
                }
                name="mobile_no"
                id="mobile_no"
                autoFocus
                required
                maxLength={10}
                inputMode="numeric"
                appendEle={
                  <p
                    className="absolute bg-gray-200 rounded p-2 px-2 font-semibold text-gray-800 -translate-y-1/2 pointer-events-none top-1/2 left-0"
                    style={{
                      marginLeft: "1px",
                    }}
                  >
                    +91
                  </p>
                }
              />
              <Button
                className="mx-auto"
                type="submit"
                loading={loading}
                disabled={loading}
              >
                Search
              </Button>
            </Form>
          )}
        </Formik>
        {loading ? (
          <LoadingSpinner className="mx-auto my-8 w-8 h-8" />
        ) : notFound ? (
          <p className="font-semibold text-2xl text-gray-400 text-center">
            Order Not Found
          </p>
        ) : (
          orders?.map((o) => {
            const inSameRegion =
              roleRegion === "ashram"
                ? true
                : (o[`sevadar_${roleRegion}`] as string).toLowerCase() ===
                  active_permission?.region[active_region_index][
                    `${roleRegion}_name` as keyof Region
                  ]
                    ?.toString()
                    .toLowerCase();

            const location = {
              tehsil: o?.sevadar_tehsil,
              district: o?.sevadar_district,
              division: o?.sevadar_division,
              state: o?.sevadar_state,
              country: o?.sevadar_country,
            };
            const sevadarDetail = inSameRegion
              ? {
                  sevadar_name: o.sevadar_name,
                  sevadar_mobile_no: o.sevadar_mobile_no,
                  sevadar_seva_location: Object.entries(location)
                    .filter(([_, v]) => v != null && v != "")
                    .map(([k, v1]) => `${k} - ${v1}`)
                    .join(", "),
                }
              : undefined;
            return (
              <CreatedOrderCard
                key={o.id}
                onEditClicked={onEditClicked}
                order={o as OrderIn}
                showEdit={canEdit}
                canDelete={canDelete}
                sevadarDetail={sevadarDetail}
                onDeleteConfirm={onDeleteConfirm}
              />
            );
          })
        )}
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

SearchOrder.requireAuth = true;

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "status",
        "question",
      ])),
    },
  };
};
export default SearchOrder;
