import React, { InputHTMLAttributes } from "react";
import { useField } from "formik";
import { IconType } from "react-icons/lib";
import FormErrorMessage from "./FormErrorMessage";
import FormLabel from "./FormLabel";
import { cn } from "@/shared/functions/utils";

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  Icon?: IconType;
  name: string;
  appendEle?: React.ReactNode;
  prependEle?: React.ReactNode;
  fieldClass?: string;
};

const TextInput: React.FC<TextInputProps> = ({
  label,
  Icon,
  size: _,
  required,
  className,
  appendEle,
  prependEle,
  fieldClass,
  ...props
}) => {
  const [field, { error, touched }] = useField(props);
  return (
    <div className={cn("mb-2 space-y-1", fieldClass)}>
      {label ? (
        <FormLabel htmlFor={field.name} label={label} required={required} />
      ) : null}

      <div className="relative">
        {appendEle && appendEle}
        <input
          className={`w-full px-4 py-2 border text-[#431407] placeholder-[#a78b78] bg-white rounded-xl focus:border-orange-500 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-orange-200 disabled:bg-orange-50 disabled:border-orange-100 ${
            error && touched ? "border-red-500" : "border-orange-200"
          } ${Icon ? "pr-12" : ""} ${className}`}
          required={required}
          {...field}
          {...props}
        />
        {Icon ? (
          <Icon className="absolute w-6 h-6 text-gray-500 -translate-y-1/2 pointer-events-none top-1/2 right-4" />
        ) : null}
        {prependEle && prependEle}
      </div>
      {touched && error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </div>
  );
};

export default TextInput;
