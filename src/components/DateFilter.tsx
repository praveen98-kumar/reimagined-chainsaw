import { useFormikContext } from "formik";
import React from "react";
import DatePicker, { DatePickerProps } from "./input/DatePicker";
import FormErrorMessage from "./input/FormErrorMessage";
import { useTranslation } from "react-i18next";

interface DateFields {
  start: Date | null;
  end: Date | null;
}

const DateFilter = ({
  properties,
}: {
  properties?: Partial<Record<"start" | "end", Partial<DatePickerProps>>>;
}) => {
  const { t: tc } = useTranslation("common");
  const { values, setFieldValue, errors } = useFormikContext<DateFields>();
  return (
    <div className="w-full gap-4 flex items-center">
      <div className="flex-1">
        <DatePicker
          label={tc("start_date")}
          name="start"
          onChange={(e: any) => setFieldValue("start", e)}
          maxDate={new Date()}
          dateFormat="dd-MM-yyyy"
          // {...properties?.start}
        />
        {errors.start && <FormErrorMessage>{errors.start}</FormErrorMessage>}
      </div>
      <div className="flex-1">
        <DatePicker
          label={tc("end_date")}
          name="end"
          minDate={values?.start ?? undefined}
          onChange={(e: any) => setFieldValue("end", e)}
          maxDate={new Date()}
          dateFormat="dd-MM-yyyy"
          // {...properties?.end}
        />
        {errors.end && <FormErrorMessage>{errors.end}</FormErrorMessage>}
      </div>
    </div>
  );
};

export default DateFilter;
