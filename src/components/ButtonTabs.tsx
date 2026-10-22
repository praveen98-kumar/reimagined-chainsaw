import React from "react";

interface TabItem {
  active: boolean;
  disabled?: boolean;
  label: string;
  handleClick?: (e: any) => void;
}

interface Props {
  handleClick: (e?: any) => void;
  items: TabItem[];
}
const ButtonTabs: React.FC<Props> = ({ handleClick, items }) => {
  const activeClass = "text-white bg-primary font-semibold text-center";
  const inActiveClass = "bg-white text-gray-800";
  const count = items.length;
  return (
    <div className="flex overflow-hidden rounded-xl drop-shadow-lg border border-gray-400">
      {items.map((item, i) => (
        <button
          key={item.label}
          className={`flex-1 break-words p-2 py-3 transition  ${
            item.active ? activeClass : inActiveClass
          } ${count > 2 ? "text-sm py-1" : ""}`}
          onClick={() =>
            item.handleClick ? item.handleClick(i) : handleClick()
          }
          disabled={item.disabled}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default ButtonTabs;
