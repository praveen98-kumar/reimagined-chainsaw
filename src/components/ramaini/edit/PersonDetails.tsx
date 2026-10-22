import React from "react";
import PersonalInformation from "./PersonalInformation";
import AddressInformation from "./AddressInformation";
import SpiritualInformation from "./SpiritualInformation";
import WeddingDetails from "./WeddingDetails";
import Declarations from "./Declarations";
import GuardianInformation from "./GuardianInformation";
import Documents from "./Documents";

type PersonDetailsProps = {
  personType: "groom" | "bride";

  isFormDisabled?: boolean;
};

const PersonDetails = ({
  personType,
  isFormDisabled = false,
}: PersonDetailsProps) => {
  return (
    <React.Fragment>
      <PersonalInformation
        personType={personType}
        isFormDisabled={isFormDisabled}
      />
      <AddressInformation
        personType={personType}
        isFormDisabled={isFormDisabled}
      />
      <SpiritualInformation
        personType={personType}
        isFormDisabled={isFormDisabled}
      />
      <WeddingDetails personType={personType} isFormDisabled={isFormDisabled} />
      <Declarations personType={personType} isFormDisabled={isFormDisabled} />
      <Documents personType={personType} isFormDisabled={isFormDisabled} />
      <GuardianInformation
        personType={personType}
        isFormDisabled={isFormDisabled}
      />
    </React.Fragment>
  );
};

export default PersonDetails;
