import { cn } from "@/shared/functions/utils";

export const StatusRings = ({
  count,
  className,
}: {
  count: number;
  className?: string;
}) => (
  <div
    className={cn(
      "bg-black flex items-center space-x-1 justify-center py-1",
      className
    )}
  >
    {Array(9)
      .fill(null)
      .map((_, i) => (
        <div
          key={`uint-${i}`}
          className={cn(
            "w-5 h-5 rounded-full flex font-semibold justify-center items-center",
            i < count ? " bg-green-400" : "text-gray-400"
          )}
        >
          {i + 1}
        </div>
      ))}
  </div>
);
