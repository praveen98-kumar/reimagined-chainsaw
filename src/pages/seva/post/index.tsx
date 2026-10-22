import CountCard, { CountCardBox } from "@/components/card/CountCard";
import Icon from "@/components/Icon";
import Layout from "@/components/Layout";
import ListItem, { IListItem } from "@/components/ListItem";
import { getCounts } from "@/redux/features/countSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { NextApplicationPage } from "@/shared/interfaces/app";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { isValidUser } from "@/shared/functions/utils";
import { RiFileTextLine } from "react-icons/ri";

const sevalist: IListItem[] = [
  {
    href: "/seva/post/postal-delivery",
    Icon: (
      <Icon
        containerClass="w-9 h-9"
        src="/assets/icons/Postal-Book-Delivery-Seva.png"
      />
    ),
    title: "Postal Book Delivery Seva",
    subtitle:
      "Find incoming book delivery addresses from Pune to send by post here.",
    permission: "post_order_seva",
  },
];

const PostOrder: NextApplicationPage = () => {
  const dispatch = useAppDispatch();
  const { postOrderCounts } = useAppSelector((state) => state.counts);
  useEffect(() => {
    dispatch(getCounts("post_orders_count", "postOrderCounts"));
  }, []);

  const bottomButtonClass = `text-white bg-black font-bold px-2 h-14 rounded-lg flex items-center justify-center`;
  return (
    <Layout
      headerProps={{ isBack: true, heading: "Postal Book Delivery Seva" }}
    >
      <div className="p-4 mx-auto w-full max-w-xl space-y-4">
        {postOrderCounts && (
          <CountCard
            title={"Post Book Delivery Seva Status"}
            pendingCount={postOrderCounts?.pending_order}
          >
            <CountCardBox
              title="Order Till Date"
              count={postOrderCounts.otd}
              statusColor={"yellow"}
            />
            <CountCardBox
              title="Order This Month"
              count={postOrderCounts.otm}
              statusColor={"yellow"}
            />
            <CountCardBox
              title="Completed Till Date"
              count={postOrderCounts.ctd}
            />
            <CountCardBox
              className="pl-1"
              title="Completed This Month"
              count={postOrderCounts.ctm}
            />
          </CountCard>
        )}

        <div className="border-t border-gray-300">
          {sevalist.map((item) => {
            if (typeof item.permission === "string") {
              return (
                isValidUser(item.permission, item.roles && item.roles) && (
                  <ListItem key={item.href} item={item} batchColor={"green"} />
                )
              );
            }
          })}
        </div>
        <div className="grid gap-2 grid-cols-2 mt-4">
          {isValidUser("post_order_seva") && (
            <Link href={"/seva/post/reports"}>
              <button className={bottomButtonClass}>
                <RiFileTextLine className="w-7 h-7 text-white mr-1" />
                <span className="ml-1 text-sm leading-none">Reports</span>
              </button>
            </Link>
          )}
          {isValidUser("post_order_seva") && (
            <Link href={"/seva/post/upload"}>
              <button className={bottomButtonClass}>
                <Icon
                  containerClass="w-7 h-7 mr-1"
                  src="/assets/icons/Upload-Postal-Order-List.png"
                />
                <span className="text-sm leading-none">
                  Upload Postal Order List
                </span>
              </button>
            </Link>
          )}
          {isValidUser("post_order_seva") && (
            <Link href={"/seva/post/download"}>
              <button className={bottomButtonClass}>
                <Icon
                  containerClass="w-10 h-10 flex items-center mr-1"
                  src="/assets/icons/Download Postal Order List.png"
                />
                <span className="text-sm leading-none">
                  Download Bulk Postal Order List
                </span>
              </button>
            </Link>
          )}
        </div>
      </div>
    </Layout>
  );
};

PostOrder.requireAuth = true;

export default PostOrder;
