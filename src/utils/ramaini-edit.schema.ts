import * as yup from "yup";

export const imageSchema = yup
  .mixed()
  .test("file", "कृपया एक फ़ाइल का चयन करें", (value: any) => {
    if (typeof value === "string") {
      return true;
    }
    return value && value.size;
  })
  .test("fileSize", "फ़ाइल का आकार 5MB से कम होना चाहिए", (value: any) => {
    if (typeof value === "string") {
      return true;
    }
    return value && value.size <= 5 * 1024 * 1024; // 5MB
  })
  .test(
    "fileType",
    "समर्थित फ़ाइल प्रकार: jpg, jpeg, png, gif",
    (value: any) => {
      if (typeof value === "string") {
        return true;
      }
      return (
        value && ["image/jpeg", "image/png", "image/gif"].includes(value.type)
      );
    }
  );

const personObjectSchema = (personType: "groom" | "bride") => ({
  [`${personType}_full_name`]: yup
    .string()
    .min(2, "नाम कम से कम 2 अक्षर का होना चाहिए")
    .required("पूरा नाम आवश्यक है"),
  [`${personType}_dob`]: yup
    .date()
    .max(new Date(), "जन्म तिथि भविष्य की नहीं हो सकती")
    .required("जन्म तिथि आवश्यक है"),
  [`${personType}_father_name`]: yup
    .string()
    .min(2, "पिता का नाम आवश्यक है")
    .required("पिता का नाम आवश्यक है"),
  [`${personType}_mother_name`]: yup
    .string()
    .min(2, "माता का नाम आवश्यक है")
    .required("माता का नाम आवश्यक है"),
  [`${personType}_country_id`]: yup
    .number()
    .min(1, "देश का चयन करें")
    .required("देश आवश्यक है"),
  [`${personType}_state_id`]: yup
    .number()
    .min(1, "राज्य का चयन करें")
    .required("राज्य आवश्यक है"),
  [`${personType}_district_id`]: yup
    .number()
    .min(1, "जिला का चयन करें")
    .required("जिला आवश्यक है"),
  [`${personType}_tehsil`]: yup
    .string()
    .min(1, "तहसील आवश्यक है")
    .required("तहसील आवश्यक है"),
  [`${personType}_address`]: yup
    .string()
    .min(3, "पूरा पता आवश्यक है")
    .required("पूरा पता आवश्यक है"),
  [`${personType}_mobile_no`]: yup
    .string()
    .matches(/^(\+91|91)?[6-9]\d{9}$/, "वैध मोबाइल नंबर दर्ज करें")
    .required("मोबाइल नंबर आवश्यक है"),

  [`${personType}_aadhar_card_no`]: yup
    .string()
    .matches(/^\d{12}$/, "वैध आधार नंबर दर्ज करें")
    .required(
      personType === "groom"
        ? "दूल्हे का आधार नंबर आवश्यक है"
        : "दुल्हन का आधार नंबर आवश्यक है"
    ),

  // Spiritual Information
  [`${personType}_pratham_mantra_date`]: yup.date().nullable().optional(),
  [`${personType}_satnam_date`]: yup.date().nullable().optional(),
  [`${personType}_sarnam_date`]: yup.date().nullable().optional(),
  [`${personType}_sarshabd_date`]: yup.date().nullable().optional(),

  // File Uploads
  [`${personType}_photo`]: imageSchema.required("फोटो अपलोड करना आवश्यक है"),
  // [`${personType}_divorce_paper`]: imageSchema.nullable().optional(),

  // Declaration
  [`${personType}_legel_role_accept`]: yup
    .string()
    .oneOf(["yes"], "आपको इस बात से सहमत होना होगा")
    .required("यह घोषणा आवश्यक है"),
  [`${personType}_legal_age_met`]: yup
    .string()
    .oneOf(["yes"], "आपको इस बात से सहमत होना होगा")
    .required("यह घोषणा आवश्यक है"),
  [`${personType}_gotra_area_considered`]: yup
    .string()
    .oneOf(["yes"], "आपको इस बात से सहमत होना होगा")
    .required("यह घोषणा आवश्यक है"),
  [`${personType}_rules_accept`]: yup
    .string()
    .oneOf(["yes"], "आपको इस बात से सहमत होना होगा")
    .required("यह घोषणा आवश्यक है"),
  [`${personType}_marital_status`]: yup
    .string()
    .oneOf(["yes", "no"], "एक विकल्प चुनें")
    .required("यह घोषणा आवश्यक है"),
  [`${personType}_declaration_accept`]: yup
    .string()
    .oneOf(["yes"], "आपको इस बात से सहमत होना होगा")
    .required("यह घोषणा आवश्यक है"),
  // Marriage Details
  [`${personType}_wedding_date`]: yup
    .date()
    .required("विवाह की तारीख आवश्यक है"),
  [`${personType}_wedding_address`]: yup
    .string()
    .min(2, "विवाह स्थान आवश्यक है")
    .required("विवाह स्थान आवश्यक है"),
  [`${personType}_wedding_country_id`]: yup
    .number()
    .min(1, "देश का चयन करें")
    .required("विवाह देश आवश्यक है"),
  [`${personType}_wedding_state_id`]: yup
    .number()
    .min(1, "राज्य का चयन करें")
    .required("विवाह राज्य आवश्यक है"),
  [`${personType}_wedding_district_id`]: yup
    .number()
    .min(1, "जिला का चयन करें")
    .required("विवाह जिला आवश्यक है"),
  [`${personType}_wedding_tehsil`]: yup
    .string()
    .min(1, "तहसील आवश्यक है")
    .required("विवाह तहसील आवश्यक है"),

  // Signatures
  [`${personType}_signature`]: imageSchema.required(
    "हस्ताक्षर अपलोड करना आवश्यक है"
  ),
  [`${personType}_guardian_signature`]: imageSchema.required(
    "अभिभावक के हस्ताक्षर अपलोड करना आवश्यक है"
  ),
  [`${personType}_guardian_mobile_no`]: yup
    .string()
    .matches(/^(\+91|91)?[6-9]\d{9}$/, "वैध मोबाइल नंबर दर्ज करें")
    .required("अभिभावक का मोबाइल नंबर आवश्यक है"),
  [`${personType}_relation`]: yup
    .string()
    .min(2, "रिश्ता बताएं")
    .required("रिश्ता आवश्यक है"),

  [`${personType}_marksheet`]: imageSchema.required(
    "मार्कशीट अपलोड करना आवश्यक है"
  ),
  [`${personType}_aadhar_card_front`]: imageSchema.required(
    "आधार कार्ड का सामने का हिस्सा अपलोड करना आवश्यक है"
  ),
  [`${personType}_aadhar_card_back`]: imageSchema.required(
    "आधार कार्ड का पिछला हिस्सा अपलोड करना आवश्यक है"
  ),
  [`${personType}_father_aadhar_card_front`]: imageSchema.required(
    "पिता के आधार कार्ड का सामने का हिस्सा अपलोड करना आवश्यक है"
  ),
  [`${personType}_father_aadhar_card_back`]: imageSchema.required(
    "पिता के आधार कार्ड का पिछला हिस्सा अपलोड करना आवश्यक है"
  ),
  [`${personType}_mother_aadhar_card_front`]: imageSchema.required(
    "माता के आधार कार्ड का सामने का हिस्सा अपलोड करना आवश्यक है"
  ),
  [`${personType}_mother_aadhar_card_back`]: imageSchema.required(
    "माता के आधार कार्ड का पिछला हिस्सा अपलोड करना आवश्यक है"
  ),
  [`${personType}_naamdiksha_form`]: imageSchema.required(
    "नामदीक्षा फॉर्म अपलोड करना आवश्यक है"
  ),
});

