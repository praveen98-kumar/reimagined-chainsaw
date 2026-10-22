import Avatar from "@/components/Avatar";
import Select from "@/components/input/Select";
import Layout from "@/components/Layout";
import apiClient from "@/http/index";
import {
  getStates,
  handleDistrictChange,
  handleStateChange,
} from "@/shared/functions/location";
import { objectWithValues } from "@/shared/functions/utils";
import { Option } from "@/shared/interfaces/option";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const TransferProfile = () => {
  const router = useRouter();
  const [states, setStates] = useState<Option[]>([]);
  const [districts, setDistricts] = useState<Option[]>([]);
  const [tehsils, setTehsils] = useState<Option[]>([]);
  const [sevadar, setSevadar] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const temp = await getStates("2");
      setStates(temp);
    })();
  }, []);
  useEffect(() => {
    if (router.query.userId) {
      (async () => {
        try {
          const { data } = await apiClient.get(`user/${router.query?.userId}`);
          setSevadar(data.data);
        } catch (error) {
          setSevadar(null);
          console.log("Error", error);
        }
      })();
    }
  }, [router.isReady]);
  return (
    <Layout headerProps={{ isBack: true, heading: "Sevadar Profile" }}>
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        {sevadar != null && (
          <div className="p-4 drop-shadow-lg shadow-lg border border-gray-300 rounded-lg text-center">
            <Avatar />
            <p>{sevadar?.name}</p>
            <p>{sevadar?.relation}</p>
            <p>{sevadar?.guardian_name}</p>
          </div>
        )}
        <Formik
          initialValues={{
            state: 0,
            district: 0,
            tehsil: 0,
          }}
          onSubmit={async (values) => {
            try {
              await apiClient.get("transfer_sevadar", {
                params: {
                  user: router.query?.userId,
                  ...objectWithValues(values),
                },
              });
              router.back();
            } catch (error) {
              console.error(error, "Error while downloading orders");
            }
          }}
        >
          {({ setFieldValue, values, isSubmitting }) => (
            <Form>
              <Select
                options={states}
                label="State"
                name="state"
                placeholder={"Select State/राज्य चुनें"}
                value={states.find((s) => s.value == values.state)}
                onChange={(e: any) => {
                  setFieldValue("state", e.value);
                  handleStateChange(e.value, setDistricts);
                }}
              />
              {districts.length > 0 && (
                <Select
                  options={districts}
                  label="District"
                  name="district"
                  placeholder={"Select District/ज़िला चुनें"}
                  value={districts.find((s) => s.value == values.district)}
                  onChange={(e: any) => {
                    setFieldValue("district", e.value);
                    handleDistrictChange(e.value, setTehsils);
                  }}
                />
              )}
              {tehsils.length > 0 && (
                <Select
                  options={tehsils}
                  label="Tehsil"
                  name="tehsil"
                  placeholder={"Select Tehsil/तहसील चुनें"}
                  value={tehsils.find((s) => s.value == values.tehsil)}
                  onChange={(e: any) => setFieldValue("tehsil", e.value)}
                />
              )}
              <div className="flex mt-32 items-center justify-center space-x-6 pb-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-600 w-1/2 text-white inline-block font-bold px-7 py-3 rounded-lg"
                >
                  Confirm
                </button>
                <button
                  type="reset"
                  disabled={isSubmitting}
                  className="bg-gray-400 text-white w-1/2 font-bold px-7 inline-block py-3 rounded-lg"
                >
                  Close
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Layout>
  );
};

export default TransferProfile;
