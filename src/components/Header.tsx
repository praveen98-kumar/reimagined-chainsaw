import { Menu } from "lucide-react";
import { RiSearchLine, RiMenuFill } from "react-icons/ri";
import { useRouter } from "next/router";
import { HiOutlineChevronLeft } from "react-icons/hi";
import React from "react";
import { useAppSelector } from "@/redux/store";
import { capitalizeWords, cn } from "@/shared/functions/utils";
import useLocalStorage from "@/hooks/useLocalstorage";
import useAuthSync from "@/hooks/useAuthSync";
import useScrolled from "@/hooks/useScrolled";

export interface HeaderProps {
  isBack?: boolean;
  isAuth?: boolean;
  heading?: string;
  setShow?: React.Dispatch<React.SetStateAction<boolean>>;
  rightIcon?: React.ReactNode;
  variant?: "classic" | "new";
}

const getNameByRegion = (region: string) => {
  switch (region) {
    case "tehsil":
      return "tehsil_name";
    case "division":
      return "division_name";
    case "district":
      return "district_name";
    case "state":
      return "state_name";
    case "country":
    case "ashram":
      return "country_name";
    default:
      return "tehsil_name";
  }
};

const Header: React.FC<HeaderProps> = ({
  isBack = false,
  heading,
  setShow,
  isAuth = false,
  rightIcon,
  variant = "classic",
}) => {
  const router = useRouter();

  const headerRef = React.useRef<HTMLElement>(null);
  const scrolled = useScrolled(headerRef);
  useAuthSync();
  const { all_permission, active_permission, active_region_index } =
    useAppSelector((state) => state.auth);
  const [otherUser] = useLocalStorage("other_user", null);

  const roleRegion = active_permission?.role_region || "tehsil";
  const locationName =
    active_permission?.role_region === "ashram"
      ? active_permission?.role.toString().replace(/_/g, " ")
      : active_permission?.region[active_region_index][
          getNameByRegion(roleRegion)
        ];
  const roleLabel =
    active_permission?.role === "ashram_sevadar"
      ? "Ashram Sevadar"
      : all_permission && all_permission.group
        ? capitalizeWords(
            all_permission.group.replace(/_/g, " ").replace("Admin", ""),
          )
        : "Sevadar";

  if (variant === "new" && !isBack) {
    return (
      <div className={cn("fixed z-20 h-18.75 flex items-center w-full justify-center px-4 transition-[background-color,box-shadow,border-color] duration-200",
      scrolled
          ? "border-b border-black/5 bg-white/80 shadow-sm backdrop-blur-md supports-backdrop-filter:bg-white/70"
          : "border-b border-transparent bg-transparent")}
      >
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => (setShow ? setShow(true) : {})}
          className="absolute left-4 flex size-11 items-center justify-center rounded-full bg-white text-brand-ink shadow-[0_8px_20px_-6px_rgba(76,29,149,0.35)]"
        >
          <Menu className="size-5" />
        </button>
        <div className="flex flex-col items-center gap-1">
          <p className="font-serif text-[26px] leading-none font-bold text-brand-title">
            Satlok Ashram
          </p>
          <span className="rounded-full bg-white/70 px-3 py-0.5 text-sm font-semibold text-brand-title">
            {roleLabel}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex px-3 py-2 z-20 fixed bg-black top-0 left-0 w-full right-0 items-center shadow-lg justify-${
        isBack ? "center h-18.75" : "between"
      } bg-primary`}
    >
      {isBack ? (
        <>
          {!isAuth ? (
            <HiOutlineChevronLeft
              onClick={() => router.back()}
              color="white"
              className="w-6 h-6 cursor-pointer absolute left-2"
            />
          ) : null}
          <div className="w-full h-full flex justify-center items-center flex-col text-center -space-y-1">
            <p className="text-xl text-white capitalize">{heading}</p>
            {!otherUser && locationName && (
              <p className="text-slate-400 tracking-wider uppercase font-semibold">
                {locationName}{" "}
                {active_permission?.role_region !== "ashram"
                  ? all_permission?.group
                  : ""}
              </p>
            )}
          </div>
          {rightIcon && rightIcon}
        </>
      ) : (
        <>
          <RiMenuFill
            onClick={() => (setShow ? setShow(true) : {})}
            color="white"
            className="w-6 h-6 cursor-pointer"
          />

          <div className="text-center text-white font-normal">
            <p className="text-2xl">Satlok Ashram</p>
            <span className="text-xl leading-snug">{roleLabel}</span>
          </div>

          <RiSearchLine
            color="white"
            className="w-6 h-6 cursor-pointer"
            style={{ visibility: "hidden" }}
          />
        </>
      )}
    </div>
  );
};

export default Header;
