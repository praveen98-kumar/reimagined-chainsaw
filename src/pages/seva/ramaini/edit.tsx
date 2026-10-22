import React, { useRef } from "react";
import { Form, Formik, type FormikProps, type FormikValues } from "formik";
import Button from "@/components/Button";
import type { Option } from "@/shared/interfaces/option";
import { getCountries, handleCountryChange } from "@/shared/functions/location";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import toast from "react-hot-toast";
import {
  getInitialValues,
  profileSchema,
} from "../../../utils/ramaini-edit.schema";
import PersonDetails from "@/components/ramaini/edit/PersonDetails";
import apiClient from "@/http/index";
import { useAppSelector } from "@/redux/store";
import ReviewModal from "@/components/modal/ReviewModal";
import { ramaini_seva_file_keys } from "@/components/ramaini/utils";
import ConfirmModal from "@/components/modal/ConfirmModal";

type RamainiEditModalProps = {
  formId: string;
};

const fileToBase64 = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

function RamainiEditModal({ formId }: RamainiEditModalProps) {
  const router = useRouter();
  const [isFormDisabled, setIsFormDisabled] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [showVerifyConfirm, setShowVerifyConfirm] = React.useState(false);
  const [showUpdateConfirm, setShowUpdateConfirm] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { active_permission } = useAppSelector((s) => s.auth);
  const formRef = useRef<FormikProps<FormikValues>>(null);

  const {
    data: ramainiForm,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["formId", formId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/member/${formId}`);
      return data?.data ?? null;
    },
    enabled: !!formId,
    retry: 2,
  });

  if (isLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-red-600">
        Error loading data: {error?.message}
        <button
          type="button"
          onClick={() => refetch()}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!ramainiForm) {
    return <div className="p-4 text-center">No data found</div>;
  }

  const initialValues = getInitialValues(ramainiForm);

  const handleSubmit = async (values: any) => {
    const promises = Object.entries(values).map(async ([key, val]) => {
      if (
        ramaini_seva_file_keys.includes(key) &&
        typeof val === "string" &&
        !val.includes("data:image")
      ) {
        return;
      } else if (val instanceof File) {
        const base64 = await fileToBase64(val as File);
        return [key, base64];
      } else if (val instanceof FileList && val?.item(0) !== null) {
        const base64 = await fileToBase64(val.item(0) as File);
        return [key, base64];
      } else if (val === "yes" || val === "no") {
        return [key, val === "yes"];
      } else if (val === "" || key.includes("_url")) {
        return;
      } else if (val !== undefined) {
        return [key, val];
      }
      return null; // For undefined values
    });
    const resolvedEntries = (await Promise.all(promises)).filter(Boolean);

    const formattedPayload = Object.fromEntries(resolvedEntries as []);

    setIsSubmitting(true);
    try {
      const { data } = await apiClient.put(
        `/member/${formId}`,
        formattedPayload
      );
      toast.success(data.message);
    } catch (error: any) {
      toast.error(error?.response?.data?.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  async function handleVerify(paylaod?: { verify: boolean; remarks: string }) {
    const url =
      active_permission?.role === "ramaini_sevadar"
        ? `member/${formId}/verify_first`
        : `member/${formId}/verify_second`;
    try {
      const requestData = {
        verify: true,
        remarks: "",
        ...paylaod,
      };
      const { data } = await apiClient.put(url, requestData);
      toast.success(data.message);
      if (requestData.verify) {
        setTimeout(() => {
          router.back();
          if (url.includes("verify_second")) {
            window.open(`/seva/ramaini/print?formId=${formId}`, "_blank");
          }
        }, 1500);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.error);
    }
  }

  return (
    <React.Fragment>
      <Formik
        innerRef={formRef}
        initialValues={initialValues}
        validationSchema={profileSchema}
        onSubmit={() => setShowUpdateConfirm(true)}
        enableReinitialize
        validateOnBlur
      >
        {() => (
          <Form className="space-y-4">
            <PersonDetails
              personType="groom"
              isFormDisabled={isFormDisabled || isLoading || isSubmitting}
            />
            <div className="pt-8">
              <PersonDetails
                personType="bride"
                isFormDisabled={isFormDisabled || isLoading || isSubmitting}
              />
            </div>
            {!isFormDisabled && (
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="primary-reverse"
                  className="flex-1 bg-red-100 text-red-500 border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setShowConfirm(true)}
                  disabled={isFormDisabled || isLoading || isSubmitting}
                >
                  Reject
                </Button>
                <Button
                  type="button"
                  variant="primary-reverse"
                  className="flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setShowVerifyConfirm(true)}
                  disabled={isFormDisabled || isLoading || isSubmitting}
                >
                  Verify
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isFormDisabled || isLoading || isSubmitting}
                >
                  Update
                </Button>
              </div>
            )}
          </Form>
        )}
      </Formik>
      <ReviewModal
        show={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={(data: any) =>
          handleVerify({ verify: false, remarks: String(data?.remarks) || "" })
        }
        title="Do you want to reject the form"
      />
      <ConfirmModal
        show={showUpdateConfirm}
        onClose={() => setShowUpdateConfirm(false)}
        onConfirm={() => handleSubmit(formRef?.current?.values)}
        title="Do you want to udpate the form"
      />
      <ConfirmModal
        show={showVerifyConfirm}
        onClose={() => setShowVerifyConfirm(false)}
        onConfirm={() => handleVerify()}
        title="Do you want to verify the form"
      />
    </React.Fragment>
  );
}

export default function Page() {
  const router = useRouter();
  if (!router.query.formId) {
    return null;
  }
  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: "Ramaini Seva Edit",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <RamainiEditModal formId={router.query.formId as string} />
      </div>
    </Layout>
  );
}
