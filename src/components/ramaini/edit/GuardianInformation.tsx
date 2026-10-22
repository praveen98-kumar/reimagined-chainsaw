import React from "react";
import TextInput from "@/components/input/TextInput";
import { Option } from "@/shared/interfaces/option";
import { useFormikContext } from "formik";
import Select from "@/components/input/Select";

type GuardianInformationProps = {
  personType: "groom" | "bride";
  isFormDisabled?: boolean;
};

const defaultRelations: Array<Option> = [
  { label: "Father", value: "father" },
  { label: "Mother", value: "mother" },
  { label: "Brother", value: "brother" },
  { label: "Sister", value: "sister" },
  { label: "Self", value: "self" },
];

const GuardianInformation = ({
  personType,
  isFormDisabled,
}: GuardianInformationProps) => {
  const { setFieldValue, values } = useFormikContext<any>();
  const capitalizedPersonType =
    personType.charAt(0).toUpperCase() + personType.slice(1);
  return (
    <React.Fragment>
      <h2 className="text-xl font-bold border-b pb-2 pt-4">
        {capitalizedPersonType === "Groom" ? "Ladka" : "Ladki"} Guardian
        Information
      </h2>
      <TextInput
        name={`${personType}_guardian_mobile_no`}
        label="Guardian Mobile No"
        disabled={isFormDisabled}
        maxLength={10}
        inputMode="numeric"
      />
      <Select
        isDisabled={isFormDisabled}
        name={`${personType}_relation`}
        label="Relation"
        options={defaultRelations}
        onChange={(opt: any) => {
          setFieldValue(`${personType}_relation`, opt?.value);
        }}
        value={
          defaultRelations.find(
            (c) => c.value === values[`${personType}_relation`]
          ) ?? null
        }
      />
    </React.Fragment>
  );
};

export default GuardianInformation;
