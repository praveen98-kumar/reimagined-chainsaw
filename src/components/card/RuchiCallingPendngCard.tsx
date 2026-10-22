import CardButton from "@/components/card/CardButton";
import TextInput from "@/components/input/TextInput";
import Modal from "@/components/modal/Modal";
import apiClient from "@/http/index";
import {
  filterCalls,
  prepandCall,
  updateCalls,
} from "@/redux/features/callingSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { RuchiCall } from "@/shared/interfaces/calling";
import dayjs from "dayjs";
import { Form, Formik } from "formik";
import React, { useRef, useState } from "react";
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
import { useCount } from "../../hooks/useCount";

interface RuchiCallingPendingCardProps {
  call: RuchiCall & { [k: string]: any };
  type?: number;
}

export const schema = Yup.object({
  remark: Yup.string().required("Remark is required."),
});
const RuchiCallingPendingCard: React.FC<RuchiCallingPendingCardProps> = ({
  call,
  type,
}) => {
  const { t: ts } = useTranslation("status");
  const { t: tc } = useTranslation("common");
  const { t: tq } = useTranslation("question");
  const dispatch = useAppDispatch();
  const formRef = useRef<any>(null);
  const [show, setShow] = useState<
    | "will_confirm_later"
    | "issue_with_rule"
    | "come_in_satsang"
    | "interested"
    | "got_initiation"
    | "not_interested"
    | "out_of_reach"
    | ""
  >("");
  const { update } = useCount();
  const { active_permission, active_region_index } = useAppSelector(
    (state) => state.auth,
  );
  const activeDistrictId =
    active_permission?.region[active_region_index]?.district_id;

  const onConfirm = async (status: string = show, params: object = {}) => {
    try {
      const { data } = await apiClient.post("jyada_ruchi_response", {
        jyada_ruchi_id: call.id,
        response_type: status,
        ...params,
      });
      toast.success(data?.message);
      if (
        ![
          "out_of_reach",
          "will_confirm_later",
          "come_in_satsang",
          "issue_with_rule",
        ].includes(status)
      ) {
        dispatch(filterCalls({ type: "ruchiPendingCalls", id: call.id }));
        dispatch(prepandCall({ key: "ruchiCompleteCalls", data: call }));
        update("jyadaRuchiCounts", "district_id", {
          role: active_permission?.role,
          district_id: activeDistrictId,
          counts: {
            pending_order: -1,
            ctm: 1,
          },
        });
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
      formRef?.current?.handleSubmit();
    } catch (error: any) {
      toast.error(error.response.data.error);
    }
  };
  let remainingDay =
    15 - dayjs(new Date()).diff(call.jyada_ruchi_allotted_at, "d");
  let borderColor =
    remainingDay <= 5 ? "red" : remainingDay <= 10 ? "yellow" : "green";
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
        </CardGridContainer>

        {call?.history.length > 1 ? (
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
              onClick={() => setShow("will_confirm_later")}
              label={ts("will_confirm_later")}
              className={`${
                call.status == "will_confirm_later"
                  ? "text-white bg-yellow-500"
                  : "text-yellow-500 bg-white"
              } font-bold border border-gray-500`}
            />
            <CardButton
              onClick={() => setShow("issue_with_rule")}
              label={ts("issue_with_rule")}
              className={`${
                call.status == "issue_with_rule"
                  ? "text-white bg-violet-500"
                  : "text-violet-500 bg-white"
              } font-bold border border-gray-500`}
            />
            <CardButton
              onClick={() => setShow("come_in_satsang")}
              label={ts("come_in_satsang")}
              className={`${
                call.status == "come_in_satsang"
                  ? "text-white bg-gray-500"
                  : "text-gray-500 bg-white"
              } font-bold border border-gray-500`}
            />
            <CardButton
              onClick={() => setShow("interested")}
              label={ts("interested_naamdan")}
              className="text-green-600 bg-white font-bold border border-gray-500"
            />
            <CardButton
              onClick={() => setShow("got_initiation")}
              label={ts("got_initiation")}
              className="text-blue-500 bg-white font-bold border border-gray-500"
            />
            <CardButton
              onClick={() => setShow("not_interested")}
              label={ts("not_interested")}
              className="text-red-500 bg-white font-bold border border-gray-500"
            />
            <CardButton
              label={ts("out_of_reach")}
              onClick={() => {
                call.status !== "out_of_reach" && setShow("out_of_reach");
              }}
              className={`${
                call.status == "out_of_reach"
                  ? "text-white bg-orange-500 "
                  : "text-orange-500 bg-white border border-gray-500"
              } font-bold col-span-2 `}
            />
          </CardGridContainer>
        ) : null}
      </CardWrapper>
      <Modal
        show={show !== ""}
        onConfirm={async () => {
          if (
            [
              "will_confirm_later",
              "issue_with_rule",
              "come_in_satsang",
            ].includes(show)
          ) {
            const validateForm = await schema.validate(
              formRef?.current?.values ?? {},
            );
            if (validateForm) {
              onConfirm(show, formRef?.current?.values);
            }
          } else {
            onConfirm(show);
          }
        }}
        onClose={() => setShow("")}
      >
        <div className="space-y-8 mb-8">
          <FaQuestionCircle className=" mx-auto w-20 h-20 text-primary" />
          <p className="font-normal text-xl text-center">
            {tq(show, { sr_no: call.order_id })}
          </p>
          {[
            "will_confirm_later",
            "issue_with_rule",
            "come_in_satsang",
          ].includes(show) && (
            <Formik
              innerRef={formRef}
              initialValues={{ remark: "" }}
              validationSchema={schema}
              onSubmit={(values) => console.log(values)}
            >
              {() => (
                <Form>
                  <TextInput
                    name="remark"
                    label={tc("remark") ?? "Remark"}
                    required
                  />
                </Form>
              )}
            </Formik>
          )}
        </div>
      </Modal>
    </>
  );
};

export default RuchiCallingPendingCard;
