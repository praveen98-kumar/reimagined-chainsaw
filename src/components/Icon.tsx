import Image, { ImageProps } from "next/image";
import React from "react";

const Icon = ({
  containerClass,
  ...props
}: React.ComponentProps<"img"> & { containerClass?: string }) => {
  return (
    <div className={`relative  ${containerClass ?? "w-7 h-7"}`}>
      <img
        {...props}
        className={`absolute ${props.className && props.className}`}
        // layout="fill"
      />
    </div>
  );
};
export default Icon;
