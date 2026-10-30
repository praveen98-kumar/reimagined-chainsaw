import { RiSearchLine, RiMenuFill } from "react-icons/ri";
import { useRouter } from "next/router";
import { HiOutlineChevronLeft } from "react-icons/hi";
import React from "react";
import { useAppSelector } from "@/redux/store";
import { capitalizeWords } from "@/shared/functions/utils";
import useLocalStorage from "@/hooks/useLocalstorage";
import useAuthSync from "@/hooks/useAuthSync";

export interface HeaderProps {
  isBack?: boolean;
  isAuth?: boolean;
  heading?: string;
  setShow?: React.Dispatch<React.SetStateAction<boolean>>;
  rightIcon?: React.ReactNode;
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
}) => {
  const router = useRouter();
  useAuthSync();
  const { all_permission, active_permission, active_region_index } =
    useAppSelector((state) => state.auth);
  const [otherUser] = useLocalStorage("other_user", null);

  const roleRegion = active_permission?.role_region || "tehsil";
  const locationName =
    active_permission?.role.toString().replace(/_/g, " ") || "";
  // const locationName =
  //   active_permission?.role_region === "ashram"
  //     ? active_permission?.role.toString().replace(/_/g, " ")
  //     : active_permission?.region[active_region_index][
  //         getNameByRegion(roleRegion)
  //       ];
  return (
    <div
      className={`flex px-3 py-2 z-20 fixed top-0 left-0 w-full right-0 items-center ${
        isBack
          ? "justify-center h-[75px] bg-black bg-primary shadow-lg"
          : "justify-between bg-[#fffaf0] border-b border-orange-200 shadow-[0_4px_16px_rgba(154,52,18,0.10)]"
      }`}
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
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => (setShow ? setShow(true) : {})}
            className="flex size-10 items-center justify-center rounded-full bg-orange-100 text-[#9a3412] hover:bg-orange-200"
          >
            <RiMenuFill className="size-6" />
          </button>

          <div className="text-center font-normal">
            <p className="text-2xl font-bold text-[#431407]">Satlok Ashram</p>
            <span className="text-lg font-medium leading-snug text-[#9a3412]">
              {active_permission?.role === "ashram_sevadar"
                ? "Ashram Sevadar"
                : all_permission && all_permission.group
                  ? capitalizeWords(
                      all_permission.group
                        .replace(/_/g, " ")
                        .replace("Admin", ""),
                    )
                  : "Sevadar"}
            </span>
          </div>

          <RiSearchLine
            className="size-10 cursor-pointer p-2"
            style={{ visibility: "hidden" }}
          />
        </>
      )}
    </div>
  );
};

export default Header;
