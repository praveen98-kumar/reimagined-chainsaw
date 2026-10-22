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
      className={`flex px-3 py-2 z-20 fixed bg-black top-0 left-0 w-full right-0 items-center shadow-lg justify-${
        isBack ? "center h-[75px]" : "between"
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
            <span className="text-xl leading-snug">
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
