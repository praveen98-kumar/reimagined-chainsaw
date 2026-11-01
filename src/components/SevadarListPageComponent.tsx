import { isRoleBelow, regionHirarchyMap } from "@/constants/app";
import { useUsersWithRoleListQuery } from "@/hooks/useUsersWithRole";
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import DiscipleCard from "@/components/card/DiscipleCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { RoleRegionFilter } from "@/components/RoleRegionFilter";
import { useGetRoles } from "@/http/role";
import { useAppSelector } from "@/redux/store";
import { getOptionArray } from "@/shared/functions/utils";

type RoleRegion = keyof typeof regionHirarchyMap;

export const SevadarListPageComponent = ({ group }: { group: string }) => {
  const loadingRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const { fetchNextPage, refetch, data, isFetching } =
    useUsersWithRoleListQuery(filters);
  const userList = data?.pages.flatMap((p) => p.data);

  useEffect(() => {
    if (!loadingRef.current || isFetching || !filters.role_id) {
      return;
    }
    const observer = new IntersectionObserver(
      (e) => {
        if (e[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 },
    );
    observer.observe(loadingRef.current);

    return () => {
      observer.disconnect();
    };
  }, [filters, fetchNextPage, isFetching]);

  return (
    <div className="flex flex-col gap-4">
      <SevadarListFilter
        group={group}
        setFilters={setFilters}
        isLoading={isFetching}
        onSubmit={() => {
          setTimeout(() => refetch(), 100);
        }}
      />
      <div className="space-y-4">
        {userList?.map((user) => (
          <DiscipleCard
            key={user.id}
            disciple={{
              ...user,
              avatar: "",
              status: "",
            }}
          />
        ))}
      </div>
      <div ref={loadingRef}>
        {isFetching && <LoadingSpinner className={"mx-auto w-8 h-8"} />}
      </div>
    </div>
  );
};

type SevadarListFilterProps = {
  group: string;
  isLoading?: boolean;
  setFilters: Dispatch<SetStateAction<Record<string, unknown>>>;
  onSubmit?: (data: Record<string, unknown>) => void;
};

export const SevadarListFilter = ({
  group,
  setFilters,
  onSubmit,
  isLoading,
}: SevadarListFilterProps) => {
  const { data: roles } = useGetRoles();
  const { active_permission, active_region_index } = useAppSelector(
    (s) => s.auth,
  );

  const activeRoleRegion = active_permission?.role_region as RoleRegion;
  const currentRole = roles?.find((r) => r.id === active_permission?.role_id);
  const activeRegion = active_permission?.region[active_region_index];
  const roleOptions = useMemo(() => {
    if (roles) {
      const visibleRoles = roles.filter(
        (r) =>
          r.group === group && isRoleBelow(r, activeRoleRegion, currentRole),
      );
      return getOptionArray(visibleRoles, "name", "id", true).map((o) =>
        Object.assign(o, {
          hierarchy: regionHirarchyMap[o.region as RoleRegion],
        }),
      );
    }
    return [];
  }, [roles, group, activeRoleRegion, currentRole]);

  return (
    <div>
      <RoleRegionFilter
        roles={roleOptions}
        creatorRoleRegion={activeRoleRegion}
        submitBtnLabel="Search"
        isLoading={isLoading}
        onSubmit={(v) => {
          const { role_id, region, ...rest } = v;
          const regionIdKey = `${region}_id`;
          // @ts-expect-error
          const regionValue = rest?.[regionIdKey];
          const newFilter = { role_id, [regionIdKey]: regionValue };
          setFilters(newFilter);
          onSubmit?.(newFilter);
        }}
        formValues={{
          country_id: activeRegion?.country_id,
          state_id: activeRegion?.state_id,
          division_id: activeRegion?.division_id,
          district_id: activeRegion?.district_id,
          tehsil_id: activeRegion?.tehsil_id,
        }}
      />
    </div>
  );
};
