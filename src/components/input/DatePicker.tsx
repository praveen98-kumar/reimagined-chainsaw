import React from "react";
import {
  DatePicker as DateView,
  DatePickerProps as ReactDatePickerProps,
} from "react-datepicker";
import { Field } from "formik";
import FormLabel from "./FormLabel";

export type DatePickerProps = ReactDatePickerProps & {
  label: string;
};
const DatePicker = (props: DatePickerProps) => {
  const { label, name, required, ...rest } = props;

  return (
    <div className="mb-2 space-y-1">
      <FormLabel label={label} required={required} />
      <Field name={name}>
        {/* @ts-ignore */}
        {({ form, field }) => {
          const { setFieldValue } = form;
          const { value, errors } = field;
          return (
            <DateView
              className="z-30 w-full px-4 py-2 border  bg-white rounded-md  focus:border-gray-800  focus:ring-opacity-40 focus:outline-none focus:ring border-slate-300 focus:ring-gray-400 disabled:bg-gray-100 disabled:border-gray-100"
              id={name}
              {...field}
              {...rest}
              required={required}
              selected={value}
              onChange={(e: any) => setFieldValue(name, e)}
              onSelect={(d, _) => setFieldValue(name, d)}
            />
          );
        }}
      </Field>
    </div>
  );
};

export default DatePicker;
