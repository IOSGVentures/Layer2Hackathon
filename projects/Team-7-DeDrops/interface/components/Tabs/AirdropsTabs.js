import React from "react";
import { tabList } from "libs/airdropConfig";

const AirdropsTabs = ({ openTab, handleSetOpenTab }) => {
  const tabListItems = tabList.map((item) => (
    <li key={item.key} className="-mb-px mr-2 last:mr-0 flex-auto text-center">
      <a
        className={
          "text-xs font-bold uppercase px-5 py-3 rounded block leading-normal " +
          (openTab === item.key
            ? "text-white bg-blueGray-600"
            : "text-blueGray-600 bg-white")
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
      <div className="flex flex-wrap px-4">
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
