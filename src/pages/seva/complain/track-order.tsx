import Button from "@/components/Button";
import Layout from "@/components/Layout";
import OrderCompleteCard from "@/components/card/OrderCompleteCard";
import TextInput from "@/components/input/TextInput";
import DifferentModal from "@/components/modal/DifferentModal";
import apiClient from "@/http/index";
import { useAppDispatch } from "@/redux/store";
import { OrderIn } from "@/shared/interfaces/order-in-card";
import dayjs from "dayjs";
import { Form, Formik } from "formik";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FiPhoneCall } from "react-icons/fi";
import { MdClose, MdOutlinePhoneIphone } from "react-icons/md";
import * as Yup from "yup";
import Modal from "@/components/modal/Modal";
import TextArea from "@/components/input/TextArea";
import { BOOK_ORDER_STATUS } from "@/shared/interfaces/app";

const trackClass = [
  "bg-[url('/assets/icons/order_received.png')] w-10 h-10",
  "bg-[url('/assets/icons/order_alloted.png')] w-10 h-10",
  "bg-[url('/assets/icons/order_delivered.png')] w-10 h-10",
  "bg-[url('/assets/icons/calling.png')] w-10 h-10",
  "bg-[url('/assets/icons/calling.png')] w-10 h-10",
  "bg-[url('/assets/icons/ruchiCalling.png')] w-10 h-10",
  "bg-[url('/assets/icons/ruchiCalling.png')] w-10 h-10",
  "bg-[url('/assets/icons/mala.png')] w-10 h-10",
];

