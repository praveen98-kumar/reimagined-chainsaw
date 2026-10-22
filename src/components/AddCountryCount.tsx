import { Fragment, useState, useEffect, useRef } from "react";
import Button from "./Button";
import Modal from "./modal/Modal";
import { Form, Formik } from "formik";
import { Option } from "@/shared/interfaces/option";
import { getCountries } from "@/shared/functions/location";
import apiClient from "@/http/index";
import Select from "./input/Select";
import { useTranslation } from "react-i18next";
import TextInput from "./input/TextInput";
import toast from "react-hot-toast";

const AddCountryCount = ({
  onSuccess,
}: {
  onSuccess?: (data: any) => void;
}) => {
  const { t } = useTranslation("common");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<Option[]>([]);

  const formRef = useRef<any>(null);

  const addOrUpdateCountryCount = async (payload: {
    country_id: number;
    country_name: string;
    national: number;
    international: number;
  }) => {
    setLoading(true);
    try {
      await apiClient.post("country_order_count", payload);
      if (onSuccess)
        onSuccess({
          country: payload.country_name,
          national: payload.national,
          international: payload.international,
        });
      toast.success("Country count add successfully");
    } catch (error) {
      console.error(`Couldn't add or update county count`, error);
    } finally {
      setLoading(false);
      setShow(false);
    }
  };

  const getCountryCount = async (country_id: number) => {
    try {
      const { data } = await apiClient.get("country_order_count", {
        params: { country_id },
      });
      const countryData = data?.data?.find(
        (c: any) => c.country_id == country_id
      );
      formRef?.current?.setFieldValue("national", countryData.national ?? 0);
      formRef?.current?.setFieldValue(
        "international",
        countryData.international ?? 0
      );
    } catch (error) {
      console.error(`Couldn't get county count`, error);
    }
  };

  useEffect(() => {
    if (countries.length == 0) {
      (async () => {
        try {
          const response = await getCountries();
          setCountries(response.filter((c) => c.value == 156));
        } catch (error) {
          console.error(`Cannot fetch countries`);
        }
      })();
    }
  }, [countries]);

  return (
    <Fragment>
      <Button type="button" className="w-1/2" onClick={() => setShow(true)}>
        Add Country Count
      </Button>
      <Modal
        show={show}
        onClose={() => setShow(false)}
        onConfirm={() => {
          formRef?.current?.handleSubmit();
        }}
        loading={loading}
        disableClosing={loading}
      >
        <div className="space-y-8 mb-8">
          <Formik
            innerRef={formRef}
            initialValues={{
              country_id: 0,
              country_name: "",
              national: 0,
              international: 0,
            }}
            onSubmit={(v) => addOrUpdateCountryCount({ ...v })}
          >
            {({ values, setFieldValue, touched, errors }) => (
              <Form>
                <Select
                  options={countries}
                  label={t("country") ?? "Country"}
                  name="country_id"
                  placeholder={t("select_country") ?? "Select Country"}
                  value={
                    countries.find((c) => c.value == values.country_id) ?? null
                  }
                  onChange={(opt: any) => {
                    setFieldValue("country_id", opt.value ?? null);
                    if (opt?.value) {
                      const c_name = countries.find(
                        (c) => c.value == opt.value
                      )?.label;
                      setFieldValue("country_name", c_name);
                      getCountryCount(opt.value);
                    }
                  }}
                  error={errors.country_id}
                  touched={touched.country_id}
                />
                <TextInput
                  label="National Count"
                  placeholder="Enter national count"
                  name="national"
                  id="national"
                  type="number"
                />

                <TextInput
                  label="International Count"
                  placeholder="Enter international count"
                  name="international"
                  id="international"
                  type="number"
                />
              </Form>
            )}
          </Formik>
        </div>
      </Modal>
    </Fragment>
  );
};

export default AddCountryCount;
