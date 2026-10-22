import Icon from "@/components/Icon";
import { cn, copyToClipboard } from "@/shared/functions/utils";
import dayjs from "dayjs";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { useTranslation } from "react-i18next";
import { FiPhoneCall, FiCircle } from "react-icons/fi";
import { HiOutlineChevronDown } from "react-icons/hi";
import { IoLogoWhatsapp } from "react-icons/io";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { FaEdit } from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";

dayjs.extend(timezone);
dayjs.extend(utc);

export const removeSymbols = (str: string) =>
  str.replace(/[^\s\w]/g, "").replace(/[_-]/g, " ");

export const getStatusColor = (status: string) => {
  switch (status) {
    case "will_confirm_later":
    case "confirm_later":
      return `text-yellow-500`;
    case "issue_with_rule":
      return `text-indigo-500`;
    case "come_in_satsang":
    case "want_book":
    case "ok":
      return `text-gray-500`;
    case "interested":
    case "active":
    case "doing_devotion":
      return "text-green-600";
    case "not_interested":
    case "namdan_not_taken":
    case "left":
    case "wrong":
    case "left_devotion":
      return "text-red-500";
    case "got_initiation":
    case "namdan_taken":
      return "text-blue-500";
    case "duplicate":
      return "text-yellow-500";
    case "discussion":
      return "text-violet-500";
    case "out-of-reach":
    case "out_of_reach":
    case "wrong_no":
      return "text-orange-500";
    default:
      return "text-gray-500";
  }
};

export const CardIcons = ({
  mobile_no,
  alt_mobile_no,
  showTimer,
  timer,
  showShareIcons,
  message,
}: {
  mobile_no: string;
  alt_mobile_no?: string;
  showTimer?: boolean;
  timer?: React.ReactNode;
  showShareIcons?: boolean;
  message?: string;
}) => {
  const className = "w-10 flex items-center rounded-lg justify-center h-10";

  const share = async () => {
    await navigator.share({ text: message });
  };

  return (
    <div className="flex flex-col items-center absolute top-0 right-0 bg-white">
      {showTimer && timer}
      <a href={`tel:${mobile_no}`} className={className}>
        <FiPhoneCall className="text-black text-2xl" />
      </a>
      <a
        href={`https://wa.me/91${
          mobile_no?.substring(mobile_no.length - 10) || ""
        }`}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={(e) => {
          if (!mobile_no || mobile_no.length < 10) {
            e.preventDefault();
          }
        }}
      >
        <IoLogoWhatsapp className="text-green-600 text-3xl" />
      </a>
      {showShareIcons && (
        <a onClick={() => share()} className={className}>
          <FiShare2 className="text-black text-3xl cursor-pointer" />
        </a>
      )}
      {alt_mobile_no && (
        <>
          <a href={`tel:${alt_mobile_no}`} className={className}>
            <FiPhoneCall className="text-black text-2xl" />
          </a>
          <a
            href={`https://wa.me/91${
              alt_mobile_no?.substring(alt_mobile_no.length - 10) || ""
            }`}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
            onClick={(e) => {
              if (!alt_mobile_no || alt_mobile_no.length < 10) {
                e.preventDefault();
              }
            }}
          >
            <IoLogoWhatsapp className="text-green-600 text-3xl" />
          </a>
        </>
      )}
    </div>
  );
};

export const CardDateStatus = ({
  date,
  title,
  className,
  dateFormat = "DD/MM/YYYY",
}: {
  date: string;
  title: string;
  className?: string;
  dateFormat?: string;
}) => {
  return (
    <div
      className={cn(
        "text-xs bg-gray-500 text-gray-100 text-center p-0.5",
        className,
      )}
    >{`${title}: ${dayjs(date)
      .utc(true)
      .add(5, "hour")
      .add(30, "minute")
      .format(dateFormat)}`}</div>
  );
};

interface CardMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  message: Record<string, any>;
  new_mobile_no?: string;
  onEditClick?: () => void;
  showEditClick?: boolean;
}

