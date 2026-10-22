import Avatar from "@/components/Avatar";
import { User, UserListParamsType } from "@/shared/interfaces/user";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import React from "react";
import { useTranslation } from "react-i18next";
import { BiChevronsDown } from "react-icons/bi";
dayjs.extend(utc);
interface UserAllotCardProps {
  level?: number;
  type?: keyof UserListParamsType;
  onAllot?: (e?: any) => void;
  onRemove?: (e?: any) => void;
  onAdd?: (e?: any) => void;
  showButtons?: boolean;
  loading?: boolean;
  // href: string;
  user: User;
  disableAllot?: boolean;
}

const UserAllotCard: React.FC<UserAllotCardProps> = ({
  onAllot,
  level = 1,
  type = "allot",
  onRemove,
  onAdd,
  loading,
  // href,
  user,
  disableAllot = false,
}) => {
  return (
    <>
      <div className="relative flex p-3 pr-8 flex-row items-center justify-between rounded-lg bg-white border border-gray-300 drop-shadow-lg overflow-hidden">
        {/* Image */}
        <div className="relative h-full">
          <Avatar label={user?.status} />
        </div>
        {/* Detail */}
        <div className="flex-1 ml-2">
          <p className="font-semibold text-md uppercase text-primary">
            {user.disciple.name}
          </p>
          <p className="font-base text-md text-gray-500">{user.mobile_no}</p>
        </div>
        {/* Action */}
        <div className="flex flex-col space-y-0.5 justify-center mr-2">
          {type === "remove" ? (
            <button
              disabled={loading}
              onClick={onRemove}
              className="px-3 py-3 bg-gray-500 text-white font-semibold text-sm rounded-md"
            >
              Remove
            </button>
          ) : type === "allot" ? (
            <>
              <button
                disabled={loading}
                onClick={() => (onAllot ? onAllot(user.id) : {})}
                className="px-3 py-2 bg-green-600 text-white font-semibold text-sm rounded-md"
              >
                Allot Seva
              </button>
            </>
          ) : (
            <button
              disabled={loading}
              onClick={() => {}}
              className="px-3 py-3 bg-green-600 text-white font-semibold text-sm rounded-md"
            >
              Add
            </button>
          )}
        </div>
        {/* Level */}
        <div className="flex absolute right-0 top-0 bottom-0 flex-col justify-between items-center">
          {[
            true,
            user.disciple.satnam_date,
            user.disciple.sarnam_date,
            user.disciple.sarshabd_date,
          ].map((item, i) => (
            <span
              key={i}
              className={`flex-1 w-8 text-center font-bold ${
                item ? "text-white bg-primary" : "text-gray-700 bg-gray-300"
              }`}
            >
              {i + 1}
            </span>
          ))}
        </div>
      </div>
    </>
  );
};

export const SevaAllotCard: React.FC<UserAllotCardProps> = ({
  onAllot,
  level = 2,
  type,
  onRemove,
  onAdd,
  // href,
  user,
  showButtons = true,
  disableAllot,
}) => {
  const { t: tc } = useTranslation("common");
  return (
    <>
      <div className="relative flex p-3 pr-8 flex-row items-center justify-between rounded-lg  bg-white border border-gray-300 drop-shadow-lg overflow-hidden">
        {/* Image */}
        <div className="relative h-full">
          <Avatar label={user?.status} />
        </div>
        {/* Detail */}
        <div className="flex-1 ml-2">
          <p className="font-semibold text-md uppercase text-primary">
            {user.disciple.name}
          </p>
          <p className="font-base text-md text-gray-500">{user.mobile_no}</p>
          {user.pending_seva && (
            <div className="flex items-center">
              <BiChevronsDown className="w-6 h-6 text-red-500" />
              <span>{user.pending_seva} Pending Seva</span>
            </div>
          )}
        </div>
        {/* Action */}
        <div className="flex flex-col space-y-0.5 justify-center mr-2">
          {type === "remove" ? (
            <button
              onClick={onRemove}
              className="px-3 py-3 bg-gray-500 text-white font-semibold text-sm rounded-md"
            >
              {tc("remove")}
            </button>
          ) : type === "allot" || type === "allotted" ? (
            <>
              {showButtons && (
                <>
                  <button
                    onClick={() =>
                      onAllot ? onAllot({ u: user, seva_count: 30 }) : {}
                    }
                    disabled={disableAllot}
                    className="px-3 py-2 bg-green-600 text-white font-semibold text-sm rounded-md disabled:text-slate-300 disabled:bg-gray-400"
                  >
                    {tc("allot_seva")}
                  </button>

                  {type === "allot" && (
                    <button
                      onClick={() =>
                        onAllot ? onAllot({ u: user, seva_count: 0 }) : {}
                      }
                      disabled={disableAllot}
                      className="px-3 py-2 bg-red-500 text-white font-semibold text-sm rounded-md disabled:text-slate-300 disabled:bg-gray-400"
                    >
                      {tc("no_seva")}
                    </button>
                  )}
                </>
              )}
            </>
          ) : (
            <button
              onClick={() => {}}
              className="px-3 py-3 bg-green-600 text-white font-semibold text-sm rounded-md"
            >
              {tc("add")}
            </button>
          )}
        </div>
        {/* Level */}
        <div className="flex absolute right-0 top-0 bottom-0 flex-col justify-between items-center">
          {[
            true,
            user.disciple.satnam_date,
            user.disciple.sarnam_date,
            user.disciple.sarshabd_date,
          ].map((item, i) => (
            <span
              key={i}
              className={`flex-1 w-8 text-center font-bold ${
                item ? "text-white bg-primary" : "text-gray-700 bg-gray-300"
              }`}
            >
              {i + 1}
            </span>
          ))}
        </div>
      </div>
    </>
  );
};

export const AllotedCard: React.FC<{
  user: any;
}> = ({ user }) => {
  return (
    <div className="relative flex p-3 pr-8 flex-row items-center justify-between rounded-lg  bg-white border border-gray-300 drop-shadow-lg overflow-hidden">
      {/* Image */}
      <div className="relative h-full">
        <Avatar label={user?.status} />
      </div>
      {/* Detail */}
      <div className="flex-1 ml-2">
        <p className="font-semibold text-md uppercase text-primary">
          {user.name}
        </p>
        <p className="font-base text-md text-gray-500">{user.mobile_no}</p>
        <p
          className={`flex flex-col rounded-lg gap-1 ${
            user.seva_count == 0 ? "bg-red-500" : "bg-green-600"
          } text-white font-medium text-md items-center justify-center mr-2`}
        >
          <span>
            {dayjs.utc(user.allotted_date).local().format("DD/MM/YYYY hh:mm A")}
          </span>
          <span>
            {/* */}
            {user.seva_count > 0 ? `${user.seva_count} सेवा` : "कोई सेवा नहीं"}
            {/* {user.seva_count > 0 ? `Allotted ${user.seva_count}` : "No Seva"} */}
          </span>
        </p>
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
          )
        )}
      </div>
    </div>
  );
};

export default UserAllotCard;
