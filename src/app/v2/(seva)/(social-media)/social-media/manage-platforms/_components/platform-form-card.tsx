"use client";

import { useMemo } from "react";
import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { Form, Formik, useFormikContext } from "formik";
import { Button } from "@/components/v2/ui/button";
import { Input } from "@/components/v2/ui/input";
import { Label } from "@/components/v2/ui/label";
import { createPlatformId } from "../_store/useMockPlatformStore";
import type {
  Platform,
  PlatformFormValues,
} from "../_types/manage-platforms.types";
import {
  emptyFeatureValues,
  emptyPlatformValues,
  platformSchema,
  toFormValues,
} from "../_utils/platform.schema";
import { FeatureFields } from "./feature-fields";
import { FileField } from "./file-field";

interface PlatformFormCardProps {
  mode: "create" | "edit";
  defaultValues?: Platform;
  onSubmit: (values: PlatformFormValues) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

function FormRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] text-[#8A93A8]">{label}</Label>
      {children}
    </div>
  );
}

function PlatformFormFields() {
  const { values, setFieldValue } = useFormikContext<PlatformFormValues>();

  const addFeature = () =>
    setFieldValue("features", [
      ...values.features,
      { ...emptyFeatureValues(), id: createPlatformId() },
    ]);

  const removeFeature = (index: number) =>
    setFieldValue(
      "features",
      values.features.filter((_, position) => position !== index),
    );

  return (
    <div className="space-y-3">
      <FormRow label="Platform Title">
        <Input
          name="title"
          value={values.title}
          onChange={(event) => setFieldValue("title", event.target.value)}
          placeholder="Enter Platform Title"
          className="h-9 rounded-xl border-[#E5E5E5] bg-white"
        />
      </FormRow>

      <FormRow label="Platform Icon">
        <FileField
          url={values.icon}
          name={values.iconName}
          onChange={({ url, name }) => {
            setFieldValue("icon", url);
            setFieldValue("iconName", name);
          }}
        />
      </FormRow>

      {values.features.map((feature, index) => (
        <FeatureFields
          key={feature.id}
          index={index}
          onRemove={() => removeFeature(index)}
        />
      ))}

      <button
        type="button"
        onClick={addFeature}
        className="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-[#E5E5E5] bg-[#F7F9FC] text-sm font-bold text-[#8A93A8]"
      >
        <Plus className="size-4" />
        Add feature
      </button>
    </div>
  );
}

export function PlatformFormCard({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  onDelete,
}: PlatformFormCardProps) {
  const initialValues = useMemo(
    () => (defaultValues ? toFormValues(defaultValues) : emptyPlatformValues()),
    [defaultValues],
  );

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-md">
      <div className="bg-linear-to-r from-[#0A1A6B] to-[#1E3FD8] px-4 py-1.5">
        <p className="text-sm font-bold text-white">
          {mode === "create" ? "Platform Details" : "Edit Platform Details"}
        </p>
      </div>

      <div className="p-3">
        <Formik
          initialValues={initialValues}
          validationSchema={platformSchema}
          enableReinitialize
          onSubmit={(values, helpers) => {
            onSubmit(values);
            if (mode === "create") helpers.resetForm();
          }}
        >
          {({ submitForm, isSubmitting }) => (
            <Form className="space-y-4">
              <PlatformFormFields />

              {mode === "create" ? (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="submit"
                    className="h-9 rounded-xl text-sm font-bold"
                    disabled={isSubmitting}
                    onClick={submitForm}
                  >
                    Submit
                  </Button>
                  <Button
                    type="button"
                    variant="cancel"
                    className="h-9 rounded-xl text-sm font-bold"
                    onClick={onCancel}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    className="h-9 rounded-xl bg-[#475569] text-sm font-bold text-white hover:bg-[#334155]"
                    onClick={onCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="submit"
                    className="h-9 rounded-xl text-sm font-bold"
                    disabled={isSubmitting}
                    onClick={submitForm}
                  >
                    Save Edits
                  </Button>
                  <Button
                    type="button"
                    variant="cancel"
                    className="h-9 rounded-xl text-sm font-bold"
                    onClick={onDelete}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