export const CardMessage = ({
  className,
  message,
  new_mobile_no,
  onEditClick,
  showEditClick,
  ...props
}: CardMessageProps) => {
  return (
    <div
      className={cn("w-full p-2 text-sm min-h-[130px]", className)}
      {...props}
    >
      <table>
        <tbody>
          {Object.entries(message).map(([k, v]) => (
            <tr key={k} className="p-0 space-x-2">
              <td className="font-medium capitalize p-0 align-top pr-1">
                {removeSymbols(k)}:
              </td>
              <td>
                <div className="flex items-center">
                  {k == "order_type" && (
                    <div
                      className={cn(
                        "w-3.5 h-3.5 rounded-full mr-1",
                        v == "Regular" ? "bg-green-500" : "bg-red-500",
                      )}
                    ></div>
                  )}
                  {v}
                  {showEditClick && k === "mobile_no" && !new_mobile_no ? (
                    <button onClick={onEditClick}>
                      <FaEdit className="w-3 h-3 ml-2 text-blue-500" />
                    </button>
                  ) : null}
                  {showEditClick && k === "new_mobile_no" && new_mobile_no ? (
                    <button onClick={onEditClick}>
                      <FaEdit className="w-3 h-3 ml-2 text-blue-500" />
                    </button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface CardGridContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const CardGridContainer = ({
  className,
  children,
  ...props
}: CardGridContainerProps) => {
  const childrenElements = React.Children.toArray(children);
  const total = childrenElements.length;
  return (
    <div className={cn("grid grid-cols-2", className)} {...props}>
      {childrenElements.map((child, i) => {
        if (!React.isValidElement<{ className?: string }>(child)) {
          return child;
        }
        const isLast = i === total - 1;
        const isEven = i % 2 === 0;
        const className = cn(
          child.props.className,
          isLast && isEven
            ? "col-span-2 border-x-0 border-b-0"
            : isEven
              ? "col-span-1 border-l-0"
              : "col-span-1 border-r-0",
        );

        return React.cloneElement(child, { className });
      })}
    </div>
  );
};

interface CardWrapperProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardWrapper: React.FC<CardWrapperProps> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "relative w-full my-2 mx-auto h-fit overflow-hidden bg-white ring-4 ring-gray-200 rounded-xl border border-gray-500",
        className,
      )}
      {...props}
    ></div>
  );
};

interface CardHistoryProps extends React.HTMLAttributes<HTMLDivElement> {
  history?: Array<{
    created_at: string;
    status: string;
    remark: string | null;
    form_no?: string;
  }>;
  showLast?: boolean;
}

export const HistoryToggleComponent: React.FC<
  Omit<CardHistoryProps, "history"> & { children: React.ReactNode }
> = ({ children, className, showLast, ...props }) => {
  const [open, setOpen] = React.useState(false);
  const { t: tc } = useTranslation("common");

  return (
    <React.Fragment>
      <div
        className={cn(
          "relative flex bg-black text-white items-center justify-center",
          className,
        )}
        {...props}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Icon src="/assets/icons/history.png" className="h-5 w-5 my-1" />
        <span className="text-xs">{tc("remark")}</span>
        <motion.div
          transition={{ duration: 0.2 }}
          className={`absolute right-1 top-0.5 hover:cursor-pointer ${
            open ? "rotate-180" : ""
          }`}
        >
          <HiOutlineChevronDown className="text-white text-2xl" />
        </motion.div>
      </div>
      <AnimatePresence initial={false}>
        {open ? children : null}
      </AnimatePresence>
    </React.Fragment>
  );
};

export const CardHistory: React.FC<CardHistoryProps> = ({
  history,
  showLast,
  ...props
}) => {
  const { t: ts } = useTranslation("status");
  const { t: tc } = useTranslation("common");

  return (
    <HistoryToggleComponent showLast={showLast} {...props}>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", maxHeight: "full", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="text-xs flex flex-col gap-y-1"
      >
        {history?.map(
          ({ status, created_at, remark, form_no }, i) =>
            i > 0 &&
            (showLast ? i < history?.length : i < history?.length - 1) && (
              <div
                key={created_at + i}
                className="border-b border-gray-200 px-2"
              >
                <p
                  className={cn(
                    "font-semibold",
                    getStatusColor(
                      status.toLocaleLowerCase().split(" ").join("_"),
                    ),
                  )}
                >{` ${ts(status)} - ${dayjs(created_at).format(
                  "DD/MM/YYYY",
                )}`}</p>
                {form_no && (
                  <p className="">{`${tc("from_no")}: ${form_no}`}</p>
                )}
                {remark && (
                  <p className="">{`${tc("remark")}: ${remark || "-"}`}</p>
                )}
              </div>
            ),
        )}
      </motion.div>
    </HistoryToggleComponent>
  );
};
