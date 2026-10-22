import React, { useState } from "react";
const UPPER_A_KEYCODE = 65;
const LOWER_Z_KEYCODE = 122;
// const UPPER_Z_KEYCODE = 90;
const ZERO_KEYCODE = 48;
const NINE_KEYCODE = 57;
interface Props {
  value: string;
  otpLength: number;
  onChange: (e: any) => void;
  autoFocus: boolean;
  otpType?: "number" | "alpha" | "alphanumeric" | "any";
}
const useOtp = ({
  value,
  onChange,
  otpLength,
  autoFocus,
  otpType = "number",
}: Props) => {
  const [activeInput, setActiveInput] = useState(autoFocus ? 0 : -1);
  const getOtpValue = () => (value ? value.toString().split("") : []);

  const handleOtpChange = (otp: string[]) => {
    let otpValue = otp.join("");

    onChange(otpValue);
  };

  const focusInput = (input: number) => {
    const nextActiveInput = Math.max(Math.min(otpLength - 1, input), 0);
    setActiveInput(nextActiveInput);
  };

  const fouctInputByDirection = (dir: string = "next") => {
    focusInput(dir == "next" ? activeInput + 1 : activeInput - 1);
  };

  const changeActiveInputValue = (nextValue: string) => {
    const otp = getOtpValue();
    otp[activeInput] = nextValue;
    handleOtpChange(otp);
  };

  const handleOnInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length > 1) {
      e.preventDefault();
      fouctInputByDirection("next");
    }
  };
  const isValidChar = (char: string) => {
    switch (otpType) {
      case "number":
        return !(
          char.charCodeAt(0) > NINE_KEYCODE || char.charCodeAt(0) < ZERO_KEYCODE
        );
      case "alpha":
        return !(
          char.charCodeAt(0) > LOWER_Z_KEYCODE ||
          char.charCodeAt(0) < UPPER_A_KEYCODE
        );
      case "alphanumeric":
        return !(
          char.charCodeAt(0) > LOWER_Z_KEYCODE ||
          char.charCodeAt(0) < ZERO_KEYCODE
        );
      default:
        break;
    }
  };
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isValidChar(e.target.value)) {
      changeActiveInputValue(e.target.value);
      fouctInputByDirection("next");
    }
  };

  const handleOnKeydown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "Backspace":
        e.preventDefault();
        changeActiveInputValue("");
        fouctInputByDirection("prev");
        break;
      case "Delete":
        e.preventDefault();
        changeActiveInputValue("");
        break;
      case "ArrowLeft":
        e.preventDefault();
        fouctInputByDirection("prev");
        break;
      case "ArrowRight":
        e.preventDefault();
        fouctInputByDirection("next");
        break;
      default:
        break;
    }
  };

  const onInputFocus = (
    index: number,
    e: React.FocusEvent<HTMLInputElement>
  ) => {
    setActiveInput(index);
    e.target.select();
  };

  return {
    activeInput,
    getOtpValue,
    handleOtpChange,
    handleOnInput,
    handleOnChange,
    handleOnKeydown,
    onInputFocus,
  };
};

export default useOtp;
