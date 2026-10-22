// Base interfaces for reusable components
interface Location {
  id: number;
  name: string;
}

// Main wedding registration data interface
interface WeddingRegistrationData {
  id: number;
  registration_type: string;

  // Groom information
  groom_full_name: string;
  groom_dob: string;
  groom_father_name: string;
  groom_mother_name: string;
  groom_mobile_no: string;
  groom_photo: string;
  groom_country: Location;
  groom_state: Location;
  groom_district: Location;
  groom_tehsil: string;
  groom_address: string;
  groom_pratham_mantra_date: string;
  groom_satnam_date: string | null;
  groom_sarnam_date: string | null;
  groom_sarshabd_date: string | null;
  groom_legel_role_accept: boolean;
  groom_legal_age_met: boolean;
  groom_gotra_area_considered: boolean;
  groom_rules_accept: boolean;
  groom_marital_status: boolean;
  groom_divorce_paper: string | null;
  groom_wedding_date: string;
  groom_wedding_address: string;
  groom_wedding_country: Location;
  groom_wedding_state: Location;
  groom_wedding_district: Location;
  groom_wedding_tehsil: string;
  groom_aadhar_card_front: string;
  groom_aadhar_card_back: string;
  groom_father_aadhar_card_front: string;
  groom_father_aadhar_card_back: string;
  groom_mother_aadhar_card_front: string;
  groom_mother_aadhar_card_back: string;
  groom_naamdiksha_form: string;
  groom_marksheet: string;
  groom_declaration_accept: boolean;
  groom_signature: string;
  groom_guardian_signature: string;
  groom_relation: string;
  groom_guardian_mobile_no: string;
  groom_aadhar_card_no: string;

  // Bride information
  bride_full_name: string;
  bride_dob: string;
  bride_father_name: string;
  bride_mother_name: string;
  bride_mobile_no: string;
  bride_photo: string;
  bride_country: Location;
  bride_state: Location;
  bride_district: Location;
  bride_tehsil: string;
  bride_address: string;
  bride_pratham_mantra_date: string;
  bride_satnam_date: string | null;
  bride_sarnam_date: string | null;
  bride_sarshabd_date: string | null;
  bride_legel_role_accept: boolean;
  bride_legal_age_met: boolean;
  bride_gotra_area_considered: boolean;
  bride_rules_accept: boolean;
  bride_marital_status: boolean;
  bride_divorce_paper: string | null;
  bride_wedding_date: string;
  bride_wedding_address: string;
  bride_wedding_country: Location;
  bride_wedding_state: Location;
  bride_wedding_district: Location;
  bride_wedding_tehsil: string;
  bride_aadhar_card_front: string;
  bride_aadhar_card_back: string;
  bride_father_aadhar_card_front: string;
  bride_father_aadhar_card_back: string;
  bride_mother_aadhar_card_front: string;
  bride_mother_aadhar_card_back: string;
  bride_naamdiksha_form: string;
  bride_marksheet: string;
  bride_declaration_accept: boolean;
  bride_signature: string;
  bride_guardian_signature: string;
  bride_relation: string;
  bride_guardian_mobile_no: string;
  bride_aadhar_card_no: string;

  // Verification and metadata
  verified: boolean;
  verified_by: Record<string, unknown>; // Empty object, can be more specific if structure is known
  verified_at: string;
  remarks: string;
  flag: boolean;
  created_at: string;
  updated_at: string;
}

// Alternative approach with more granular types
interface PersonalInfo {
  full_name: string;
  dob: string;
  father_name: string;
  mother_name: string;
  mobile_no: string;
  photo: string;
  country: Location;
  state: Location;
  district: Location;
  tehsil: string;
  address: string;
}

interface SpiritualInfo {
  pratham_mantra_date: string;
  satnam_date: string | null;
  sarnam_date: string | null;
  sarshabd_date: string | null;
}

interface LegalConsent {
  legel_role_accept: boolean;
  legal_age_met: boolean;
  gotra_area_considered: boolean;
  rules_accept: boolean;
  marital_status: boolean;
  divorce_paper: string | null;
}

interface WeddingDetails {
  wedding_date: string;
  wedding_address: string;
  wedding_country: Location;
  wedding_state: Location;
  wedding_district: Location;
  wedding_tehsil: string;
}

interface Documents {
  aadhar_card_front: string;
  aadhar_card_back: string;
  father_aadhar_card_front: string;
  father_aadhar_card_back: string;
  mother_aadhar_card_front: string;
  mother_aadhar_card_back: string;
  naamdiksha_form: string;
  marksheet: string;
}

interface SignatureInfo {
  declaration_accept: boolean;
  signature: string;
  guardian_signature: string;
  relation: string;
  guardian_mobile_no: string;
  aadhar_card_no: string;
}

// Combined type using composition
interface GroomInfo
  extends PersonalInfo,
    SpiritualInfo,
    LegalConsent,
    WeddingDetails,
    Documents,
    SignatureInfo {}
interface BrideInfo
  extends PersonalInfo,
    SpiritualInfo,
    LegalConsent,
    WeddingDetails,
    Documents,
    SignatureInfo {}

interface WeddingRegistrationDataComposed {
  id: number;
  registration_type: string;
  groom: GroomInfo;
  bride: BrideInfo;
  verified: boolean;
  verified_by: Record<string, unknown>;
  verified_at: string;
  remarks: string;
  flag: boolean;
  created_at: string;
  updated_at: string;
}

// Export the main type
export type {
  WeddingRegistrationData,
  Location,
  WeddingRegistrationDataComposed,
};
