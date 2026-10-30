"use client";

import { useQueryClient } from "@tanstack/react-query";
import { memo, useCallback, useMemo, useState } from "react";
import { PaginatedList } from "@/components/v2/ui/list";
import { Separator } from "@/components/v2/ui/separator";
import { useGetDisciplesWithRole } from "@/query-options/queries/get-disciples";
import { useAppSelector } from "@/redux/store";
import { getInitialValues, objectWithValues } from "@/shared/functions/utils";
import { useFilters, useActiveTab } from "@/store/useFilterStore";

import { AllotSevadarCard } from "./allot-sevadar-card";
import { ManageSMSevadarFilters } from "./manage-sevadar-filters";
import { TransferResults } from "./transfer-results";
import { type AuthContext, canCheck } from "@/components/v2/Can";
import { SEVA_PAGE_CONFIG } from "@/constants/roles";
import { useLocationChange } from "@/hooks/useActiveLocationContext";
import { useEnsureActiveContext } from "@/hooks/useEnsureActiveContext";

const MemoizedSevadarCard = memo(AllotSevadarCard);

export function AllotSevadarPageComponent() {
  useEnsureActiveContext(SEVA_PAGE_CONFIG.manageSevadar);
  const queryClient = useQueryClient();
  const filters = useFilters();
  const activeTab = useActiveTab();
  const [hasSearched, setHasSearched] = useState(false);
  const active_region_index = useAppSelector((s) => s.auth.active_region_index);
  const active_permission = useAppSelector((s) => s.auth.active_permission);
  const active_region = useAppSelector((s) => s.auth.active_region);

  const auth: AuthContext = useAppSelector((state) => state.auth);

  const bookOrderMatch = useMemo(
    () =>
      canCheck(auth, {
        sevaType: "book_order",
        permissions: "book_order_seva",
      }) !== null,
    [auth],
  );

  const socialMediaMatch = useMemo(
    () =>
      canCheck(auth, {
        sevaType: "social_media",
        permissions: "social_media_seva",
      }) !== null,
    [auth],
  );

  const groupList = useMemo(() => {
    const groups: string[] = [];
    if (bookOrderMatch) groups.push("book_order");
    if (socialMediaMatch) groups.push("social_media");
    return groups.length > 0 ? groups.join(",") : undefined;
  }, [bookOrderMatch, socialMediaMatch]);

  const userSevaLocation = useMemo(
    () =>
      getInitialValues(active_permission, active_region_index, active_region),
    [active_permission, active_region_index, active_region],
  );

  const enhancedFilters = useMemo(() => {
    return { group_list: groupList, ...filters, ...userSevaLocation };
  }, [groupList, filters, userSevaLocation]);

  const discipleParams = useMemo(
    () => objectWithValues(enhancedFilters),
    [enhancedFilters],
  );

  const {
    data: disciples,
    fetchNextPage: fetchNextDisciplePage,
    hasNextPage: hasNextDisciplePage,
    isFetchingNextPage,
    refetch: refetchDisciples,
  } = useGetDisciplesWithRole(discipleParams, {
    enabled: false,
  });

  const handleSearch = useCallback(() => {
    setHasSearched(true);
    queryClient.removeQueries({ queryKey: ["disciples_with_role"] });
    refetchDisciples();
  }, [queryClient, refetchDisciples]);

  useLocationChange(() => {
    if (hasSearched) handleSearch();
  });

  const handleCardSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["disciples_with_role"] });
  }, [queryClient]);

  const discipleItems = useMemo(
    () => disciples?.pages.flatMap((page) => page.data) ?? [],
    [disciples],
  );

  const renderDiscipleItem = useCallback(
    (item: (typeof discipleItems)[number]) => {
      return <MemoizedSevadarCard user={item} onSuccess={handleCardSuccess} />;
    },
    [handleCardSuccess],
  );

  return (
    <div className="p-4 space-y-4">
      <ManageSMSevadarFilters onSearch={handleSearch} />

      <Separator className="bg-gray-400" />

      {activeTab === "transfer" ? (
        <TransferResults items={discipleItems} />
      ) : (
        <PaginatedList
          items={discipleItems}
          keyExtractor={(item) => item.disciple_id}
          renderItem={renderDiscipleItem}
          fetchNextPage={fetchNextDisciplePage}
          hasNextPage={hasNextDisciplePage}
          isFetchingNextPage={isFetchingNextPage}
        />
      )}
    </div>
  );
}
