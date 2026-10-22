import useOtp from "@/hooks/useOtp";
import React, { InputHTMLAttributes, useEffect, useMemo, useRef } from "react";

interface OtpInputProps {
  numInput?: number;
  onChange: (e: any) => void;
  value: string;
  autoFocus: boolean;
  disabled?: boolean;
  otpType?: "number" | "alpha" | "alphanumeric" | "any";
  secure?: boolean;
  placeholder?: string;
}

const OtpInput: React.FC<OtpInputProps> = ({
  autoFocus = false,
  disabled = false,
  otpType = "number",
  value = "",
  onChange,
  numInput = 4,
  placeholder = "",
  secure = false,
}) => {
  const {
    activeInput,
    getOtpValue,
    handleOnChange,
    handleOnKeydown,
    handleOnInput,
    onInputFocus,
  } = useOtp({
    autoFocus,
    otpType,
    value,
    otpLength: numInput,
    onChange,
  });

  const renderInput = useMemo(() => {
    const otp = getOtpValue();
    const inputs: React.ReactElement[] = [];
    for (let index = 0; index < numInput; index++) {
      inputs.push(
        <SingleInput
          key={index}
          inputMode="numeric"
          value={otp[index]}
          onChange={handleOnChange}
          onKeyDown={handleOnKeydown}
          onInput={handleOnInput}
          disabled={disabled}
          autoFocus={autoFocus}
          index={index}
          secure={secure}
          placeholder={placeholder}
          focus={activeInput === index}
          onInputFocus={onInputFocus}
        />
      );
    }
    return inputs;
  }, [
    getOtpValue,
    handleOnKeydown,
    handleOnChange,
    handleOnInput,
    numInput,
    disabled,
    autoFocus,
    otpType,
    activeInput,
  ]);
  return (
    <div className="flex space-x-1 xs:space-x-2 justify-center">
      {renderInput}
    </div>
  );
};

type SingleInputProps = InputHTMLAttributes<HTMLInputElement> & {
  onInputFocus: (index: number, e: React.FocusEvent<HTMLInputElement>) => void;
  focus: boolean;
  index: number;
  secure?: boolean;
};

const SingleInput: React.FC<SingleInputProps> = ({
  value,
  autoFocus,
  onInputFocus,
  index,
  focus,
  secure = false,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const mounted = useRef<boolean>(false);

  useEffect(() => {
    if (autoFocus && focus) {
      inputRef.current?.focus();
    }
  });

  useEffect(() => {
    if (mounted.current && focus) {
      inputRef.current?.focus();
    }
    mounted.current = true;
  }, [focus]);

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) =>
    onInputFocus(index, e);

  let inputType = "text";

  if (secure) inputType = "password";
  return (
    <input
      ref={inputRef}
      className="w-10 h-10 xs:w-12 xs:h-12 border text-xl font-semibold select-none text-gray-700 placeholder-gray-500 bg-white rounded-md text-center focus:border-pink-400  focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-pink-300"
      onFocus={handleInputFocus}
      value={value || ""}
      type={"password"}
      maxLength={1}
      {...props}
    />
  );
};

export default OtpInput;
