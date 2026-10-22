import Image from "next/image";
import React, { useMemo } from "react";

const DEFAULT_IMG = "/assets/images/avatar.webp";
interface AvatarProp {
  src?: string;
  showLabel?: boolean;
  label?: string;
  containerSize?: string;
}

const Avatar: React.FC<AvatarProp> = ({
  showLabel = true,
  label = "active",
  src = DEFAULT_IMG,
  containerSize,
}) => {
  const borderColor = useMemo(() => {
    if (label == "banned" || label == "deleted") {
      return "ring-red-500";
    } else if (label == "hold") {
      return "ring-yellow-500";
    } else return "ring-green-500";
  }, [label]);
  const bgColor = useMemo(() => {
    if (label == "banned" || label == "deleted") {
      return "red";
    } else if (label == "hold") {
      return "yellow";
    } else return "green";
  }, [label]);
  return (
    <div className="flex flex-col items-center mx-2 justify-center">
      <div
        className={`${
          containerSize ?? "h-14 w-14"
        } relative rounded-full overflow-hidden ring-4 ${borderColor}`}
      >
        <Image
          className="h-full w-full"
          src={src || DEFAULT_IMG}
          width={100}
          height={100}
          alt="userImage"
          unoptimized
          priority
        />
      </div>
      {showLabel && (
        <span
          className={`capitalize leading-none text-sm mt-2 font-semibold p-1 rounded shadow-md bg-${bgColor}-600 text-white text-center`}
        >
          {label}
        </span>
      )}
    </div>
  );
};

export default Avatar;