const schema = Yup.object({
  mobile: Yup.string().length(10, "Mobile number must be 10 characters long"),
});
const possibleDesc = [
  "",
  'Allotted/Accepted by "Sevadar Name"',
  "Book Deliver by hand",
  'Book Calling Seva allotted to "Sevadar Name"',
  'Jyada Ruchi Calling Seva Created to "Sevadar Name"',
  'Jyada Ruchi Calling Seva allotted to "Sevadar Name"',
  "Namdan Taken On",
];
const Track = () => {
  const defaultOrder: OrderIn = {
    allocated_to_name: "",
    book_lang: "",
    book_name: "",
    book_order_status: BOOK_ORDER_STATUS.ACCEPTED,
    created_at: "",
    delivered_at: "",
    message: "",
    mobile_no: "",
    name: "",
    order_allotted_at: "",
    order_at: "",
    pincode: "",
    reason: "",
    response_by_name: "",
    tehsil_id: 0,
    id: 0,
  };
  const { t: tc } = useTranslation("common");
  const { t } = useTranslation("order");
  const [order, setOrder] = useState<OrderIn>(defaultOrder);
  const [showRaiseModal, setShowRaiseModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [notFound, setNotfound] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [events, setEvents] = useState<any[]>([]);
  const router = useRouter();
  const [bookDelivered, setBookDelivered] = useState<boolean>(false);
  const formRef = useRef<any>(null);

  const reopenOrder = async (params?: object) => {
    try {
      const res = await apiClient.put("reopen_order", {
        order_id: order.id,
        from_complain: 1,
        ...params,
      });
      toast.success(res.data.message);
      setOrder(defaultOrder);
      setShowModal(false);
      setEvents([]);
    } catch (error: any) {
      toast.error(error.error);
    }
  };
  return (
    <Layout
      headerProps={{
        isBack: true,
        heading:
          router.query?.type === "complaint"
            ? t("seva.title.add_complaint")!
            : t("track_order")!,
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <Formik
          initialValues={{ mobile: "" }}
          innerRef={formRef}
          validationSchema={schema}
          onSubmit={async (values) => {
            setLoading(true);
            try {
              const { data } = await apiClient.get("track_order", {
                params: { ...values, type: "delivery" },
              });

              const { order_detail, ...rest } = data.data;
              setOrder(order_detail);
              if (rest.delivered.status == 3) {
                setBookDelivered(true);
              } else {
                setBookDelivered(false);
              }
              const status = Object.values(rest)
                .map((v) => v)
                .filter((v: any) => v.desc != "" && v.date != "");
              const len =
                status.length < possibleDesc.length
                  ? status.length + 1
                  : status.length;
              let temp = [],
                first = true;
              for (let i = 0; i < len; i++) {
                if (status[i]) {
                  temp.push(status[i]);
                } else {
                  if (router.query?.type === "complaint") {
                    continue;
                  }
                  temp.push({
                    desc: possibleDesc[i],
                    date: first ? "In Progress" : "",
                  });
                  first = false;
                }
              }
              setEvents(temp);
              setNotfound(false);
            } catch (error: any) {
              if (error.response.status == 404) {
                setOrder(defaultOrder);
                setEvents([]);
                setNotfound(true);
              } else {
                console.log(error);
              }
            } finally {
              setLoading(false);
            }
          }}
        >
          {({ setFieldValue, values }) => (
            <Form className="pb-2" style={{ borderBottom: "1px solid #ddd" }}>
              <label className="flex items-center text-gray-500 gap-2 mb-2">
                {tc("mobile_no")}
              </label>
              <div className="flex w-full">
                <TextInput
                  fieldClass="flex-1"
                  className="flex-1 py-2 m-0 rounded-r-none pl-12"
                  placeholder="Type mobile number"
                  prependEle={
                    <div className="flex absolute space-x-1 items-center -translate-y-1/2 top-1/2 right-4">
                      {values.mobile.length > 0 && (
                        <MdClose
                          onClick={() => setFieldValue("mobile", "")}
                          className="w-5 h-5 text-gray-500 cursor-pointer"
                        />
                      )}
                      <MdOutlinePhoneIphone className="w-6 h-6 text-gray-500 pointer-events-none" />
                    </div>
                  }
                  name="mobile"
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
                  className="py-3 rounded-l-none"
                  style={{ maxHeight: "42px" }}
                  type="submit"
                  loading={loading}
                  disabled={loading}
                >
                  {tc("search")}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
        {order.id > 0 && (
          <p className="text-gray-500 mb-2">{t("showing_result")}...</p>
        )}

        {order.id > 0 && (
          <OrderCompleteCard
            showForTrackOrder={true}
            showSevadarName={false}
            order={order}
            showTimer={false}
            key={0}
          />
        )}
        {order.id == 0 && (
          <p className="m-4 text-center text-gray-400">{t("no_order")}</p>
        )}
        <div className="">
          {events.map((prop, i) => (
            <TrackItem {...prop} key={i} index={i} />
          ))}
          {router.query?.type === "complaint" &&
            !bookDelivered &&
            order.id > 0 && (
              <div style={{ minHeight: "100px" }} className="flex items-end">
                <Button
                  className="mx-auto bg-red-700"
                  onClick={() => setShowRaiseModal(true)}
                >
                  {router.query?.type === "complaint"
                    ? t("raise_complain")
                    : t("send_to_emergency")}
                </Button>
              </div>
            )}
          {router.query?.type === "complaint" &&
            bookDelivered &&
            order.id > 0 &&
            !notFound && (
              <div style={{ minHeight: "100px" }} className="flex items-end">
                <Button
                  className="mx-auto bg-green-700"
                  onClick={() => setShowModal(true)}
                >
                  {t("reopen_order")}
                </Button>
              </div>
            )}

          {router.query?.type === "complaint" && notFound && order.id == 0 && (
            <div style={{ minHeight: "100px" }} className="flex items-end">
              <Button
                onClick={() => {
                  localStorage.setItem(
                    "orderDetail",
                    JSON.stringify({
                      order_id: order.id,
                      mobile_no: order.mobile_no,
                    })
                  );
                  router.push(
                    `/seva/order/order-form?type=want-book&complain=1&mobile_no=${formRef?.current.values?.mobile}`
                  );
                }}
                className="mx-auto bg-green-700"
              >
                {t("create_order")}
              </Button>
            </div>
          )}
        </div>
      </div>
      <DifferentModal
        show={showModal}
        onConfirm={(values) => reopenOrder(values)}
        order_id={order.id}
        reason="complain"
        onClose={() => setShowModal(false)}
        initialValues={{
          country_id: order.country_id,
          state_id: order.state_id,
          district_id: order.district_id,
          tehsil_id: order.tehsil_id,
          pincode: order.pincode,
        }}
      />
      {order.id > 0 ? (
        <ComplainRaiseModel
          show={showRaiseModal}
          setShow={setShowRaiseModal}
          order_id={order.id}
        />
      ) : null}
    </Layout>
  );
};

const ComplainRaiseModel = ({
  show,
  setShow,
  order_id,
  onConfirm,
}: {
  show: boolean;
  setShow: (show: boolean) => void;
  order_id: number;
  onConfirm?: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const schema = Yup.object({
    complain: Yup.string().required("Enter your complain"),
  });

  async function raiseComplain() {
    try {
      setLoading(true);
      const res = await apiClient.get("regular_to_emergency", {
        params: { order_id },
      });
      onConfirm?.();
      toast.success(res.data.message);
    } catch (error: any) {
      console.error("Error on raising book complain", error);
      toast.error(error.res.data.message);
    } finally {
      setShow(false);
      setLoading(false);
    }
  }

  return (
    <Modal
      show={show}
      onClose={() => setShow(false)}
      onConfirm={() => raiseComplain()}
      loading={loading}
      disableClosing={loading}
    >
      <div className="space-y-4 mb-8">
        <div className={"text-xl text-center text-semibold"}>
          Are you sure to arise complain for the Order {order_id}.
        </div>
        {/*  <Formik*/}
        {/*    initialValues={{ complain: "" }}*/}
        {/*    onSubmit={raiseComplain}*/}
        {/*    validationSchema={schema}*/}
        {/*  >*/}
        {/*    {({}) => (*/}
        {/*      <Form>*/}
        {/*        <TextArea*/}
        {/*          placeholder="Enter your complain"*/}
        {/*          name="complain"*/}
        {/*          aria-label="Complain"*/}
        {/*          id="complain"*/}
        {/*          required*/}
        {/*          rows={4}*/}
        {/*        />*/}
        {/*      </Form>*/}
        {/*    )}*/}
        {/*  </Formik>*/}
      </div>
    </Modal>
  );
};

const TrackItem = ({
  date,
  sevadar_mobile_no,
  desc,
  index,
}: {
  date: string;
  sevadar_mobile_no: string;
  desc: string;
  index: number;
}) => {
  const bgColor =
    date == ""
      ? "bg-gray-400"
      : date == "In Progress"
      ? "bg-yellow-400"
      : "bg-green-400";

  const opacity = date == "In Progress" || date == "" ? "opacity-50" : "";

  const descColor = date == "In Progress" ? "text-yellow-500" : "text-gray-900";
  const dateColor =
    date == "In Progress" ? "text-yellow-400" : "text-slate-400";
  return (
    <div className="flex group h-full space-x-4 px-2 items-start">
      <div className="relative w-4 h-16">
        <div className={`mt-4 w-4 h-4 rounded-full ${bgColor}`} />
        {/*<div*/}
        {/*  style={{ left: "50%" }}*/}
        {/*  className="absolute w-2 h-16 -ml-0.5 border-l-4 group-last:hidden border-dashed border-gray-500"*/}
        {/*/>*/}
      </div>
      <div
        className={` mt-2 w-10 ${
          desc.includes("Namdan Seva")
            ? trackClass[index + 1]
            : trackClass[index]
        } ${opacity} bg-cover bg-no-repeat bg-top`}
      />
      <div className={`flex-1 ${opacity}`}>
        <p
          className={`flex font-bold ${descColor} items-start justify-between`}
        >
          <span>
            {desc}{" "}
            {date === "In Progress" ? (
              date
            ) : (
              <span className={`font-bold ${dateColor}`}>
                {dayjs(date).format("DD/MM/YYYY")}
              </span>
            )}
          </span>
          {sevadar_mobile_no && (
            <a href={`tel:${sevadar_mobile_no}`}>
              <FiPhoneCall className="text-black text-xl" />
            </a>
          )}
        </p>
      </div>
    </div>
  );
};

export default Track;
export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "order",
        "question",
      ])),
    },
  };
};
