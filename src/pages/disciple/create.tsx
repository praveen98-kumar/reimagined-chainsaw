import React, { useEffect, useRef, useState } from "react";
import Layout from "@/components/Layout";
import { FieldArray, Form, Formik, FormikValues } from "formik";
import { NextPage } from "next";
import * as Yup from "yup";
import { addDays, subYears } from "date-fns";
import TextInput from "@/components/input/TextInput";
import FormErrorMessage from "@/components/input/FormErrorMessage";
import DatePicker from "@/components/input/DatePicker";
import Select from "@/components/input/Select";
import { Option } from "@/shared/interfaces/option";
import Button from "@/components/Button";
import { entryTypeOptions } from "@/constants/user";
import { RiCloseCircleLine } from "react-icons/ri";
import toast from "react-hot-toast";
import { getCenters } from "@/shared/functions/location";
import UserwiseDropdown from "@/components/UserwiseDropdown";
import { getOccupationList } from "@/http/api";

export const createDiscipleSchema = Yup.object({
  form_no: Yup.string().required("Form number is required"),
  form_date: Yup.date().required("Form date is required").default(new Date()),
  name: Yup.string().required("Name is required."),
  unique_id: Yup.string().required("Aadhar number is required."),
  guardian_name: Yup.string().required("Guardian's name is required."),
  relation: Yup.string()
    .required("Relation with guardian is required.")
    .default("S/O"),
  dob: Yup.date()
    .nullable()
    .required("DOB is required")
    .max(subYears(new Date(), 3)),
  mobile_no: Yup.string().required("Mobile number is required."),
  whatsapp_no: Yup.string().optional(),
  email: Yup.string().optional(),
  occupation: Yup.string().required("Occupation is required."),
  avatar: Yup.mixed()
    .required("Avatar is required.")
    // .test("FILE_SIZE", "Too big!", (value) => value && value.size < 1024 * 1024)
    .test(
      "FILE_TYPE",
      "Invalid!!",
      (value: any) =>
        value && ["image/png", "image/jpeg", "image/jpg"].includes(value.type),
    ),
  address: Yup.string().required("Name is required."),
  country_id: Yup.number()
    .nullable()
    .required("Country is required.")
    .test("test-country-min", "Country is reqired", (v) => v != null && v > 0),
  state_id: Yup.number()
    .nullable()
    .required("State is required.")
    .test("test-state-min", "State is reqired", (v) => v != null && v > 0),
  district_id: Yup.number()
    .nullable()
    .required("District is required.")
    .test(
      "test-district-min",
      "District is reqired",
      (v) => v != null && v > 0,
    ),
  tehsil_id: Yup.number()
    .nullable()
    .required("Tehsil is required.")
    .test("test-tehsil-min", "Tehsil is reqired", (v) => v != null && v > 0),
  city_id: Yup.number()
    .nullable()
    .test("test-city-min", "Tehsil is reqired", (v) => v != null && v > 0),
  tehsil_name: Yup.string().optional(),
  // naamdan_taken: Yup.string().required("Name is required."),
  naamdan_center: Yup.string().required("Namdan center is required."),
  consent_otp: Yup.string().required("Otp is required."),
  dates: Yup.array().of(
    Yup.object().shape({
      entry_type: Yup.string().required("Select the entrytype first"),
      date: Yup.string().required("Date is required."),
      remark: Yup.string().optional(),
      showRemark: Yup.bool().default(false),
    }),
  ),
  entry_type: Yup.string(),
});

interface TEntry {
  entry_type: string;
  date: Date | null;
  remark?: string;
  showRemark: boolean;
}

const relationOptions: Array<Option> = [
  { label: "S/O", value: "S/O" },
  { label: "D/O", value: "D/O" },
];

const entryOptions: Array<Option> = entryTypeOptions.map((item) => ({
  label: item.replace("_", " "),
  value: item,
}));

