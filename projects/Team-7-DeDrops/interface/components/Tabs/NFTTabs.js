import React from "react";
import { tabList } from "libs/nftConfig";

const AirdropsTabs = ({ openTab, handleSetOpenTab }) => {
  const tabListItems = tabList.map((item) => (
    <li key={item.key} className="-mb-px px-4 mr-2 last:mr-0  text-center">
      <a
        className={
          "text-lg px-2 py-3 rounded block leading-normal bg-white" +
          (openTab === item.key
            ? "text-blueGray-600 font-bold"
            : "text-blueGray-500")
        }
        onClick={(e) => {
          e.preventDefault();
          handleSetOpenTab(item.key);
        }}
        data-toggle="tab"
        href={`#${item.key}`}
        role="tablist"
      >
        {item.text}
      </a>
    </li>
  ));

  return (
    <>
      <div className="flex flex-wrap">
        <div className="w-full">
          <ul
            className="flex mb-0 list-none flex-wrap pt-3 pb-4 flex-row"
            role="tablist"
          >
            {tabListItems}
          </ul>
        </div>
      </div>
    </>
  );
};

export default AirdropsTabs;
