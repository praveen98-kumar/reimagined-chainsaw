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
        <label className="mb-1 block text-md font-semibold text-[#7c2d12]">
          {label}
          {required && <span className="ml-1 text-red-600">{"*"}</span>}
        </label>
      )}
      <ReactSelect
        className={cn(error && "border rounded-md border-red-500", className)}
        required={required}
        {...props}
        styles={{
          control: (old: any, state: any) => ({
            ...old,
            minHeight: 42,
            borderRadius: 12,
            borderColor: state.isFocused ? "#f97316" : "#fed7aa",
            boxShadow: state.isFocused
              ? "0 0 0 3px rgba(254,215,170,0.8)"
              : "none",
            "&:hover": { borderColor: "#f97316" },
          }),
          option: (old: any, state: any) => ({
            ...old,
            color: state.isSelected ? "#ffffff" : "#431407",
            backgroundColor: state.isSelected
              ? "#c2410c"
              : state.isFocused
                ? "#ffedd5"
                : "transparent",
          }),
          menu: (old: any) => ({
            ...old,
            zIndex: 99,
            borderRadius: 12,
            overflow: "hidden",
          }),
          ...props.styles,
        }}
      />
      {touched && error && <FormErrorMessage>{error}</FormErrorMessage>}
    </div>
  );
};

export default Select;
