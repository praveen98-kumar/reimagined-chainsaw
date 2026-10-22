import React from "react";
import TextInput from "@/components/input/TextInput";

type PersonalInformationProps = {
  personType: "groom" | "bride";
  isFormDisabled?: boolean;
};

const PersonalInformation = ({
  personType,
  isFormDisabled,
}: PersonalInformationProps) => {
  const capitalizedPersonType =
    personType.charAt(0).toUpperCase() + personType.slice(1);
  return (
    <React.Fragment>
      <h2 className="text-xl font-bold border-b pb-2">
        {capitalizedPersonType === "Groom" ? "Ladka" : "Ladki"} Personal
        Information
      </h2>
      <TextInput
        name={`${personType}_full_name`}
        label="Full Name"
        disabled={isFormDisabled}
      />
      <TextInput
        name={`${personType}_dob`}
        label="Date of Birth"
        type="date"
        disabled={isFormDisabled}
      />
      <TextInput
        name={`${personType}_father_name`}
        label="Father's Name"
        disabled={isFormDisabled}
      />
      <TextInput
        name={`${personType}_mother_name`}
        label="Mother's Name"
        disabled={isFormDisabled}
      />
      <TextInput
        name={`${personType}_mobile_no`}
        label="Mobile Number"
        disabled={isFormDisabled}
        maxLength={10}
        inputMode="numeric"
      />
      <TextInput
        name={`${personType}_aadhar_card_no`}
        label="Aadhar Card Number"
        inputMode="numeric"
        maxLength={12}
        type="number"
        disabled={isFormDisabled}
      />
    </React.Fragment>
  );
};

export default PersonalInformation;
