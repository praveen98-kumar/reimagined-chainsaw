import { cn } from "@/shared/functions/utils";
import React from "react";
import ReactSelect, { Props } from "react-select";
import FormErrorMessage from "./FormErrorMessage";

type SelectProps = Props & {
  label?: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
  fieldClass?: string;
};

const Select: React.FC<SelectProps> = ({
  label,
  required = false,
  error = "",
  touched = false,
  fieldClass = "",
  className,
  ...props
}) => {
  return (
    <div className={fieldClass && fieldClass.length ? fieldClass : "mb-2"}>
      {label && (
        <label className="block text-primary font-normal text-md">
          {label}
          {required && <span className="ml-1 text-red-600">{"*"}</span>}
        </label>
      )}
      <ReactSelect
        className={cn(error && "border rounded-md border-red-500", className)}
        required={required}
        styles={{
          menu: (old: any) => ({ ...old, zIndex: 99 }),
        }}
        {...props}
      />
      {touched && error && <FormErrorMessage>{error}</FormErrorMessage>}
    </div>
  );
};

export default Select;
