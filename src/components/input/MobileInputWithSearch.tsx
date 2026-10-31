import { FaSearch } from "react-icons/fa";
import LoadingSpinner from "../LoadingSpinner";
import TextInput, { type TextInputProps } from "./TextInput";

export function MobileInputWithSearch({
  isLoading: loading = false,
  ...props
}: TextInputProps & {
  isLoading?: boolean;
}) {
  return (
    <TextInput
      appendEle={
        <div
          style={{
            marginLeft: "1px",
          }}
          className="absolute bg-gray-200 rounded p-2 font-semibold text-gray-800 -translate-y-1/2 pointer-events-none top-1/2 left-0"
        >
          +91
        </div>
      }
      disabled={loading}
      className="pl-12 pr-1 py-1"
      label={"Mobile No."}
      prependEle={
        <div className="flex absolute space-x-1 items-center -translate-y-1/2 top-1/2 right-0 gap-2">
          <button
            type="submit"
            disabled={loading}
            className="p-2 rounded-md bg-black flex items-center gap-1 disabled:opacity-80"
          >
            {loading ? (
              <LoadingSpinner className="w-5 h-5 fill-white" />
            ) : (
              <FaSearch className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      }
      type={"tel"}
      maxLength={10}
      {...props}
    />
  );
}
