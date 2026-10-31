import React from "react";
import Link from "next/link";
import useValidUser from "@/hooks/useValidUser";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";

export interface IListItem {
  title: string;
  href: string;
  Icon: React.ReactNode;
  subtitle?: string;
  count?: number;
  permission: string | string[];
  roles?: string[];
}

interface ListItemProp {
  item: IListItem;
  batchColor?: "green" | "red";
  t?: (key: string) => string;
}

export const DeliveryListItem: React.FC<ListItemProp> = ({
  item,
  t: localt,
}) => {
  const { t } = useTranslation("delivery");
  const { locale } = useRouter();
  const hasPermission = useValidUser(item.permission);
  return hasPermission ? (
    <Link href={item.href} locale={locale} passHref>
      <div className="flex items-start justify-between border-b border-t cursor-pointer border-gray-300 py-2 px-1">
        {item.Icon}

        <div className="flex-1 px-4">
          <p className="font-bold text-primary text-xl uppercase leading-snug">
            {item.title && (localt ? localt(item.title) : t(item.title))}
          </p>
          <p className="font-normal text-gray-400 text-xs">
            {item.subtitle &&
              (localt ? localt(item.subtitle) : t(item.subtitle))}
          </p>
        </div>
      </div>
    </Link>
  ) : null;
};

const ListItem: React.FC<ListItemProp> = ({ item, t: localt }) => {
  const { t } = useTranslation("calling");
  const { locale } = useRouter();
  const hasPermission = useValidUser(item.permission);
  return hasPermission ? (
    <Link href={item.href} locale={locale} passHref>
      <div className="flex items-start justify-between border-b border-t cursor-pointer border-gray-300 py-2 px-1">
        {item.Icon}

        <div className="flex-1 px-4">
          <p className="font-bold text-primary text-xl uppercase leading-snug">
            {item.title && (localt ? localt(item.title) : t(item.title))}
          </p>
          <p className="font-normal text-gray-400 text-xs">
            {item.subtitle &&
              (localt ? localt(item.subtitle) : t(item.subtitle))}
          </p>
        </div>
      </div>
    </Link>
  ) : null;
};

export default ListItem;
