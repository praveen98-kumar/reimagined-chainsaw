import React, { TextareaHTMLAttributes } from "react";
import { IconType } from "react-icons/lib";
import { useField } from "formik";
import FormLabel from "./FormLabel";
import FormErrorMessage from "./FormErrorMessage";
import { cn } from "@/shared/functions/utils";
type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  Icon?: IconType;
  name: string;
  wrapperClass?: string;
};
const TextArea: React.FC<TextAreaProps> = ({
  label,
  Icon,
  required,
  className,
  wrapperClass,
  ...props
}) => {
  const [field, { error, touched }] = useField(props);
  return (
    <div className={cn("space-y-1", wrapperClass)}>
      {label ? (
        <FormLabel htmlFor={field.name} label={label} required={required} />
      ) : null}
      <div className="relative m-0 p-0">
        <textarea
          className={`w-full px-4 py-2 text-gray-700 placeholder-gray-500 bg-white border-1  rounded-md  focus:border-border-800  focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-gray-300 
          disabled:bg-gray-100 disabled:border-gray-100
          ${
            touched && error ? "border-red-500" : "border-slate-300"
          } ${className}`}
          required={required}
          {...field}
          {...props}
        />
        {Icon ? (
          <Icon className="absolute w-6 h-6 text-gray-500 -translate-y-1/2 pointer-events-none top-6 right-4" />
        ) : null}
      </div>
      {touched && error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </div>
  );
};

export default TextArea;
