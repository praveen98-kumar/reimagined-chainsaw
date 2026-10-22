import ButtonTabs from "@/components/ButtonTabs";
import { CardMessage, CardWrapper } from "@/components/card/CommonCard";
import Layout from "@/components/Layout";
import LoadingSpinner from "@/components/LoadingSpinner";
import apiClient from "@/http/index";
import { formatDate } from "@/shared/functions/utils";
import type { Ramaini } from "@/shared/interfaces/seva";
import { useInfiniteQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { IoWarningOutline } from "react-icons/io5";
import { MdDownload } from "react-icons/md";

export function RamainiSevaList({ activeTab = 0 }: { activeTab: number }) {
  const router = useRouter();
  const observerRef = useRef<HTMLDivElement>(null);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["ramaini_seva_list", activeTab],
      queryFn: async ({ pageParam }) => {
        const { data } = await apiClient.get("/members", {
          params: {
            page: pageParam,
            limit: 10,
            status: activeTab === 0 ? "pending" : "complete",
          },
        });

        return data?.data?.result ?? [];
      },
      getNextPageParam: (lastPage) => {
        return undefined;
      },
      initialPageParam: 1,
    });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <Layout
        headerProps={{
          isBack: true,
          heading: "Ramaini Seva List",
        }}
      >
        <div className="p-4 mx-auto w-full max-w-xl space-y-4">
          <LoadingSpinner className={"mx-auto w-8 h-8"} />
        </div>
      </Layout>
    );
  }

  const items = data?.pages.flat() as Ramaini[];

  if (items.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="flex flex-row items-center gap-2  justify-center">
          <IoWarningOutline className="w-5 h-5 text-gray-400" />
          <p className="text-gray-400">No Records found</p>
        </div>
      </div>
    );
  }

  const handleNavigate = (id: string) => {
    router.push(`/seva/ramaini/edit?formId=${id}`);
  };

  const handleDownload = async (id: string) => {
    try {
      const { data } = await apiClient.get(`/member/${id}`);

      if (data?.data?.verified2) {
        const { data: pdfData } = await apiClient.post(
          "/ramaini_form_download",
          data.data,
          { responseType: "blob" }
        );
        const blob = new Blob([pdfData], { type: "application/pdf" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `ramaini-format-${dayjs().format("DD-MM-YYYY")}`;
        link.click();
        URL.revokeObjectURL(link.href);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <React.Fragment>
      {items?.map((item: any) => (
        <CardWrapper
          className="w-[98%] relative cursor-pointer"
          onClick={() => activeTab === 0 && handleNavigate(item.id)}
          key={item.id}
        >
          <CardMessage
            message={{
              groom_name: item?.groom_full_name,
              bride_name: item?.bride_full_name,
              groom_mobile: item?.groom_mobile_no,
              bride_mobile: item?.bride_mobile_no,
              ramaini_date: formatDate(item?.bride_wedding_date),
              registration_date: formatDate(item?.created_at),
            }}
          />
          {item?.verified2 && activeTab === 1 && (
            <button
              type="button"
              onClick={() => handleDownload(item.id)}
              aria-describedby="download pdf"
              className="absolute top-2 right-2 z-10 h-10 w-10 bg-black rounded-lg border flex items-center justify-center cursor-pointer"
            >
              <MdDownload className="text-white h-10" />
            </button>
          )}
          <div>
            <table className="text-xs w-full">
              <tbody className="bg-gray-200 w-full">
                {item?.verified_by_user && (
                  <tr className="">
                    <td className="font-bold px-2 py-0.5 w-36">
                      First Verified By:
                    </td>
                    <td className="px-2 py-0.5">
                      {item?.verified_by_user?.disciple?.name}
                    </td>
                    <td className="font-bold px-2 py-0.5">
                      First Verified At:
                    </td>
                    <td className="px-2 py-0.5">
                      {formatDate(item?.verified_at)}
                    </td>
                  </tr>
                )}
                {item?.verified_by2_user && (
                  <tr className="border-t border-gray-700">
                    <td className="font-bold px-2 py-0.5 w-36">
                      Second Verified By:
                    </td>
                    <td className="px-2 py-0.5">
                      {item?.verified_by2_user?.disciple?.name}
                    </td>
                    <td className="font-bold px-2 py-0.5">
                      Second Verified At:
                    </td>
                    <td className="px-2 py-0.5">
                      {formatDate(item?.verified_at2)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardWrapper>
      ))}

      <div ref={observerRef} className="flex justify-center p-4">
        {isFetchingNextPage && <LoadingSpinner className={"mx-auto w-8 h-8"} />}
      </div>
    </React.Fragment>
  );
}

export default function Page() {
  const [tabIndex, setTabIndex] = useState(0);
  return (
    <Layout
      headerProps={{
        isBack: true,
        heading: "Ramaini Seva Edit",
      }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        <ButtonTabs
          handleClick={() => {}}
          items={[
            { label: "Verification Pending" },
            { label: "Verification Completed" },
          ].map((t, i) => ({
            label: t.label,
            active: i === tabIndex,
            handleClick: () => setTabIndex(i),
          }))}
        />
        {tabIndex === 0 ? (
          <RamainiSevaList activeTab={0} />
        ) : (
          <RamainiSevaList activeTab={1} />
        )}
      </div>
    </Layout>
  );
}
