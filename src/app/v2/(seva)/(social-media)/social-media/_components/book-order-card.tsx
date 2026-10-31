import Image from "next/image";
import { cn } from "@/utils/cn";

type BookOrderCardProps = {
  type: string;
  mode: string;
  createdOn: string;
  name: string;
  phone: string;
  address: readonly string[];
  book: string;
  imgSrc: string;
  onEdit?: () => void; // 👈 add this
};

export function BookOrderCard({
  type,
  mode,
  createdOn,
  name,
  phone,
  address,
  book,
  imgSrc,
  onEdit, // 👈 ADD THIS
}: BookOrderCardProps) {
  const gradients: Record<string, string> = {
    national_regular: "from-[#0B2E7A] to-[#2E6CF6]",
    national_emergency: "from-[#6B0000] to-[#E02020]",
    international_regular: "from-[#004E4E] to-[#00C9B7]",
  };

  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-lg overflow-hidden",
        `bg-linear-to-r ${gradients[type]}`,
      )}
    >
      {/* Header */}
      <div
        className={cn("px-4 py-1 text-white flex justify-between items-center")}
      >
        <div>
          <p className="text-[15px] capitalize font-semibold">
            {type.replace("_", " - ")}
          </p>
          <p className="text-[10px] leading-3 opacity-90">
            Created On: {createdOn.replace("T", " ")}
          </p>
        </div>

        <Image
          src="/icons/v2/edit.svg"
          alt="Edit"
          width={20}
          height={20}
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.();
          }}
          className="cursor-pointer hover:scale-110 transition"
        />
      </div>

      {/* Body */}
      <div className="px-4 py-2 flex rounded-2xl bg-white gap-2">
        <div className="flex-1">
          <p className="font-medium text-lg text-slate-800">{name}</p>
          <p className="text-[15px] text-slate-700">{phone}</p>

          {address.map((line) => (
            <p key={line} className="text-sm text-slate-500">
              {line}
            </p>
          ))}

          <p className="text-sm text-slate-500 mt-2">{book}</p>
        </div>

        <div className="relative w-24 h-32 rounded-xl flex items-center justify-center overflow-hidden">
          <div className="relative w-25 h-30">
            <Image src={imgSrc} alt="Book" fill className="object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
}
