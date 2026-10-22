import React from "react";
import Select from "@/components/input/Select";
import TextInput from "@/components/input/TextInput";
import TextArea from "@/components/input/TextArea";
import { useFormikContext } from "formik";
import { useCountries, useDistricts, useStates } from "@/hooks/useLocationAPI";

type WeddingDetailsProps = {
  personType: "groom" | "bride";
  isFormDisabled?: boolean;
};

const WeddingDetails = ({
  personType,
  isFormDisabled,
}: WeddingDetailsProps) => {
  const { setFieldValue, values } = useFormikContext<any>();
  const capitalizedPersonType =
    personType.charAt(0).toUpperCase() + personType.slice(1);

  const { data: countries } = useCountries();
  const { data: states } = useStates(
    values[`${personType}_wedding_country_id`]
  );
  const { data: districts } = useDistricts(
    values[`${personType}_wedding_state_id`]
  );

  return (
    <React.Fragment>
      <h2 className="text-xl font-bold border-b pb-2 pt-4">
        {capitalizedPersonType === "Groom" ? "Ladka" : "Ladki"} Ramaini Details
      </h2>
      <TextInput
        name={`${personType}_wedding_date`}
        label="Ramaini Date"
        type="date"
        disabled={isFormDisabled}
      />
      <TextArea
        name={`${personType}_wedding_address`}
        label="Ramaini Address"
        disabled={isFormDisabled}
      />
      <Select
        isDisabled={isFormDisabled}
        name={`${personType}_wedding_country_id`}
        label="Ramaini Country"
        options={countries}
        onChange={(opt: any) => {
          setFieldValue(`${personType}_wedding_country_id`, opt?.value);
        }}
        value={
          countries?.find(
            (c) => c.value === values[`${personType}_wedding_country_id`]
          ) ?? null
        }
      />
      <Select
        isDisabled={isFormDisabled}
        name={`${personType}_wedding_state_id`}
        label="Ramaini State"
        options={states}
        value={
          states?.find(
            (c) => c.value === values[`${personType}_wedding_state_id`]
          ) ?? null
        }
        onChange={(opt: any) => {
          setFieldValue(`${personType}_wedding_state_id`, opt?.value);
        }}
      />
      <Select
        isDisabled={isFormDisabled}
        name={`${personType}_wedding_district_id`}
        label="Ramaini District"
        options={districts}
        value={
          districts?.find(
            (c) => c.value === values[`${personType}_wedding_district_id`]
          ) ?? null
        }
        onChange={(opt: any) => {
          setFieldValue(`${personType}_wedding_district_id`, opt?.value);
        }}
      />
      <TextInput
        disabled={isFormDisabled}
        name={`${personType}_wedding_tehsil`}
        label="Ramaini Tehsil"
      />
    </React.Fragment>
  );
};

export default WeddingDetails;
