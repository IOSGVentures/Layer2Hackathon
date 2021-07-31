/* eslint-disable react/jsx-no-target-blank */
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

import CardNFTItem from "components/Cards/CardNFTItem";
import MainLayout from "layouts/main";

import { NFTMintContract, Bank1155Contract } from "libs/contracts";
import { useWeb3React } from "@web3-react/core";

import _ from "lodash";

import { AirdropContract } from "libs/contracts";

import { Airdrop as AirdropContractABI } from "constans/abi/Airdrop";
import useContract from "hooks/useContract";
import { DeDropsNFT as mintContractABI } from "constans/abi/DeDropsNFT";

import { Bank1155 as Bank1155ABI } from "constans/abi/Bank1155";
import { parseBN } from "libs/web3Util";

export default function AirdropDetail() {
  const { library, account } = useWeb3React();

  const airdropDetailInitInfoState = {
    name: "",
  };

  const airdropDetailInitInfo2State = {};

  const [airdropDetail, setAirdropDetail] = useState({
    ...airdropDetailInitInfoState,
    ...airdropDetailInitInfo2State,
  });

  const router = useRouter();

  const airdropID = router.query.id;

  // airdrop contract instance
  const AirdropContractInstance = useContract(
    AirdropContract,
    AirdropContractABI,
    account
  );

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

    // nft 已领取数量
    let claimedCount = await bank1155Contract.tokenUserBalance(
      NFTMintContract,
      nftID,
      account
    );

    // console.log("claimedCount", parseBN(claimedCount));
    claimedCount = parseBN(claimedCount);

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

  // get airdrop detail

  async function getAirdropDetail(id) {
    const airdropData = await AirdropContractInstance.idToItem(id);

    // console.log("airdropData", id, airdropData);

    try {
      const airdropDataInfo = airdropData.info
        ? JSON.parse(airdropData.info)
        : airdropDetailInitInfoState;
      const airdropDataInfo2 = airdropData.info2
        ? JSON.parse(airdropData.info2)
        : airdropDetailInitInfo2State;

      console.log("airdrop-", id, {
        id: id,
        ...airdropDataInfo,
        ...airdropDataInfo2,
      });

      setAirdropDetail({
        id: id,
        ...airdropDataInfo,
        ...airdropDataInfo2,
      });

      return {
        id: id,
        ...airdropDataInfo,
        ...airdropDataInfo2,
      };
    } catch (e) {
      console.log("error");
    }
  }

  // get airdrop detail data
  useEffect(() => {
    if (AirdropContractInstance) {
      getAirdropDetail(airdropID);
    }
  }, [airdropID, AirdropContractInstance]);

  // get nft list
  useEffect(() => {
    (async () => {
      if (nftContract) {
        // console.log(nftContract);

        if (
          airdropDetail &&
          airdropDetail.condition &&
          airdropDetail.condition.length > 0
        ) {
          for (const i of airdropDetail.condition) {
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
  }, [airdropDetail]);

  return (
    <>
      <div className="flex pt-32 flex-wrap bg-white">
        {airdropDetail && airdropDetail.airdrop ? (
          <div className="w-full px-12">
            <h4 className="text-xl font-bold text-blueGray-600">
              {airdropDetail.name}
            </h4>

            <p className="text-md text-blueGray-500 font-bold my-4">
              空投时间:{airdropDetail.airdrop.startTime}~
              {airdropDetail.airdrop.endTime}
            </p>
            <p className="text-md text-blueGray-500 font-bold my-4">
              空投描述:{airdropDetail.desc}
            </p>
            {/* <p className="text-md text-blueGray-500 font-bold my-4">
            空投 Token 名称:
          </p> */}
            <p className="text-md text-blueGray-500 font-bold my-4">
              空投 Token 合约:
              <a
                href={`https://polygonscan.com/address/${airdropDetail.airdrop.token}`}
                target="__blank"
                className="ml-2 text-xs font-semibold inline-block py-1 px-2  rounded text-emerald-600 bg-emerald-200 mr-2"
              >
                {airdropDetail.airdrop.token}
              </a>
            </p>
            <p className="text-md text-blueGray-500 font-bold my-4">
              已领取/空投总量:{airdropDetail.airdrop.tokenAmount}
            </p>
            <p className="text-md text-blueGray-500 font-bold my-4">
              空投地址数:{airdropDetail.airdrop.tokenClaimableCount}
            </p>

            <hr className="my-6 border-b-1 border-blueGray-200" />

            <h4 className="text-lg font-bold text-blueGray-600">
              空投领取条件
            </h4>
            <p className="text-sm text-blueGray-500 font-bold my-4">
              持有以下NFT的地址才可以领取空投
            </p>
            <div className="flex flex-wrap py-8">
              {nftDetailList.map((item) => (
                <CardNFTItem data={item} />
              ))}
            </div>

            <div className="w-full my-6 px-4">
              <div className="relative w-full mb-3 px-12">
                <button
                  className="bg-emerald-500 text-white block mr-1active:bg-emerald-500 font-bold uppercase text-lg px-12 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                  type="button"
                >
                  领取
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="my-32 mx-auto max-w-sm text-center relative z-50 top-0">
            <div className="block mb-4">
              <i className="fas fa-circle-notch animate-spin text-blueGray-400 mx-auto text-6xl"></i>
            </div>
            <h4 className="text-lg font-medium text-blueGray-400">
              Loading...
            </h4>
          </div>
        )}
      </div>
    </>
  );
}

AirdropDetail.layout = MainLayout;
