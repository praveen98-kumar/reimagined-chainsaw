import TextInput from "@/components/input/TextInput";
import React from "react";

type SpiritualInformationProps = {
  personType: "groom" | "bride";
  isFormDisabled?: boolean;
};

const SpiritualInformation = ({
  personType,
  isFormDisabled,
}: SpiritualInformationProps) => {
  const capitalizedPersonType =
    personType.charAt(0).toUpperCase() + personType.slice(1);
  return (
    <React.Fragment>
      <h2 className="text-xl font-bold border-b pb-2 pt-4">
        {capitalizedPersonType === "Groom" ? "Ladka" : "Ladki"} Spiritual
        Information
      </h2>
      <TextInput
        name={`${personType}_pratham_mantra_date`}
        label="Pratham Mantra Date"
        type="date"
        disabled={isFormDisabled}
      />
      <TextInput
        name={`${personType}_satnam_date`}
        label="Satnam Date"
        type="date"
        disabled={isFormDisabled}
      />
      <TextInput
        name={`${personType}_sarnam_date`}
        label="Sarnam Date"
        type="date"
        disabled={isFormDisabled}
      />
      <TextInput
        name={`${personType}_sarshabd_date`}
        label="Sarshabd Date"
        type="date"
        disabled={isFormDisabled}
      />
    </React.Fragment>
  );
};

export default SpiritualInformation;
