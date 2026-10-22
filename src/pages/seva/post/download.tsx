import Button from "@/components/Button";
import DatePicker from "@/components/input/DatePicker";
import Select from "@/components/input/Select";
import TextInput from "@/components/input/TextInput";
import Layout from "@/components/Layout";
import apiClient from "@/http/index";
import {
  getStates,
  handleDistrictChange,
  handleStateChange,
} from "@/shared/functions/location";
import { downloadFile, objectWithValues } from "@/shared/functions/utils";
import { Tab } from "@/shared/interfaces/app";
import { Option } from "@/shared/interfaces/option";
import dayjs from "dayjs";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import * as Yup from "yup";
import Icon from "@/components/Icon";
import DateFilter from "@/components/DateFilter";

const DownloadPostOrders = () => {
  const router = useRouter();
  const [newOrders, setNewOrders] = useState(true);
  const [states, setStates] = useState<Option[]>([]);
  const [districts, setDistricts] = useState<Option[]>([]);
  const [tehsils, setTehsils] = useState<Option[]>([]);
  const [totalNewCount, setTotalNewCount] = useState(0);

  const schema = Yup.object({
    start: Yup.date().required("Start date is required.").nullable(),
    end: Yup.date()
      .max(new Date())
      .required("End date is required.")
      .nullable(),
  });
  const handleClick = useCallback(() => {
    if (newOrders) {
      setNewOrders(false);
    } else {
      setNewOrders(true);
    }
  }, [newOrders]);

  useEffect(() => {
    (async () => {
      if (!newOrders) {
        const temp = await getStates("2");
        setStates(temp);
      } else {
        const response: any = await apiClient.get("post_orders_total_count");
        setTotalNewCount(response.data.data.total);
      }
    })();
  }, [newOrders]);
  return (
    <Layout headerProps={{ isBack: true, heading: `Book Delivery By Post` }}>
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <div className="flex overflow-hidden rounded-xl drop-shadow-lg border border-gray-400">
          <button
            className={`w-full p-2 py-3 transition  ${
              newOrders
                ? "text-white bg-primary font-semibold text-center"
                : "bg-white text-gray-800"
            }`}
            onClick={handleClick}
            disabled={newOrders}
          >
            New Orders
          </button>
          <button
            className={`w-full p-2 py-3 transition   ${
              !newOrders
                ? "text-white bg-primary font-semibold text-center"
                : "bg-white text-gray-800"
            }`}
            onClick={handleClick}
            disabled={!newOrders}
          >
            Old Orders
          </button>
        </div>
        {newOrders && (
          <Formik
            initialValues={{}}
            onSubmit={async (values) => {
              await downloadFile({
                endPoint: "post_orders_download",
                params: { new: 1 },
                fileName: `NewOrders-${dayjs().format("YYYY-MM-DD")}.xlsx`,
              });
            }}
          >
            {({ handleChange, values, errors }) => (
              <Form className="pb-2">
                <div className="flex flex-row">
                  <TextInput
                    className="basis-5/6 py-2 m-0 rounded-r-none"
                    placeholder={`NewOrders-${dayjs().format(
                      "YYYY-MM-DD"
                    )}.xlsx`}
                    name="download"
                    autoFocus
                    disabled={true}
                  />
                  <Button
                    className="basis-1/6 py-3 px-none rounded-l-none"
                    style={{
                      maxHeight: "42px",
                      maxWidth: "175px",
                      paddingLeft: "7px",
                      paddingRight: "7px",
                    }}
                    type="submit"
                    disabled={totalNewCount == 0}
                  >
                    <Icon
                      containerClass="w-4 h-4 mr-2"
                      src="/assets/icons/Download Order list.png"
                    />
                    Download
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        )}
        {!newOrders && (
          <Formik
            initialValues={{
              start: null,
              end: null,
              state: 0,
              district: 0,
              tehsil: 0,
            }}
            validationSchema={schema}
            onSubmit={async (values) => {
              let formValues = {
                ...values,
                start: dayjs(values.start).format("YYYY-MM-DD"),
                end: dayjs(values.end).format("YYYY-MM-DD"),
              };
              let formattedValues = objectWithValues(formValues);
              const data = {
                ...formattedValues,
              };
              await downloadFile({
                endPoint: "post_orders_download",
                params: data,
                fileName: `OldOrders-${data["start"]}-${data["end"]}`,
              });
            }}
          >
            {({ handleChange, values, errors, setFieldValue }) => (
              <Form>
                <div className="flex gap-4 justify-center">
                  <DateFilter />
                </div>
                <Select
                  options={states}
                  label="State"
                  placeholder="Select State/राज्य चुनें"
                  name="state"
                  onChange={(e: any) => {
                    setFieldValue("state", e.value);
                    handleStateChange(e.value, setDistricts);
                  }}
                />
                {districts.length > 0 && (
                  <Select
                    options={districts}
                    label="District"
                    placeholder="Select District/ज़िला चुनें"
                    name="district"
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
                    placeholder="Select Tehsil/तहसील चुनें"
                    onChange={(e: any) => {
                      setFieldValue("tehsil", e.value);
                    }}
                  />
                )}
                <Button type="submit" className="mx-auto mt-4">
                  Download
                </Button>
              </Form>
            )}
          </Formik>
        )}

        {newOrders && (
          <div className="shadow-3xl shadow-slate-300 rounded-xl p-2">
            <p className="p-2" style={{ borderBottom: "1px solid #ddd" }}>
              New Orders as on {dayjs().format("YYYY-MM-DD")}
            </p>
            <p className="flex justify-between p-2">
              <span>{totalNewCount}</span>
              <span>Total Messages</span>
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DownloadPostOrders;
