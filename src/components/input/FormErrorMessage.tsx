import React from "react";

interface FormErrorMessageProps {
  children: string;
  className?: string;
}
const FormErrorMessage: React.FC<FormErrorMessageProps> = ({
  children,
  className,
}) => {
  return (
    <div className={`block text-red-500 text-sm ` + className}>{children}</div>
  );
};

export default FormErrorMessage;
