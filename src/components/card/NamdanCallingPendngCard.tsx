import CardButton from "@/components/card/CardButton";
import TextInput from "@/components/input/TextInput";
import Modal from "@/components/modal/Modal";
import apiClient from "@/http/index";
import {
  filterCalls,
  prepandCall,
  updateCalls,
} from "@/redux/features/callingSlice";
import { updateCounts } from "@/redux/features/countSlice";
import { useAppDispatch } from "@/redux/store";
import { RuchiCall } from "@/shared/interfaces/calling";
import { Form, Formik } from "formik";
import React, { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FaQuestionCircle } from "react-icons/fa";
import * as Yup from "yup";
import {
  CardDateStatus,
  CardGridContainer,
  CardHistory,
  CardIcons,
  CardMessage,
  CardWrapper,
} from "./CommonCard";
import DatePicker from "@/components/input/DatePicker";
import FormErrorMessage from "@/components/input/FormErrorMessage";
import { objectWithValues } from "@/shared/functions/utils";
import dayjs from "dayjs";

interface NamdanCallingPendingCardProps {
  call: RuchiCall & { [k: string]: any };
  type?: number;
}

const schema = Yup.object({
  remark: Yup.string().required("Remark is required."),
});

const takenSchema = Yup.object({
  remark: Yup.string(),
  namdan_date: Yup.date().required("Form date is required"),
  form_no: Yup.string().required("Form number is required"),
});

const NamdanCallingPendingCard: React.FC<NamdanCallingPendingCardProps> = ({
  call,
  type,
}) => {
  const { t: ts } = useTranslation("status");
  const { t: tc } = useTranslation("common");
  const { t: tq } = useTranslation("question");
  const dispatch = useAppDispatch();
  const formRef = useRef<any>(null);
  const [show, setShow] = useState<
    "namdan_taken" | "namdan_not_taken" | "discussion" | ""
  >("");
  const [loading, setLoading] = useState<boolean>(false);

  const onConfirm = async (status: string = show, params: object = {}) => {
    try {
      setLoading(true);
      const { data } = await apiClient.post("namdan_calling_response", {
        namdan_calling_id: call.id,
        response_type: status,
        ...params,
      });
      toast.success(data?.message);
      if (!["discussion"].includes(status)) {
        dispatch(filterCalls({ type: "ruchiPendingCalls", id: call.id }));
        dispatch(prepandCall({ key: "ruchiCompleteCalls", data: call }));
        dispatch(
          updateCounts({
            type: "namdanCallCounts",
            values: [
              { key: "pending_order", value: -1 },
              { key: "ctm" },
              { key: "otm" },
              { key: "otd" },
            ],
          }),
        );
      }
      dispatch(
        updateCalls({
          type: "ruchiPendingCalls",
          id: call.id,
          data: {
            status: status,
            history: data.data,
          },
        }),
      );
      setShow("");
    } catch (error: any) {
      toast.error(error.response.data.error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <CardWrapper className="w-[98%]">
        <CardMessage
          className={"pr-12"}
          message={{
            sr_no: call.order_id,
            name: call.name,
            address: call.message,
            mobile_no: call.mobile_no,
            ...(call?.alt_mobile_no && {
              alt_mobile_no: call.alt_mobile_no,
            }),
            ...(call?.new_mobile_no && { new_mobile_no: call.new_mobile_no }),
            book_name: call.book_name + " " + call.book_lang,
          }}
        />
        <CardIcons
          mobile_no={call.mobile_no}
          alt_mobile_no={call?.alt_mobile_no}
        />
        <CardGridContainer className="gap-0.5">
          <CardDateStatus title={ts("book_ordered_on")} date={call.order_at} />
          <CardDateStatus
            title={ts("allot_for_delivery")}
            date={call.order_allotted_at}
          />
          <CardDateStatus
            title={ts("book_delivered_on")}
            date={call.delivered_at}
          />
          <CardDateStatus
            title={ts("book_calling_allotted")}
            date={call.calling_allotted_at as string}
          />
          <CardDateStatus
            title={ts("book_calling_done")}
            date={call.calling_response_at as string}
          />
          <CardDateStatus
            title={ts("ruchi_calling_allotted")}
            date={call.jyada_ruchi_allotted_at as string}
          />
          <CardDateStatus
            title={ts("ruchi_calling_done")}
            date={call.jyada_ruchi_done as string}
          />
        </CardGridContainer>

        {call.status == "discussion" ? (
          <CardHistory history={call?.history} showLast />
        ) : null}

        {type == 1 && (
          <p className="p-3 text-center text-white bg-primary font-semibold gap-1">
            <span>{ts("accepted_by", { name: call.accepted_by })}</span>
          </p>
        )}
        {type == 0 ? (
          <CardGridContainer>
            <CardButton
              onClick={() => setShow("discussion")}
              label={ts("discussion") ?? "Discussion"}
              className={`${
                call.status == "discussion"
                  ? "text-white bg-violet-500"
                  : "text-violet-500 bg-white"
              } font-bold border border-gray-500`}
            />
            <CardButton
              onClick={() => setShow("namdan_not_taken")}
              label={ts("namdan_not_taken") ?? "Namdan Not Taken"}
              className="text-red-500 bg-white font-bold border border-gray-500"
            />
            <CardButton
              onClick={() => setShow("namdan_taken")}
              label={ts("got_initiation")}
              className="text-blue-500 bg-white font-bold border border-gray-500"
            />
          </CardGridContainer>
        ) : null}
      </CardWrapper>
      <Modal
        show={show !== ""}
        onConfirm={() => formRef.current?.handleSubmit()}
        onClose={() => setShow("")}
        loading={loading}
      >
        <div className="space-y-8 mb-8">
          <FaQuestionCircle className=" mx-auto w-20 h-20 text-primary" />
          <p className="font-normal text-xl text-center">
            {tq(show, { sr_no: call.order_id })}
          </p>
          <Formik
            innerRef={formRef}
            initialValues={{ remark: "", namdan_date: null, form_no: "" }}
            validationSchema={show === "namdan_taken" ? takenSchema : schema}
            onSubmit={async (values, { resetForm }) => {
              let ddate = null;
              if (show === "namdan_taken" && values.namdan_date != null) {
                ddate = dayjs(values.namdan_date).format("YYYY-MM-DD");
              }
              await onConfirm(
                show,
                objectWithValues({ ...values, namdan_date: ddate }),
              );
              resetForm();
              setShow("");
            }}
          >
            {({ errors, handleChange }) => (
              <Form>
                {show === "namdan_taken" && (
                  <>
                    {/* Pratham Date */}
                    <div className="flex-1">
                      <DatePicker
                        label="Pratham Naam Date"
                        name="namdan_date"
                        onChange={(e: any) => handleChange(e)}
                        maxDate={new Date()}
                        dateFormat="dd-MM-yyyy"
                      />
                      {errors?.namdan_date && (
                        <FormErrorMessage>
                          {errors.namdan_date as string}
                        </FormErrorMessage>
                      )}
                    </div>

                    <TextInput
                      name="form_no"
                      label={tc("form_no") ?? "Form Number"}
                      required
                    />
                  </>
                )}
                <TextInput
                  name="remark"
                  label={tc("remark") ?? "Remark"}
                  required={show !== "namdan_taken"}
                />
              </Form>
            )}
          </Formik>
        </div>
      </Modal>
    </>
  );
};

export default NamdanCallingPendingCard;
