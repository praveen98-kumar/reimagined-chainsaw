import { useRouter } from "next/router";
import React, { useCallback, useMemo, useState } from "react";
import Button from "@/components/Button";
import Modal from "@/components/modal/Modal";
import {
  setActivePermission,
  setActiveRegion,
  setActiveRegionIndex,
} from "@/redux/features/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { getRegionIndex, isSameRegion } from "@/shared/functions/seva-region";
import type { Region } from "@/shared/interfaces/user";
import useValidUser from "../../hooks/useValidUser";

export interface SevaCardProps {
  Icon: React.ReactNode;
  title?: string;
  subtitle?: string;
  href?: string;
  permission: string | string[];
  showSubTitle?: boolean;
  changePermission?: boolean;
  regions?: Array<Region>;
  onClick?: () => void;
}

const SevaCard: React.FC<SevaCardProps> = React.forwardRef(
  (
    {
      Icon,
      title,
      subtitle,
      href,
      permission,
      showSubTitle = true,
      changePermission = false,
      regions,
      onClick,
    },
    ref: React.ForwardedRef<HTMLDivElement>,
  ) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user, all_permission } = useAppSelector((state) => state.auth);
    const hasPermission = useValidUser(permission);
    if (!hasPermission) {
      return null;
    }
    // const { t } = useTranslation("home");
    return (
      <div
        ref={ref}
        className="bg-white flex flex-col items-center justify-start space-y-1 rounded-lg border border-gray-400 drop-shadow-lg cursor-pointer px-2 py-3"
        onClick={
          onClick
            ? () => onClick()
            : () => {
                if (changePermission && user && !regions) {
                  const item = user.permission.filter((p) => {
                    if (Array.isArray(permission)) {
                      return (
                        all_permission.roles.includes(p.role_id) &&
                        p.permissions.some((p1) => permission.includes(p1))
                      );
                    } else {
                      return (
                        all_permission.roles.includes(p.role_id) &&
                        p.permissions.includes(permission)
                      );
                    }
                  });
                  const activePermission = item[0] ?? null;
                  dispatch(setActiveRegionIndex(0));
                  dispatch(setActivePermission(activePermission));
                  dispatch(
                    setActiveRegion(activePermission?.region?.[0] ?? null),
                  );
                }
                href && router.push(href, undefined, { locale: router.locale });
              }
        }
      >
        {Icon}
        <p className="text-center leading-snug text-primary font-medium text-md">
          {title}
        </p>
        <p
          className={`text-center text-sm leading-snug font-medium text-gray-500 ${
            showSubTitle ? "" : "hidden"
          }`}
        >
          {subtitle}
        </p>
      </div>
    );
  },
);

export const SevaCardWithMenu = ({
  regions,
  href,
  ...props
}: SevaCardProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [show, setShow] = useState(false);
  const { user, all_permission, active_permission } = useAppSelector(
    (state) => state.auth,
  );
  const hasPermission = useValidUser(props.permission);
  const navigate = (region?: Region) => {
    if (props.changePermission && user) {
      const items = user.permission.filter((p) => {
        if (Array.isArray(props.permission)) {
          return (
            all_permission.roles.includes(p.role_id) &&
            p.permissions.some((p1) => props.permission.includes(p1))
          );
        } else {
          return (
            all_permission.roles.includes(p.role_id) &&
            p.permissions.includes(props.permission)
          );
        }
      });

      const permission = region
        ? (items.find((item) =>
            item.region?.some((itemRegion) =>
              isSameRegion(itemRegion, region, item.role_region),
            ),
          ) ?? items[0])
        : items[0];

      dispatch(setActivePermission(permission ?? null));

      if (permission) {
        dispatch(setActiveRegionIndex(getRegionIndex(permission, region)));
        if (region) {
          dispatch(setActiveRegion(region));
        }
      }
    }
    href && router.push(href, undefined, { locale: router.locale });
  };
  const getUniqueKey = useCallback((region: Region): string => {
    const keys = [
      "tehsil_id",
      "district_id",
      "division_id",
      "city_id",
      "state_id",
      "country_id",
    ];
    for (const key of keys) {
      const value = region[key as keyof Region];
      if (value !== undefined && value !== null && value !== "") {
        return `${key}:${value}`;
      }
    }
    return JSON.stringify(region);
  }, []);

  const uniqueRegion = useMemo(() => {
    const seen = new Set();
    return regions?.filter(
      (o) => !seen.has(getUniqueKey(o)) && seen.add(getUniqueKey(o)),
    );
  }, [regions, getUniqueKey]);

  if (!hasPermission) {
    return null;
  }
  return (
    <>
      <SevaCard {...props} onClick={() => setShow(true)} />
      <Modal
        show={show}
        onClose={() => setShow(false)}
        onConfirm={() => {}}
        isAshirwad
        withCloseHandler={false}
        modalClasses="max-h-[40%]"
      >
        <div className="mb-8 w-full flex flex-col items-center gap-4 justify-center">
          {uniqueRegion?.map((region, index) => {
            const nameArray = [
              region.tehsil_name,
              region.district_name,
              region.division_name,
              region.city_name,
              region.state_name,
              region.country_name,
            ];
            if (active_permission?.role_id == 55) {
              nameArray.splice(0, 1);
            }
            const locationName =
              nameArray.find((n) => n !== "" && n !== null) ??
              region.country_name;
            return (
              <Button
                type="button"
                variant="primary-reverse"
                className="rounded-full w-full max-w-sm"
                key={`region_index_${index.toString()}`}
                onClick={() => {
                  navigate(region);
                }}
              >
                {locationName}
              </Button>
            );
          })}
        </div>
      </Modal>
    </>
  );
};

export default SevaCard;
