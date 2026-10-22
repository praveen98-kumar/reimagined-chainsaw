import React, { InputHTMLAttributes } from "react";
import { useField } from "formik";
import FormLabel from "./FormLabel";
import FormErrorMessage from "./FormErrorMessage";
import { Option } from "../../shared/interfaces/option";
import { cn } from "@/shared/functions/utils";

type RadioProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
  options: Option[];
  inputClassName?: string;
  wrapperClass?: string;
  radioGroupClass?: string;
};

const Radio: React.FC<RadioProps> = ({
  // name,
  label,
  required,
  options,
  inputClassName,
  wrapperClass,
  radioGroupClass,
  disabled,
  ...props
}) => {
  const [field, { error, touched }] = useField(props);
  return (
    <div className={cn("mb-2 space-y-1", wrapperClass)}>
      <FormLabel htmlFor={field.name} label={label} required={required} />
      <div className={cn("grid grid-cols-2 gap-y-3 gap-x-2", radioGroupClass)}>
        {options.map((option) => (
          <div
            key={option.value as string}
            className={`w-full h-full flex items-center ${
              option.label.length > 20 ? "col-span-2" : "col-span-1"
            }`}
          >
            <input
              type="radio"
              id={field.name + option.value.toString()}
              className={cn(inputClassName, {
                "opacity-50": disabled,
              })}
              {...field}
              {...props}
              checked={option.value == field.value}
              required={required}
              name={field.name}
              value={option.value}
              disabled={disabled}
            />
            <label
              className="ml-2 leading-4"
              htmlFor={field.name + option.value.toString()}
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
      {error && touched ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </div>
  );
};

export default Radio;
