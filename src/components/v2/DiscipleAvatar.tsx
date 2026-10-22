import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "./ui/avatar";

interface Props {
  name: string;
  image?: string;
  className?: string;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((s) => s.charAt(0).toUpperCase())
    .join("");
};

export function DiscipleAvatar({ name, image, className }: Props) {
  return (
    <Avatar className={className ?? "w-14 h-14 border-green-600 border-8"}>
      <AvatarImage
        src={
          image ??
          "https://res.cloudinary.com/dwzdwuh4t/image/upload/e_improve,w_300,h_600,c_thumb,g_auto/v1768835270/background_d2la5n.png"
        }
        alt="@shadcn"
      />
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
      <AvatarBadge
        style={{ width: "12px", height: "12px" }}
        className="bg-slate-900 text-[11px] ring-5 ring-slate-900 font-bold -bottom-1.5 -right-1.5"
      >
        01
      </AvatarBadge>
    </Avatar>
  );
}
