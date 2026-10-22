import React from "react";
import Select from "@/components/input/Select";
import TextInput from "@/components/input/TextInput";
import TextArea from "@/components/input/TextArea";
import { useFormikContext } from "formik";
import { useCountries, useDistricts, useStates } from "@/hooks/useLocationAPI";

type AddressInformationProps = {
  personType: "groom" | "bride";

  isFormDisabled?: boolean;
};

const AddressInformation = ({
  personType,

  isFormDisabled,
}: AddressInformationProps) => {
  const { setFieldValue, values } = useFormikContext<any>();
  const capitalizedPersonType =
    personType.charAt(0).toUpperCase() + personType.slice(1);

  const { data: countries } = useCountries();
  const { data: states } = useStates(values[`${personType}_country_id`]);
  const { data: districts } = useDistricts(values[`${personType}_state_id`]);

  return (
    <React.Fragment>
      <h2 className="text-xl font-bold border-b pb-2 pt-4">
        {capitalizedPersonType === "Groom" ? "Ladka" : "Ladki"} Address
        Information
      </h2>
      <Select
        isDisabled={isFormDisabled}
        name={`${personType}_country_id`}
        label="Country"
        options={countries}
        onChange={(opt: any) => {
          setFieldValue(`${personType}_country_id`, opt?.value);
        }}
        value={
          countries?.find(
            (c) => c.value === values[`${personType}_country_id`]
          ) ?? null
        }
      />
      <Select
        isDisabled={isFormDisabled}
        name={`${personType}_state_id`}
        label="State"
        options={states}
        onChange={(opt: any) => {
          setFieldValue(`${personType}_state_id`, opt?.value);
        }}
        value={
          states?.find((c) => c.value === values[`${personType}_state_id`]) ??
          null
        }
      />
      <Select
        isDisabled={isFormDisabled}
        name={`${personType}_district_id`}
        label="District"
        options={districts}
        value={
          districts?.find(
            (c) => c.value === values[`${personType}_district_id`]
          ) ?? null
        }
        onChange={(opt: any) => {
          setFieldValue(`${personType}_district_id`, opt?.value);
        }}
      />
      <TextInput
        disabled={isFormDisabled}
        name={`${personType}_tehsil`}
        label="Tehsil"
      />
      <TextArea
        disabled={isFormDisabled}
        name={`${personType}_address`}
        label="Address"
      />
    </React.Fragment>
  );
};

export default AddressInformation;