export const profileSchema = yup.object().shape({
  ...personObjectSchema("groom"),
  ...personObjectSchema("bride"),
});

export const formatDateForInput = (
  dateString: string | null | undefined
): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return new Date(date.getTime() + 5.5 * 3600 * 1000)
      .toISOString()
      .split("T")[0];
  } catch (e) {
    return "";
  }
};

const getPersonInitialValues = (
  ramainiForm: any,
  personType: "groom" | "bride"
) => ({
  [`${personType}_full_name`]: ramainiForm[`${personType}_full_name`] ?? "",
  [`${personType}_dob`]: formatDateForInput(ramainiForm[`${personType}_dob`]),
  [`${personType}_father_name`]: ramainiForm[`${personType}_father_name`] ?? "",
  [`${personType}_mother_name`]: ramainiForm[`${personType}_mother_name`] ?? "",
  [`${personType}_country_id`]: ramainiForm[`${personType}_country`]?.id ?? 2,
  [`${personType}_state_id`]: ramainiForm[`${personType}_state`]?.id ?? "",
  [`${personType}_district_id`]:
    ramainiForm[`${personType}_district`]?.id ?? "",
  [`${personType}_tehsil`]: ramainiForm[`${personType}_tehsil`] ?? "",
  [`${personType}_address`]: ramainiForm[`${personType}_address`] ?? "",
  [`${personType}_mobile_no`]: ramainiForm[`${personType}_mobile_no`] ?? "",
  [`${personType}_aadhar_card_no`]:
    ramainiForm[`${personType}_aadhar_card_no`] ?? "",
  [`${personType}_pratham_mantra_date`]:
    formatDateForInput(ramainiForm[`${personType}_pratham_mantra_date`]) || "",
  [`${personType}_satnam_date`]:
    formatDateForInput(ramainiForm[`${personType}_satnam_date`]) || "",
  [`${personType}_sarnam_date`]:
    formatDateForInput(ramainiForm[`${personType}_sarnam_date`]) || "",
  [`${personType}_sarshabd_date`]:
    formatDateForInput(ramainiForm[`${personType}_sarshabd_date`]) || "",
  [`${personType}_photo`]: ramainiForm[`${personType}_photo`] ?? undefined,
  [`${personType}_divorce_paper`]:
    ramainiForm[`${personType}_divorce_paper`] ?? undefined,
  [`${personType}_legel_role_accept`]: ramainiForm[
    `${personType}_legel_role_accept`
  ]
    ? "yes"
    : "no",
  [`${personType}_legal_age_met`]: ramainiForm[`${personType}_legal_age_met`]
    ? "yes"
    : "no",
  [`${personType}_gotra_area_considered`]: ramainiForm[
    `${personType}_gotra_area_considered`
  ]
    ? "yes"
    : "no",
  [`${personType}_rules_accept`]: ramainiForm[`${personType}_rules_accept`]
    ? "yes"
    : "no",
  [`${personType}_marital_status`]: ramainiForm[`${personType}_marital_status`]
    ? "yes"
    : "no",
  [`${personType}_declaration_accept`]: ramainiForm[
    `${personType}_declaration_accept`
  ]
    ? "yes"
    : "no",
  [`${personType}_wedding_date`]: formatDateForInput(
    ramainiForm[`${personType}_wedding_date`]
  ),
  [`${personType}_wedding_address`]:
    ramainiForm[`${personType}_wedding_address`] ?? "",
  [`${personType}_wedding_country_id`]:
    ramainiForm[`${personType}_wedding_country`]?.id ?? 2,
  [`${personType}_wedding_state_id`]:
    ramainiForm[`${personType}_wedding_state`]?.id ?? "",
  [`${personType}_wedding_district_id`]:
    ramainiForm[`${personType}_wedding_district`]?.id ?? "",
  [`${personType}_wedding_tehsil`]:
    ramainiForm[`${personType}_wedding_tehsil`] ?? "",
  [`${personType}_signature`]:
    ramainiForm[`${personType}_signature`] ?? undefined,
  [`${personType}_guardian_signature`]:
    ramainiForm[`${personType}_guardian_signature`] ?? undefined,
  [`${personType}_guardian_mobile_no`]:
    ramainiForm[`${personType}_guardian_mobile_no`] ?? "",
  [`${personType}_relation`]: ramainiForm[`${personType}_relation`] ?? "",
  [`${personType}_marksheet`]:
    ramainiForm[`${personType}_marksheet`] ?? undefined,
  [`${personType}_aadhar_card_front`]:
    ramainiForm[`${personType}_aadhar_card_front`] ?? undefined,
  [`${personType}_aadhar_card_back`]:
    ramainiForm[`${personType}_aadhar_card_back`] ?? undefined,
  [`${personType}_father_aadhar_card_front`]:
    ramainiForm[`${personType}_father_aadhar_card_front`] ?? undefined,
  [`${personType}_father_aadhar_card_back`]:
    ramainiForm[`${personType}_father_aadhar_card_back`] ?? undefined,
  [`${personType}_mother_aadhar_card_front`]:
    ramainiForm[`${personType}_mother_aadhar_card_front`] ?? undefined,
  [`${personType}_mother_aadhar_card_back`]:
    ramainiForm[`${personType}_mother_aadhar_card_back`] ?? undefined,
  [`${personType}_naamdiksha_form`]:
    ramainiForm[`${personType}_naamdiksha_form`] ?? undefined,
});

export const getInitialValues = (ramainiForm: any) => {
  return {
    ...getPersonInitialValues(ramainiForm, "groom"),
    ...getPersonInitialValues(ramainiForm, "bride"),
  };
};
