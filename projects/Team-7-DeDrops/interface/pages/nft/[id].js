/* eslint-disable react/jsx-no-target-blank */
import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/router";

import { mintConditions } from "libs/nftConfig";

import MainLayout from "layouts/main";
import AirdropsCardTable from "components/Cards/CardAirdropsTable";

import { fakeData } from "libs/nftConfig";

import { Bank1155Contract, NFTMintContract } from "libs/contracts";
import { useWeb3React } from "@web3-react/core";

import _ from "lodash";

import useContract from "hooks/useContract";
import { DeDropsNFT as mintContractABI } from "constans/abi/DeDropsNFT";
import { Bank1155 as Bank1155ABI } from "constans/abi/Bank1155";
import { parseBN } from "libs/web3Util";

export default function NFTDetail({ data }) {
  const router = useRouter();

  const nftID = router.query.id;

  const imgRef = useRef();
  const { library, account } = useWeb3React();

  const nftDetailInitInfoState = {
    name: "",
    imgUrl: "",
    desc: "",
    nftCount: "",
  };

  const nftDetailInitInfo2State = {
    actions: [],
    money: "",
  };

  const [nftDetail, setNftDetail] = useState({
    ...nftDetailInitInfoState,
    ...nftDetailInitInfo2State,
  });

  // mint contract instance
  const nftContract = useContract(NFTMintContract, mintContractABI, account);

  // bank 1155 contract instance
  const bank1155Contract = useContract(Bank1155Contract, Bank1155ABI, account);

  useEffect(() => {
    (async () => {
      if (nftContract) {
        // console.log(nftContract);
        // const nftCount = await nftContract.length();
        // console.log("nftCount", parseBN(nftCount));
        const nftData = await nftContract.idToItem(nftID);

        console.log("nftData", nftData);
        const nftDataInfo = nftData.info
          ? JSON.parse(nftData.info)
          : nftDetailInitInfoState;
        const nftDataCondition = nftData.info2
          ? JSON.parse(nftData.info2)
          : nftDetailInitInfo2State;

        // nft 已领取数量
        let claimedCount = await bank1155Contract.tokenUserBalance(
          NFTMintContract,
          nftID,
          account
        );

        console.log("claimedCount", parseBN(claimedCount));
        claimedCount = parseBN(claimedCount);

        if (nftDataInfo.imgUrl === "") {
          nftDataInfo.imgUrl =
            "https://miro.medium.com/max/1400/1*PfyeIplM0nkWwiGgkrYCUQ.png";
        }

        console.log({
          ...nftDataInfo,
          ...nftDataCondition,
          claimedCount,
        });

        setNftDetail({
          ...nftDataInfo,
          ...nftDataCondition,
          claimedCount,
        });
      }
    })();
  }, [nftID, nftContract, account, bank1155Contract]);

  return (
    <>
      <section className="header relative pt-24 items-center flex">
        <div className="container mx-auto items-center flex flex-wrap">
          <div className="w-full px-4 pt-8">
            <div className="relative flex flex-col min-w-0 break-words  w-full mb-6  rounded">
              <div className="flex flex-wrap pt-2">
                <div className="w-full lg:w-6/12 px-4">
                  {/* 领取条件 */}
                  <h4 className="text-xl font-bold text-blueGray-600">
                    领取条件
                  </h4>

                  <div className="mt-2">
                    <ul className="border border-blueGray-200 rounded-md divide-y divide-gray-200">
                      {nftDetail.actions &&
                        nftDetail.actions.map((item) => (
                          <li
                            key={item.key}
                            className="pl-3 pr-4 py-4 flex items-center justify-between text-sm"
                          >
                            <div className="w-0 flex-1 flex items-center">
                              <span className="ml-2 flex-1 w-0 truncate">
                                {_.find(mintConditions, { key: item.key }).text}
                                ，至少 {item.count} 次
                              </span>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <span className="bg-emerald-500 text-white font-bold  text-xs px-4 py-2 rounded  outline-none mr-1 mb-1 ">
                                满足
                              </span>
                            </div>
                          </li>
                        ))}

                      {nftDetail.money && nftDetail.money > 0 ? (
                        <li
                          key="money"
                          className="pl-3 pr-4 py-4 flex items-center justify-between text-sm"
                        >
                          <div className="w-0 flex-1 flex items-center">
                            <span className="ml-2 flex-1 w-0 truncate">
                              链上资产总额大于 {nftDetail.money} USD
                            </span>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <span className="bg-emerald-500 text-white font-bold  text-xs px-4 py-2 rounded  outline-none mr-1 mb-1 ">
                              满足
                            </span>
                          </div>
                        </li>
                      ) : null}
                    </ul>
                  </div>

                  <div className="w-full mt-6 px-4">
                    <div className="relative w-full mb-3 px-12">
                      <button
                        className="bg-emerald-500 text-white block w-full mr-1active:bg-emerald-500 font-bold uppercase text-lg px-12 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                        type="button"
                      >
                        领取
                      </button>
                    </div>
                  </div>

                  <hr className="my-6 border-b-1 border-blueGray-300" />

                  {/* 关联的空投活动 */}
                  <h4 className="mb-4 text-xl font-bold text-blueGray-600">
                    关联的空投活动
                  </h4>

                  <AirdropsCardTable />
                </div>

                <div className="w-full lg:w-6/12 px-4">
                  <div className="px-4">
                    <div className="bg-blueGray-200 h-600-px relative flex p-8 flex-col min-w-0 break-words w-full mb-6 shadow-md rounded-lg ease-linear transition-all duration-150 hover:shadow-lg">
                      <blockquote className="relative">
                        <h4 className="text-xl font-bold text-blueGray-600">
                          {nftDetail.name}
                        </h4>

                        {/* <a
                          href="https://github.com/creativetimofficial/notus-nextjs/blob/main/LICENSE.md?ref=nnjs-footer"
                          className="text-xs font-semibold block py-1 px-2  rounded text-blueGray-200 bg-blueGray-400 mt-1"
                        >
                          智能合约: {data.contract}
                        </a> */}

                        <span className="text-xs font-semibold inline-block py-1 px-2  rounded text-emerald-600 bg-emerald-200 mr-2">
                          已领取/总数: {nftDetail.claimedCount} /{" "}
                          {nftDetail.nftCount}
                        </span>

                        {nftDetail.key && (
                          <span className="mt-2 text-xs font-semibold inline-block py-1 px-2  rounded text-orange-600 bg-orange-200">
                            {nftDetail.tag}
                          </span>
                        )}
                      </blockquote>
                      <img
                        alt=""
                        ref={imgRef}
                        src={nftDetail.imgUrl}
                        className="object-cover my-4 h-64 w-full align-middle"
                      />
                      <p className="text-md font-light my-2 text-blueGray-600">
                        {nftDetail.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

NFTDetail.defaultProps = {
  data: fakeData[0],
  tag: "dedrops",
};

NFTDetail.layout = MainLayout;
