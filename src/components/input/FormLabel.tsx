import React, { LabelHTMLAttributes } from "react";
type FormLabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  label: string;
  required?: boolean;
  htmlFor?: string;
};
const FormLabel: React.FC<FormLabelProps> = ({ label, required, htmlFor }) => {
  return (
    <label className="block text-primary font-normal text-md" htmlFor={htmlFor}>
      {label}
      {required && <span className="ml-1 text-red-600">{"*"}</span>}
    </label>
  );
};

export default FormLabel;
