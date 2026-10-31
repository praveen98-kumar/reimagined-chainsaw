import { cn } from "@/shared/functions/utils";
import FormErrorMessage from "./input/FormErrorMessage";

export const SMILEY_OPTIONS: Array<{ value: number; emoji: string }> = [
  { value: 1, emoji: "😡" },
  { value: 2, emoji: "🙁" },
  { value: 3, emoji: "😐" },
  { value: 4, emoji: "🙂" },
  { value: 5, emoji: "😄" },
];

interface SmileyRatingProps {
  rating: number;
  onClick?: (val: number) => void;
  errorText?: string;
  className?: string;
  labels?: Record<number, string>;
}

export const SmileyRating = ({
  rating,
  onClick,
  errorText,
  className,
  labels,
}: SmileyRatingProps) => {
  const selectedLabel = rating ? labels?.[rating] : undefined;

  return (
    <div>
      <div className="flex justify-center flex-row gap-3">
        {SMILEY_OPTIONS.map(({ value, emoji }) => (
          <button
            key={value}
            type="button"
            onClick={() => onClick?.(value)}
            aria-label={labels?.[value] ?? String(value)}
            className={cn(
              "text-3xl leading-none p-1 rounded-full transition-all",
              rating === value
                ? "scale-125"
                : "opacity-40 grayscale hover:opacity-80 hover:grayscale-0",
              className,
            )}
          >
            {emoji}
          </button>
        ))}
      </div>
      {selectedLabel ? (
        <p className="text-center font-semibold mt-1">{selectedLabel}</p>
      ) : null}
      {errorText ? <FormErrorMessage>{errorText}</FormErrorMessage> : null}
    </div>
  );
};
