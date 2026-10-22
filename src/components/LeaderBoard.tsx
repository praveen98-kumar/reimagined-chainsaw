import dayjs from "dayjs";
import React, { useState, useMemo, useEffect } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import apiClient from "@/http/index";
import { TopSevadars } from "@/shared/interfaces/seva";
import { AxiosResponse } from "axios";
import { useTranslation } from "react-i18next";

const ListItem = ({
  i,
  sevadar,
  seva,
}: {
  i: number;
  sevadar: string;
  seva: number;
}) => {
  return (
    <div className="flex items-center gap-2 ">
      <span className=" flex items-center justify-center text-white font-semibold text-sm w-5 h-5 bg-green-600 rounded-full p-1">
        {i}
      </span>
      <span className="text-gray-800 font-semibold">
        {sevadar} - {seva}
      </span>
    </div>
  );
};
const Section = ({
  title,
  num,
  sevadars,
}: {
  title: string;
  num: number;
  sevadars: TopSevadars;
}) => {
  const { t: tc } = useTranslation("common");
  return (
    <div className="flex flex-col w-1/2 odd:border-r odd:border-gray-400  odd:mr-1 even:ml-1">
      <p className="mx-auto font-semibold text-gray-700">
        {tc(title.toLowerCase())}
      </p>
      {title == "Tehsil"
        ? sevadars.tehsil_seva.map((obj: any, i) => (
            <ListItem i={i + 1} sevadar={obj.sevadar} seva={obj.seva} key={i} />
          ))
        : sevadars.district_seva.map((obj: any, i) => (
            <ListItem i={i + 1} sevadar={obj.sevadar} seva={obj.seva} key={i} />
          ))}
    </div>
  );
};
const LeaderBoard = ({
  headings,
  regular,
  sevatype,
}: {
  headings: string[];
  regular: boolean;
  sevatype: string;
}) => {
  const { t: tc } = useTranslation("common");
  const { t } = useTranslation("order");
  const titles = ["Tehsil", "District"];
  const [showMore, setShowMore] = useState(false);
  const [topSevadars, setTopSevadars] = useState<TopSevadars>({
    tehsil_seva: [],
    district_seva: [],
  });
  const [topISevadars, setTopISevadars] = useState<TopSevadars>({
    tehsil_seva: [],
    district_seva: [],
  });

  const num = useMemo(() => {
    return showMore ? 10 : 5;
  }, [showMore]);

  const getTopSevadars = async () => {
    setTopSevadars({ tehsil_seva: [], district_seva: [] });
    let response: AxiosResponse;
    if (!regular) {
      response = await apiClient.get(`top_sevadars?${sevatype}=1&emergency=1`);
    } else {
      response = await apiClient.get(`top_sevadars?${sevatype}=1`);
    }
    const { tehsil_seva, district_seva, i_tehsil_seva, i_district_seva } =
      response.data.data;
    setTopSevadars({ tehsil_seva, district_seva });
    setTopISevadars({
      tehsil_seva: i_tehsil_seva,
      district_seva: i_district_seva,
    });
  };

  useEffect(() => {
    getTopSevadars();
  }, [regular]);

  return (
    <div className="w-full max-w-xl">
      <h3 className="font-bold text-center text-black">
        {t("top10", { date: dayjs().format("DD/MM/YYYY") })}
      </h3>
      {headings.map((heading, index) => (
        <div className={!showMore ? "odd:hidden" : ""} key={index}>
          <p className="text-center mb-1 font-bold">{heading}</p>
          <div className="flex w-full h-full relative">
            {titles.map((t) => (
              <Section
                key={t}
                num={num}
                sevadars={index == 0 ? topSevadars : topISevadars}
                title={t}
              />
            ))}
          </div>
        </div>
      ))}
      <button
        onClick={() => setShowMore((pre) => !pre)}
        className="border-t border-b w-full border-gray-400 flex items-center justify-center gap-0.5"
      >
        <span className="text-xs font-semibold">
          Show {showMore ? "Less" : "More"}
        </span>
        <span>
          {showMore ? (
            <MdKeyboardArrowUp size={20} />
          ) : (
            <MdKeyboardArrowDown size={20} />
          )}
        </span>
      </button>
    </div>
  );
};

export default LeaderBoard;
