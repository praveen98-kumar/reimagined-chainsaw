import React, { useCallback, useState, useEffect } from "react";
import apiClient from "@/http/index";
import { Tab } from "@/shared/interfaces/app";

interface Error {
  message: string;
}

const useInfiniteQuery = (
  tabs: Tab[],
  setTabs: React.Dispatch<React.SetStateAction<any[]>>,
  activeIndex: number = 0,
  loadingRef: React.RefObject<any>,
  params: object = {},
  callback?: (data?: any) => void,
  dependency?: any[],
  fetchOnLoad: boolean = false
) => {
  const [data, setData] = useState<Array<any[]>>([]);
  const [page, setPage] = useState<number>(tabs[activeIndex].page);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const flatternData = data?.flat();

  const fetchMore = useCallback(
    async (page_no: number = 1, payload: Record<string, any> = params) => {
      if (page_no == 1 || tabs[activeIndex].hasNext) {
        setLoading(true);
        try {
          const { data } = await apiClient.get(tabs[activeIndex].query, {
            params: {
              ...payload,
              page: page_no,
            },
          });
          const tempData = data?.data.result || data?.data.disciples;
          // @ts-ignore
          setData((prev: any) => [...prev, tempData]);
          // @ts-ignore
          const hNext = data?.data?.total > 10 * page_no;
          const tempTab = [...tabs].map((t, i) =>
            i === activeIndex ? { ...t, page: t.page + 1, hasNext: hNext } : t
          );
          setTabs(tempTab);
          setPage(page_no + 1);
          callback
            ? callback(page_no == 1 ? tempData : [...flatternData, ...tempData])
            : () => {};
          setError(null);
          setLoading(false);
        } catch (error: any) {
          console.error(error);
          setError({
            message: error?.response?.data?.error ?? "Error Occurred ",
          });
          setPage(1);
          setData([]);
          setLoading(false);
        }
      }
    },
    [page, ...(dependency ? dependency : [])]
  );

  useEffect(() => {
    if (fetchOnLoad) {
      fetchMore(1, params);
    }
  }, [fetchMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && page > 1) {
          fetchMore(page);
        }
      },
      { threshold: 1, rootMargin: "100px" }
    );

    if (loadingRef.current) observer.observe(loadingRef.current);
    return () => {
      if (loadingRef.current) observer.unobserve(loadingRef.current);
    };
  }, [loadingRef, page]);

  return {
    data: flatternData,
    loading,
    error,
    fetchData: fetchMore,
    setPage,
  };
};

export default useInfiniteQuery;
