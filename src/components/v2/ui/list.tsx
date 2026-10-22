"use client";

import React, { memo, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { cn } from "@/utils/cn";

const DEFAULT_KEY_EXTRACTOR = <T,>(_item: T, index: number): number => index;

interface ListProps<T> extends React.ComponentProps<"div"> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor?: (item: T, index: number) => string | number;
}

const ListInner = <T,>({
  items,
  renderItem,
  keyExtractor = DEFAULT_KEY_EXTRACTOR,
  className,
  ...rest
}: ListProps<T>) => {
  if (items.length === 0) return null;

  return (
    <div className={className} {...rest}>
      {items.map((item, index) => (
        <React.Fragment key={keyExtractor(item, index)}>
          {renderItem(item, index)}
        </React.Fragment>
      ))}
    </div>
  );
};

export const List = memo(
  ListInner,
  (prev, next) =>
    prev.items === next.items && prev.className === next.className,
) as unknown as <T>(props: ListProps<T>) => React.ReactElement | null;

interface PaginatedListProps<T> extends ListProps<T> {
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  intersectionOptions?: IntersectionObserverInit;
  disabled?: boolean;
  renderEndOfList?: () => React.ReactNode;
}

const PaginatedListInner = <T,>({
  items,
  renderItem,
  keyExtractor = DEFAULT_KEY_EXTRACTOR,
  className,
  isFetchingNextPage = false,
  fetchNextPage,
  hasNextPage = false,
  intersectionOptions = {},
  disabled = false,
  renderEndOfList,
  ...rest
}: PaginatedListProps<T>) => {
  const { ref: sentinelRef, inView } = useInView({
    threshold: intersectionOptions?.threshold ?? 1.0,
    rootMargin: intersectionOptions?.rootMargin,
    triggerOnce: false,
  });

  const fetchNextPageRef = useRef(fetchNextPage);
  fetchNextPageRef.current = fetchNextPage;

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && !disabled) {
      fetchNextPageRef.current?.();
    }
  }, [inView, hasNextPage, isFetchingNextPage, disabled]);

  return (
    <div className={cn("space-y-4", className)} {...rest}>
      {items.map((item, index) => (
        <React.Fragment key={keyExtractor(item, index)}>
          {renderItem(item, index)}
        </React.Fragment>
      ))}
      <div ref={sentinelRef}>
        {isFetchingNextPage && <LoadingSpinner className="mx-auto w-8 h-8" />}
      </div>
      {!hasNextPage && items?.length > 0 && renderEndOfList?.()}
    </div>
  );
};

export const PaginatedList = memo(
  PaginatedListInner,
  (prev, next) =>
    prev.items === next.items &&
    prev.hasNextPage === next.hasNextPage &&
    prev.isFetchingNextPage === next.isFetchingNextPage &&
    prev.disabled === next.disabled &&
    prev.className === next.className,
) as unknown as <T>(props: PaginatedListProps<T>) => React.ReactElement;
