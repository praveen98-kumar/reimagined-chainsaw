import { Search } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "./ui/button";

export function SearchButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <div className="flex items-center justify-center w-full">
      <Button
        {...props}
        size={"lg"}
        className={cn(
          "text-white bg-linear-to-b from-[#006FD1] to-[#68BDFF] text-sm w-1/2",
          className,
        )}
      >
        <Search />
        Search
      </Button>
    </div>
  );
}
