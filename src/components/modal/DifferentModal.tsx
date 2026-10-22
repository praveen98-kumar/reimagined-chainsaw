import Select from "@/components/input/Select";
import {
  getDistricts,
  getStates,
  getTehsils,
  handleStateChange,
} from "@/shared/functions/location";
import { getOptionArray, objectWithValues } from "@/shared/functions/utils";
import { Option } from "@/shared/interfaces/option";
import { Form, Formik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import { FaQuestionCircle } from "react-icons/fa";
import * as Yup from "yup";
import Modal from "./Modal";
import { useTranslation } from "react-i18next";
import TextInput from "@/components/input/TextInput";
import { allLangPincodeRegex } from "@/shared/functions/get-pincode";
import apiClient from "@/http/index";
import { OnFieldChange } from "@/components/UserwiseDropdown";
import TextArea from "@/components/input/TextArea";
// import { RatingComponent } from "@/components/RatingComponent";
import Radio from "@/components/input/Radio";
import { RatingComponent } from "@/components/RatingComponent";

interface IValues {
  country_id: number | string;
  state_id: number | string;
  district_id: number | string;
  tehsil_id: number | string;
  pincode: number | string;
}

interface Props {
  show: boolean;
  onClose: () => void;
  onConfirm: (e?: any) => void;
  initialValues?: Partial<IValues>;
  showTehils?: boolean;
  reason?: string;
  order_id?: number;
}

const DifferentModal: React.FC<Props> = ({
  show,
  onClose,
  onConfirm,
  initialValues = {
    state_id: 0,
    district_id: 0,
    tehsil_id: 0,
  },
  showTehils = false,
  reason = "",
  order_id = 0,
}) => {
  const { t: tc } = useTranslation("common");
  const { t: tq } = useTranslation("question");
  const [states, setStates] = useState<Option[]>([]);
  const [districts, setDistricts] = useState<Option[]>([]);
  const [tehsils, setTehsils] = useState<Option[]>([]);
  const [pincodes, setPincodes] = useState<Option[]>([]);

  async function getPincodes(tehsil_id: number) {
    try {
      const { data } = await apiClient.get("pincode_from_pincode_orders", {
        params: {
          tehsil_id,
        },
      });
      setPincodes(getOptionArray(data.data, "pincode", "pincode"));
    } catch (error) {
      console.error("error on getting pincodes");
    }
  }

  useEffect(() => {
    if (show) {
      (async () => {
        try {
          const states = await getStates(initialValues?.country_id || 2);
          setStates(states);
          if (initialValues?.state_id) {
            formRef.current?.setFieldValue("state_id", initialValues.state_id);
            const districts = await getDistricts(initialValues.state_id);
            setDistricts(districts);
            if (initialValues?.district_id) {
              formRef.current?.setFieldValue(
                "district_id",
                initialValues.district_id,
              );
              const tehsils = await getTehsils(initialValues.district_id);
              setTehsils(tehsils);
              if (initialValues.tehsil_id) {
                formRef.current?.setFieldValue(
                  "tehsil_id",
                  initialValues.tehsil_id,
                );
              }
              if (initialValues.pincode) {
                formRef.current?.setFieldValue(
                  "pincode",
                  initialValues.pincode,
                );
              }
            }
          }
        } catch (error) {
          console.error(error);
        }
      })();
    }
  }, [show]);

  const handleDistrictChange = async (districtID: any) => {
    if (districtID) {
      let tehsils = await getTehsils(districtID);
      if (!showTehils) {
        tehsils = tehsils.filter((t) => t.value != initialValues?.tehsil_id);
      }
      setTehsils(tehsils);
    }
  };

  const formRef = useRef<any>(null);
  const handleSubmit = () => {
    if (formRef.current) {
      formRef.current.handleSubmit();
    }
  };

  const schema = Yup.object({
    state_id: Yup.number().required().positive().min(1, "Please select state"),
    district_id: Yup.number()
      .required()
      .positive()
      .min(1, "Please select district"),
    tehsil_id: Yup.number()
      .required("Please select tehsil")
      .positive()
      .min(1, "Please select tehsil"),
    pincode: Yup.string().when("country_id", {
      is: 238, // Check if country_id is 238
      then: (schema) => schema.notRequired(), // Remove matches validation
      otherwise: (schema) =>
        schema
          .required("Pincode is required.")
          .typeError("Pincode is required"),
    }),
    ...(reason === "jyada_ruchi"
      ? {
          rating: Yup.number()
            .min(1, "Please rate your experience")
            .max(5)
            .required("Please rate your experience"),
          remark: Yup.string()
            .min(3, "Please write your remark")
            .required("Please write your remark"),
        }
      : {}),

    new_address: Yup.string().optional(),
    ...(reason === "complain"
      ? {
          emergency: Yup.number()
            .min(0, "Set emergency or regular")
            .max(1, "Set emergency or regular"),
        }
      : {}),
  });
  return (
    <Modal
      show={show}
      onClose={onClose}
      onConfirm={onConfirm}
      withCloseHandler={false}
      modalClasses={"pt-2"}
    >
      <div className="space-y-4 mb-8">
        {reason == "jyada_ruchi" ? (
          <h3 className="font-normal text-xl text-center">
            {tq("jyada_ruchi", { sr_no: order_id })}
          </h3>
        ) : (
          <h3 className="font-normal text-xl text-center">
            {tq("book_not_receive", { sr_no: order_id })}
          </h3>
        )}
        <Formik
          innerRef={formRef}
          validationSchema={schema}
          initialValues={{
            state_id: 0,
            district_id: 0,
            tehsil_id: 0,
            pincode: "",
            new_address: "",
            rating: 0,
            remark: "",
            emergency:
              reason == "complain" || reason == "book_not_receive" ? 1 : 0,
          }}
          onSubmit={(values, { resetForm }) => {
            onConfirm(objectWithValues(values));
            setDistricts([]);
            setTehsils([]);
            setPincodes([]);
            resetForm();
          }}
        >
          {({ setFieldValue, values, errors, touched }) => (
            <Form>
              {reason === "jyada_ruchi" ? (
                <>
                  <RatingComponent
                    rating={values.rating}
                    onClick={(v) => setFieldValue("rating", v)}
                    errorText={errors.rating}
                  />
                  <TextArea
                    name="remark"
                    required
                    className={"placeholder:text-gray-400"}
                    label={tc("remark") || "Remark"}
                    rows={3}
                    style={{ resize: "none" }}
                  />
                </>
              ) : null}
              <Select
                name="state_id"
                options={states}
                label={tc("state") ?? "State"}
                required
                value={states.find((c) => c.value == values.state_id) ?? null}
                placeholder={tc("select_state") ?? "Select State"}
                isSearchable={false}
                onChange={(e: any) => {
                  setFieldValue("state_id", e.value);
                  handleStateChange(e.value, setDistricts);
                }}
              />
              <Select
                name="district_id"
                options={districts}
                label={tc("district") ?? "District"}
                placeholder={tc("select_district") ?? "Select District"}
                required
                isSearchable={false}
                value={
                  districts.find((c) => c.value == values.district_id) ?? null
                }
                onChange={(e: any) => {
                  setFieldValue("district_id", e.value);
                  handleDistrictChange(e.value);
                }}
              />
              <Select
                name="tehsil_id"
                options={tehsils}
                label={tc("tehsil") ?? "Tehsil"}
                placeholder={tc("select_tehsil") ?? "Select Tehsil"}
                value={tehsils.find((c) => c.value == values.tehsil_id) ?? null}
                required
                isSearchable={false}
                onChange={(e: any) => {
                  setFieldValue("tehsil_id", e.value);
                }}
              />
              <OnFieldChange
                fields={["tehsil_id"]}
                // @ts-ignore
                onChange={({ tehsil_id }) => {
                  if (tehsil_id != null && tehsil_id !== 0) {
                    getPincodes(tehsil_id);
                  } else {
                    setPincodes([]);
                  }
                }}
              />
              <Select
                name="pincode"
                options={pincodes}
                label={tc("pin") ?? "Pincode"}
                placeholder={tc("pincode") ?? "Select Pincode"}
                value={pincodes.find((c) => c.value == values.pincode) ?? null}
                onChange={async (e: any) => {
                  setFieldValue("pincode", e?.value ?? null);
                }}
                error={errors.pincode}
                touched={touched.pincode}
                required={true}
                isClearable
                isSearchable={false}
              />
              {/* <TextInput name="pincode" label={tc("pin") || "Pincode"} /> */}
              {reason !== "complain" &&
              reason != "book_not_receive" &&
              reason != "jyada_ruchi" ? (
                <Radio
                  options={[
                    { label: tc("regular"), value: 0 },
                    { label: tc("emergency"), value: 1 },
                  ]}
                  required
                  name="emergency"
                  label={tc("select_order_type") ?? "Select Order Type"}
                />
              ) : null}
              <TextArea
                name="new_address"
                className={"placeholder:text-gray-400"}
                label={tc("address") || "Address"}
                rows={3}
                style={{ resize: "none" }}
              />
            </Form>
          )}
        </Formik>
        <div className="flex items-center justify-center space-x-6 pb-6">
          <button
            type="submit"
            className="bg-green-600 text-white w-1/2 inline-block font-bold px-7 py-2 rounded-xl"
            onClick={handleSubmit}
          >
            {tc("confirm")}
          </button>
          <button
            className="bg-red-600 text-white w-1/2 font-bold px-7 inline-block py-2 rounded-xl"
            onClick={onClose}
          >
            {tc("cancel")}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DifferentModal;
