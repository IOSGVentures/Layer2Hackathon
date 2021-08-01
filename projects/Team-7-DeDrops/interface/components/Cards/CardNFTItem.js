import Link from "next/link";
import React from "react";
import { fakeData } from "libs/nftConfig";

export default function CardNFTItem({ data }) {
  return (
    data &&
    data.id && (
      <div key={data.id} className="lg:w-3/12 px-4 py-8">
        <Link href={"/nft/" + data.id}>
          <div className="h-full cursor-pointer relative flex flex-col min-w-0 break-words w-full mb-6 shadow-md rounded-lg ease-linear transition-all duration-150 hover:shadow-lg">
            <span className="absolute top-0 left-0 text-xs font-semibold inline-block py-1 px-2  rounded text-orange-600 bg-orange-200">
              ID: {data.id}
            </span>

            <span className="absolute top-0 right-0 text-xs font-semibold inline-block py-1 px-2  rounded text-emerald-600 bg-emerald-200">
              已领取/总数: {data.claimedCount} / {data.nftCount}
            </span>
            <img
              alt=""
              src={data.imgUrl}
              className="object-cover h-48 w-full align-middle rounded-t-lg"
            />
            <blockquote className="relative p-8">
              <h4 className="text-xl font-bold text-blueGray-600">
                {data.name}
              </h4>

              {data.key && (
                <span className="mt-2 text-xs font-semibold inline-block py-1 px-2  rounded text-orange-600 bg-orange-200">
                  {data.tag}
                </span>
              )}

              <p className="h-8 truncate overflow-hidden text-md font-light my-2 text-blueGray-600">
                {data.desc}
              </p>
            </blockquote>
          </div>
        </Link>
      </div>
    )
  );
}

CardNFTItem.defaultProps = {
  data: fakeData[0],
  tag: "dedrops",
};
