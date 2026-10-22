import { cn } from "@/shared/functions/utils";
import { useState } from "react";
import { FaRegStar, FaStar } from "react-icons/fa";
import FormErrorMessage from "./input/FormErrorMessage";

interface RatingComponentProps {
  rating: number;
  onClick?: (val: number) => void;
  errorText?: string;
  className?: string;
}

export const RatingComponent = ({
  rating,
  onClick,
  errorText,
  className,
}: RatingComponentProps) => {
  const [hover, setHover] = useState(0);
  return (
    <div>
      <div className="flex justify-center flex-row gap-4">
        {Array.from({ length: 5 }, (_, index) => (
          <button
            className="h-8 w-8 bg-transparent"
            key={index}
            type="button"
            onMouseEnter={() => setHover(index + 1)}
            onClick={() => onClick?.(index + 1)}
            onMouseLeave={() => setHover(rating)}
          >
            {(rating || hover) >= index + 1 ? (
              <FaStar className={cn("w-8 h-8 text-amber-500", className)} />
            ) : (
              <FaRegStar className={cn("w-8 h-8 text-gray-500", className)} />
            )}
          </button>
        ))}
      </div>
      {errorText ? <FormErrorMessage>{errorText}</FormErrorMessage> : null}
    </div>
  );
};
