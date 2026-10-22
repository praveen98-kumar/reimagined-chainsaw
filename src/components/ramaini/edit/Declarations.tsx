import React from "react";
import Radio from "@/components/input/Radio";

type DeclarationsProps = {
  personType: "groom" | "bride";
  isFormDisabled?: boolean;
};

const Declarations = ({ personType, isFormDisabled }: DeclarationsProps) => {
  const capitalizedPersonType =
    personType.charAt(0).toUpperCase() + personType.slice(1);
  return (
    <React.Fragment>
      <h2 className="text-xl font-bold border-b pb-2 pt-4">
        {capitalizedPersonType === "Groom" ? "Ladka" : "Ladki"} Declarations
      </h2>
      <Radio
        disabled={isFormDisabled}
        name={`${personType}_legel_role_accept`}
        label="I accept the legal role"
        options={[
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ]}
      />
      <Radio
        disabled={isFormDisabled}
        name={`${personType}_legal_age_met`}
        label="Legal age met"
        options={[
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ]}
      />
      <Radio
        disabled={isFormDisabled}
        name={`${personType}_gotra_area_considered`}
        label="Gotra area considered"
        options={[
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ]}
      />
      <Radio
        disabled={isFormDisabled}
        name={`${personType}_rules_accept`}
        label="I accept the rules"
        options={[
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ]}
      />
      <Radio
        disabled={isFormDisabled}
        name={`${personType}_marital_status`}
        label={`Is the ${personType} divorced?`}
        options={[
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ]}
      />
      <Radio
        disabled={isFormDisabled}
        name={`${personType}_declaration_accept`}
        label="I accept the declaration"
        options={[
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ]}
      />
    </React.Fragment>
  );
};

export default Declarations;
