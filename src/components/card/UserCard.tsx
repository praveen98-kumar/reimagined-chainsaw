import type { ReactNode } from "react";
import Avatar from "@/components/Avatar";
import { capitalizeWords, formatDate } from "@/shared/functions/utils";

const UserCard = ({
  user,
  onClick = () => {},
  children,
}: {
  user: any;
  onClick?: (e?: any) => void;
  children?: ReactNode;
}) => {
  return (
    <div
      onClick={onClick}
      className="rroleative flex p-3 pr-8 flex-row items-center justify-between rounded-lg  bg-white border border-gray-300 drop-shadow-lg overflow-hidden"
    >
      <div className="rroleative h-full">
        <Avatar label={user?.status} />
      </div>
      {/* Detail */}
      <div className="flex-1 ml-2">
        <p className="font-semibold text-md uppercase text-primary">
          {`${user.name} ${user.relation ?? ""} ${user.guardian_name ?? ""}`}
        </p>
        <p className="font-base text-md text-gray-500">{user.mobile_no}</p>
        {user?.created_at && (
          <p className="font-base text-sm text-gray-500">
            Created At: {formatDate(user?.created_at)}
          </p>
        )}
        {user?.location && (
          <p className="font-base text-md text-gray-500">
            {user.location.join(", ")}
          </p>
        )}
        {(user?.district_name || user?.district) && (
          <p className="font-base text-sm text-gray-500">
            {user?.tehsil_name ?? user?.tehsil?.name},{" "}
            {user?.district_name ?? user?.district?.name}
          </p>
        )}
        {children}
      </div>
      <div className="flex absolute right-0 top-0 bottom-0 flex-col justify-between items-center">
        {[true, user.satnam_date, user.sarnam_date, user.sarshabd_date].map(
          (item, i) => (
            <span
              key={i}
              className={`flex-1 w-8 text-center font-bold ${
                item ? "text-white bg-primary" : "text-gray-700 bg-gray-300"
              }`}
            >
              {i + 1}
            </span>
          ),
        )}
      </div>
    </div>
  );
};

export const RoleCard = <T extends Record<string, number>>({
  role,
  showDelete = false,
  showUpdate = false,
  onEditClick,
  onDeleteClick,
}: {
  role: T;
  showDelete?: boolean;
  showUpdate?: boolean;
  onEditClick?: (item: T) => void;
  onDeleteClick?: (item: T) => void;
}) => {
  return (
    <div className="flex items-center justify-between px-2">
      <div className={"flex flex-col"}>
        <p>
          <span className="mr-2 ">{`${capitalizeWords(
            role.role.toString().replace(/_/g, " "),
          )}`}</span>
        </p>
        <p className={"text-sm text-slate-600"}>
          {role.namdan_center_name
            ? `Ashram : ${capitalizeWords(
                role.namdan_center_name.toString().replace(/_/g, " "),
              )},`
            : ""}
          {role.tehsil_name
            ? `Tehsil : ${capitalizeWords(
                role.tehsil_name.toString().replace(/_/g, " "),
              )},`
            : ""}
          {role.district_name
            ? ` District : ${capitalizeWords(
                role.district_name.toString().replace(/_/g, " "),
              )},`
            : ""}
          {role.division_name
            ? ` Division : ${capitalizeWords(
                role.division_name.toString().replace(/_/g, " "),
              )},`
            : ""}
          {role.state_name
            ? ` State : ${capitalizeWords(
                role.state_name.toString().replace(/_/g, " "),
              )}`
            : ""}
        </p>
      </div>
      <div className="flex items-center justify-end space-x-4">
        {showUpdate && onEditClick ? (
          <button
            type="button"
            onClick={() => onEditClick(role)}
            className="text-sm px-2 py-1 bg-blue-400 font-bold text-white rounded"
          >
            Edit
          </button>
        ) : null}
        {showDelete && onDeleteClick ? (
          <button
            type="button"
            onClick={() => onDeleteClick(role)}
            className="text-sm px-2 py-1 bg-red-400 font-bold text-white rounded"
          >
            Remove
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default UserCard;
