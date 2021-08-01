/* eslint-disable react/jsx-no-target-blank */
import React, { useEffect, useState } from "react";
import Link from "next/link";

import NFTTabs from "components/Tabs/NFTTabs";
import CardNFTItem from "components/Cards/CardNFTItem";
import MainLayout from "layouts/Main";

import { NFTMintContract, Bank1155Contract } from "libs/contracts";
import { useWeb3React } from "@web3-react/core";

import _ from "lodash";

import useContract from "hooks/useContract";
import { DeDropsNFT as mintContractABI } from "constans/abi/DeDropsNFT";

import { Bank1155 as Bank1155ABI } from "constans/abi/Bank1155";
import { parseBN } from "libs/web3Util";

export default function NftList() {
  const { library, account } = useWeb3React();

  const [openTab, setOpenTab] = React.useState("all");

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

  const [nftDetailList, setNftDetailList] = useState([]);

  // mint contract instance
  const nftContract = useContract(NFTMintContract, mintContractABI, account);

  // bank 1155 contract instance
  const bank1155Contract = useContract(Bank1155Contract, Bank1155ABI, account);

  async function getNftDetail(nftID) {
    const nftData = await nftContract.idToItem(nftID);

    // console.log("nftData", nftID, nftData);
    const nftDataInfo = nftData.info
      ? JSON.parse(nftData.info)
      : nftDetailInitInfoState;
    const nftDataCondition = nftData.info2
      ? JSON.parse(nftData.info2)
      : nftDetailInitInfo2State;

    let claimableCount = await nftContract.balanceOf(Bank1155Contract, nftID);

    // nft 已领取数量
    let claimedCount = nftDataInfo.nftCount - claimableCount;

    if (nftDataInfo.imgUrl === "") {
      nftDataInfo.imgUrl =
        "https://miro.medium.com/max/1400/1*PfyeIplM0nkWwiGgkrYCUQ.png";
    }

    console.log(nftID, {
      ...nftDataInfo,
      ...nftDataCondition,
      claimedCount,
    });

    if (nftData.info === "" || nftData.info2 === "") {
      // 信息不全，不显示
      return;
    } else {
      return {
        id: nftID,
        ...nftDataInfo,
        ...nftDataCondition,
        claimedCount,
      };
    }
  }

  const renderTabsContent = (tabKey) => {
    console.log(nftDetailList);
    if (tabKey === "all") {
      return nftDetailList.map((data) => (
        <CardNFTItem key={data.id} data={data} />
      ));
    } else {
      const tagList = nftDetailList.filter((data) => data.key === tabKey);
      return tagList.map((data) => <CardNFTItem key={data.id} data={data} />);
    }
  };

  useEffect(() => {
    (async () => {
      if (nftContract) {
        // console.log(nftContract);
        let nftCount = await nftContract.length();
        nftCount = parseBN(nftCount);
        console.log("nftCount", nftCount);

        if (nftCount > 0) {
          for (const i of _.range(1, nftCount + 1)) {
            console.log("nft ", i);
            const detail = await getNftDetail(i);
            if (detail) {
              nftDetailList.push(detail);
              // setNftDetailList([...nftDetailList, detail]);
            }
          }

          console.log("nftDetailList", nftDetailList);

          setNftDetailList([...nftDetailList]);
        }
      }
    })();
  }, [nftContract, account]);

  return (
    <>
      <section className="header relative pt-24 items-center flex">
        <div className="container mx-auto items-center flex flex-wrap">
          <div className="w-full px-4">
            <NFTTabs openTab={openTab} handleSetOpenTab={setOpenTab} />

            <div className="relative flex flex-col min-w-0 break-words  w-full mb-24  rounded">
              <div className="flex-auto">
                <div className="tab-content tab-space">
                  <div className="flex flex-wrap">
                    {/* loading */}
                    {nftDetailList.length === 0 && (
                      <div className="my-32 mx-auto max-w-sm text-center relative z-50 top-0">
                        <div className="block mb-4">
                          <i className="fas fa-circle-notch animate-spin text-blueGray-400 mx-auto text-6xl"></i>
                        </div>
                        <h4 className="text-lg font-medium text-blueGray-400">
                          Loading...
                        </h4>
                      </div>
                    )}

                    {renderTabsContent(openTab)}
                  </div>
                  {/* {renderTabsContent(openTab, setOpenTab)} */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-center bg-white rounded-lg py-4 px-12 relative z-10">
            <div className="w-full text-center lg:w-8/12">
              <p className="text-4xl text-center mb-2">
                <span role="img" aria-label="love">
                  😍
                </span>
              </p>
              <h3 className="font-semibold text-3xl">来尝试下铸造 NFT？</h3>
              <p className="text-blueGray-500 text-lg leading-relaxed mt-4 mb-4">
                任何人都可以用 DeDrops 一键铸造 NFT！
              </p>
              <div className="sm:block flex flex-col mt-10">
                <Link href="/nft/mint">
                  <span className="cursor-pointer github-star sm:ml-1 text-white font-bold px-6 py-4 rounded outline-none focus:outline-none mr-1 mb-1 bg-blueGray-700 active:bg-blueGray-600 text-sm shadow hover:shadow-lg">
                    <span>Mint It!</span>
                  </span>
                </Link>
              </div>
              <div className="text-center mt-16"></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

NftList.layout = MainLayout;
