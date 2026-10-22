import { queryString } from "@/shared/functions/utils";
import useValidUser from "@/hooks/useValidUser";
import { useRouter } from "next/router";
import React from "react";
import Icon from "./Icon";
import { useTranslation } from "react-i18next";

interface Props {
  params: Record<string, string>;
  permission: string;
}

const AddSevadarButton = ({ permission, params = {} }: Props) => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const hasPermission = useValidUser(permission);

  const paramString = queryString(params);
  const onClick = () => {
    router.push(`/seva/allotseva${paramString}`, undefined, {
      locale: router.locale,
    });
  };
  if (!hasPermission) return null;
  return (
    <div
      onClick={onClick}
      className="p-2 cursor-pointer rounded-lg bg-white border border-gray-400 drop-shadow-lg flex items-center justify-center"
    >
      <Icon containerClass="w-7 h-7" src="/assets/icons/addRemoveUser.png" />
      <span className="ml-3 font-bold text-primary text-lg">
        {t("add_remove")}
      </span>
    </div>
  );
};

export default AddSevadarButton;
