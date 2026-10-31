import { Form, Formik, useFormikContext } from "formik";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import * as Yup from "yup";
import Button from "@/components/Button";
import Select from "@/components/input/Select";
import TextInput from "@/components/input/TextInput";
import Layout from "@/components/Layout";
import { useDistricts, useStates, useTehsils } from "@/hooks/useLocationAPI";
import useLocalstorage from "@/hooks/useLocalstorage";
import apiClient from "@/http/index";
import type { Option } from "@/shared/interfaces/option";
import type { Disciple } from "@/shared/interfaces/user";

const discipleProfileSchema = Yup.object({
  name: Yup.string().required("Name is required."),
  guardian_name: Yup.string().required("Guardian's name is required."),
  relation: Yup.string().required("Relation is required."),
  state_id: Yup.number().required("State is required."),
  district_id: Yup.number().required("District is required."),
  tehsil_id: Yup.number().required("Tehsil is required."),
  address: Yup.string().required("Address is required."),
});

type DiscipleFormValues = {
  name: string;
  guardian_name: string;
  relation: string;
  state_id: number | "";
  district_id: number | "";
  tehsil_id: number | "";
  address: string | "";
};
const relationOptions: Array<Option> = [
  { label: "S/O", value: "S/o" },
  { label: "D/O", value: "D/o" },
  { label: "W/O", value: "W/o" },
];

function LocationFields({ countryId }: { countryId?: number }) {
  const { values, errors, touched, setFieldValue } =
    useFormikContext<DiscipleFormValues>();
  const { data: states } = useStates(countryId);
  const { data: districts } = useDistricts(values.state_id || undefined);
  const { data: tehsils } = useTehsils(values.district_id || undefined);

  return (
    <>
      <Select
        options={states}
        label="State"
        required
        name="state_id"
        placeholder={"Select State"}
        value={states?.find((s: Option) => s.value === values.state_id) ?? null}
        onChange={(e: any) => {
          setFieldValue("state_id", e?.value ?? "");
          setFieldValue("district_id", "");
          setFieldValue("tehsil_id", "");
        }}
        error={errors.state_id}
        touched={!!touched.state_id}
      />
      <Select
        options={districts}
        label="District"
        required
        name="district_id"
        placeholder={"Select District"}
        value={
          districts?.find((d: Option) => d.value === values.district_id) ??
          null
        }
        onChange={(e: any) => {
          setFieldValue("district_id", e?.value ?? "");
          setFieldValue("tehsil_id", "");
        }}
        error={errors.district_id}
        touched={!!touched.district_id}
      />
      <Select
        options={tehsils}
        label="Tehsil"
        required
        name="tehsil_id"
        placeholder={"Select Tehsil"}
        value={
          tehsils?.find((t: Option) => t.value === values.tehsil_id) ?? null
        }
        onChange={(e: any) => {
          setFieldValue("tehsil_id", e?.value ?? "");
        }}
        error={errors.tehsil_id}
        touched={!!touched.tehsil_id}
      />
    </>
  );
}

export default function DiscipleIdPage() {
  const router = useRouter();
  const discipleIdParam = router.query.discipleId;
  const discipleId =
    typeof discipleIdParam === "string" ? Number(discipleIdParam) : undefined;

  const isLoading = false;
  const [disciple, ,] = useLocalstorage<Disciple | null>(
    "selectedDisciple",
    null,
  );

  const handleSubmit = async (values: DiscipleFormValues) => {
    if (!discipleId) return;
    try {
      await apiClient.put(`disciple/${discipleId}/edit`, {
        name: values.name,
        guardian_name: values.guardian_name,
        relation: values.relation,
        state_id: values.state_id,
        district_id: values.district_id,
        tehsil_id: values.tehsil_id,
        address: values.address
      });
      toast.success("Disciple updated successfully.");

      router.back();
      // await refetch();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error || "Failed to update disciple profile.",
      );
    }
  };

  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: "Edit Disciple",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        {isLoading && <p>Loading disciple profile...</p>}
        {!isLoading && !disciple && <p>Disciple not found.</p>}

        {!isLoading && disciple && (
          <Formik<DiscipleFormValues>
            enableReinitialize
            initialValues={{
              name: disciple?.name ?? "",
              guardian_name: disciple.guardian_name ?? "",
              relation: disciple.relation ?? "",
              state_id: disciple.state_id ?? "",
              district_id: disciple.district_id ?? "",
              tehsil_id: disciple.tehsil_id ?? "",
              address: disciple.address ?? "",
            }}
            validationSchema={discipleProfileSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, setFieldValue, values }) => (
              <Form className="space-y-4">
                <TextInput
                  name="name"
                  label="Name"
                  placeholder="Enter disciple name"
                />
                <Select
                  options={relationOptions}
                  label="Relation"
                  required
                  name="relation"
                  placeholder={"Select Relation"}
                  value={relationOptions.find(
                    (s) => s.value === values.relation,
                  )}
                  onChange={(e: any) => {
                    setFieldValue("relation", e.value);
                  }}
                />
                <TextInput
                  name="guardian_name"
                  label="Guardian's Name"
                  placeholder="Enter guardian's name"
                />

                <TextInput
                  name="address"
                  label="Address"
                  placeholder="Enter address"
                />
                <LocationFields countryId={disciple.country_id} />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="submit"
                    loading={isSubmitting}
                    className="px-4 py-2"
                  >
                    Update
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="px-4 py-2"
                    onClick={router.back}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </Layout>
  );
}