const NewDisciple: NextPage = () => {
  const [occupationList, setOccupationList] = useState<Array<Option>>([]);
  const [centerList, setCenterList] = useState<Array<Option>>([]);
  const [preview, setPreview] = useState<string | ArrayBuffer | null>(null);

  const avatarRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (values: FormikValues) => {
    try {
      // api coll to get otp for given mobile number
      console.log(values);
    } catch (e) {
      console.error(e);
    }
  };

  const getOtp = async () => {
    try {
      // api coll to get otp for given mobile number
      toast.success("Otp sent");
    } catch (e) {
      console.error(e);
    }
  };

  const addNewEntry = (cb: (e: any) => void, entry_type: string) => {
    const showRemark = ["sadasyata", "shuddhikaran", "punar_updesh"].includes(
      "",
    );
    cb({
      entry_type,
      showRemark,
      date: null,
      remark: "",
    });
  };

  useEffect(() => {
    (async () => {
      const occupationRes = await getOccupationList();
      setOccupationList(occupationRes);
    })();
  }, []);

  return (
    <Layout headerProps={{ isBack: true, heading: "Create New" }}>
      <div className="min-h-screen w-full mx-auto max-w-md p-10 px-6 sm:px-8 ">
        <Formik
          initialValues={{
            name: "",
            form_date: new Date(),
            guardian_name: "",
            relation: "S/O",
            dob: null,
            occupation: "",
            avatar: null,
            email: "",
            country_id: null,
            state_id: null,
            district_id: null,
            tehsil_id: null,
            city_id: null,
            naamdan_center: null,
            dates: [],
            unique_id: "",
            entry_type: "",
            mobile_no: "",
            whatsapp_no: "",
            consent_otp: "",
          }}
          validationSchema={createDiscipleSchema}
          onSubmit={onSubmit}
        >
          {({ values, errors, setFieldValue }) => {
            useEffect(() => {
              if (values.district_id != null) {
                const centers = getCenters(values.district_id).then((res) => {
                  setCenterList(res);
                });
              }
            }, [values.district_id]);
            return (
              <Form>
                <input
                  type={"file"}
                  name="avatar"
                  hidden
                  ref={avatarRef}
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      let reader = new FileReader();
                      reader.onload = () => {
                        if (reader.readyState === 2) {
                          setFieldValue("avatar", reader.result);
                          setPreview(reader.result);
                        }
                      };
                      reader.readAsDataURL(e.target?.files[0]);
                    }
                  }}
                />
                <div
                  onClick={() => avatarRef.current?.click()}
                  className="w-24 mx-auto mt-2 flex flex-col items-center justify-center h-24 bg-gray-300 rounded-full overflow-hidden"
                >
                  <>
                    {values.avatar ? (
                      <img
                        src={preview as string}
                        alt="Profile"
                        className="w-full h-full object-cover overflow-hidden"
                      />
                    ) : (
                      <>
                        <p>+</p>
                        <p className="font-bold text-gray-400 text-md">
                          Add Image
                        </p>
                      </>
                    )}
                  </>
                </div>
                {errors.avatar ? (
                  <FormErrorMessage className="mb-2 text-center">
                    {errors.avatar}
                  </FormErrorMessage>
                ) : null}
                <div className="flex-1">
                  <DatePicker
                    label="Form Date"
                    name="form_date"
                    onChange={(e: any) => setFieldValue("form_date", e)}
                    maxDate={new Date()}
                    autoFocus
                    placeholderText="Enter form date"
                    dateFormat="dd-MM-yyyy"
                  />
                  {errors.form_date && (
                    <FormErrorMessage>
                      {errors.form_date as string}
                    </FormErrorMessage>
                  )}
                </div>
                <TextInput
                  name="name"
                  label="Name"
                  placeholder="Enter disciple name"
                />
                <TextInput
                  name="guardian_name"
                  label="Guardian's Name"
                  placeholder="Enter guardian's name"
                />
                <TextInput
                  name="guardian_name"
                  label="Guardian's Name"
                  placeholder="Enter guardian's name"
                />
                <Select
                  options={relationOptions}
                  label="Relation"
                  name="relation"
                  placeholder={"Select Relation"}
                  value={relationOptions.find(
                    (s) => s.value == values.relation,
                  )}
                  onChange={(e: any) => {
                    setFieldValue("relation", e.value);
                  }}
                />
                <div className="flex-1">
                  <DatePicker
                    label="Date of birth"
                    name="dob"
                    onChange={(e: any) => setFieldValue("dob", e)}
                    maxDate={subYears(new Date(), 3)}
                    placeholderText="Enter DOB"
                    dateFormat="dd-MM-yyyy"
                  />
                  {errors.dob && (
                    <FormErrorMessage>{errors.dob}</FormErrorMessage>
                  )}
                </div>

                <TextInput
                  name="mobile_no"
                  label="Mobile Number"
                  inputMode="numeric"
                  placeholder="Enter mobile number"
                />
                <TextInput
                  name="whatsapp_no"
                  label="Whatsapp Number"
                  inputMode="numeric"
                  placeholder="Enter whatsapp number"
                />

                <TextInput
                  name="email"
                  label="Email"
                  type={"email"}
                  placeholder="Enter email"
                />

                <TextInput
                  name="unique_id"
                  label="Aadhar Number"
                  type={"number"}
                  placeholder="Enter aadhar number"
                />

                <Select
                  options={occupationList}
                  label="Occupation"
                  name="occupation"
                  placeholder={"Select Occupation"}
                  value={occupationList.find(
                    (s) => s.value == values.occupation,
                  )}
                  onChange={(e: any) => {
                    setFieldValue("occupation", e.value);
                  }}
                />
                <UserwiseDropdown />
                <Select
                  options={centerList}
                  label="Naamdan Center/Ashram"
                  name="naamdan_center"
                  placeholder={"Select Naamdan Center"}
                  value={centerList.find(
                    (s) => s.value == values.naamdan_center,
                  )}
                  onChange={(e: any) => {
                    setFieldValue("naamdan_center", e.value);
                  }}
                />

                <TextInput
                  name="address"
                  label="Address"
                  type={"text"}
                  placeholder="Enter Address"
                />

                <TextInput
                  name="pincode"
                  label="Pincode"
                  type={"number"}
                  inputMode="numeric"
                  placeholder="Enter Pincode"
                />

                <hr className="w-48 h-1 mx-auto my-4 bg-gray-100 border-0 rounded md:my-10 dark:bg-slate-300" />

                {/* @ts-ignore */}
                <FieldArray
                  name="dates"
                  render={({ push, remove }) => (
                    <React.Fragment>
                      {values.dates.map((item: TEntry, index) => (
                        <div
                          className="w-full relative p-1 border rounded border-slate-300 mb-2"
                          key={index + item.entry_type}
                        >
                          {values.dates.length - 1 === index ? (
                            <button
                              className="absolute right-2 top-2 bg-white text-black"
                              onClick={() => remove(index)}
                            >
                              <RiCloseCircleLine className="text-red-500 text-xl" />
                            </button>
                          ) : null}
                          <div className="flex-1">
                            <DatePicker
                              label={item.entry_type.replace("_", " ")}
                              name={`dates.${index}.date`}
                              onChange={(e: any) => setFieldValue("dob", e)}
                              maxDate={new Date()}
                              minDate={
                                index > 0
                                  ? addDays(
                                      //@ts-ignore
                                      values.dates[index - 1].date,
                                      1,
                                    )
                                  : undefined
                              }
                              dateFormat="dd-MM-yyyy"
                            />
                            {errors.dob && (
                              <FormErrorMessage>{errors.dob}</FormErrorMessage>
                            )}
                          </div>
                          {item.showRemark ? (
                            <TextInput
                              name={`dates.${index}.remark`}
                              label="Remark"
                              type={"text"}
                              placeholder="Enter Remark"
                            />
                          ) : null}
                        </div>
                      ))}
                      <Select
                        className={"title"}
                        options={entryOptions}
                        value={entryTypeOptions.find(
                          (s) => s == values.entry_type,
                        )}
                        onChange={(e: any) => {
                          setFieldValue("entry_type", e.value);
                        }}
                      />
                      <Button
                        className="w-full mb-2"
                        onClick={() => {
                          // @ts-ignore
                          if (!entryTypeOptions.includes(values.entry_type)) {
                            toast.error("Select entry type");
                            return;
                          }

                          if (
                            values.dates.length &&
                            // @ts-ignore
                            !values.dates.slice(-1)[0]?.date
                          ) {
                            toast.error("Complete the previous entry");
                            return;
                          }

                          addNewEntry(push, values.entry_type);
                          setFieldValue("entry_type", null);
                        }}
                      >
                        {values.dates.length > 0
                          ? "Add Another Entry"
                          : "Add Previous Entry"}
                      </Button>
                    </React.Fragment>
                  )}
                />

                <hr className="w-48 h-1 mx-auto my-4 bg-gray-100 border-0 rounded md:my-10 dark:bg-slate-300" />

                {/*<Button*/}
                {/*    className="w-full mb-2"*/}
                {/*    variant="primary-reverse"*/}
                {/*    type="button"*/}
                {/*    onClick={() => {*/}
                {/*        if (!values.mobile_no) {*/}
                {/*            return;*/}
                {/*        }*/}
                {/*        getOtp();*/}
                {/*    }}*/}
                {/*>*/}
                {/*    GET OTP*/}
                {/*</Button>*/}

                {/*<TextInput*/}
                {/*    name="consent_otp"*/}
                {/*    label="OTP"*/}
                {/*    type={"number"}*/}
                {/*    inputMode="numeric"*/}
                {/*    maxLength={6}*/}
                {/*    placeholder="Enter OTP"*/}
                {/*/>*/}

                <Button className="w-full" type="submit">
                  Submit
                </Button>
              </Form>
            );
          }}
        </Formik>
      </div>
    </Layout>
  );
};

export default NewDisciple;
