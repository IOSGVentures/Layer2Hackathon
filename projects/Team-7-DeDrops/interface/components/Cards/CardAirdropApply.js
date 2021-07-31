import React, { useEffect, useRef, useState } from "react";
import _ from "lodash";

import { AirdropContract } from "libs/contracts";
import { useWeb3React } from "@web3-react/core";

import useContract from "hooks/useContract";
import { Airdrop as AirdropABI } from "constans/abi/Airdrop";
import { IERC20 as IERC20ABI } from "constans/abi/IERC20";
import { toAmount, toNum, parseUnit } from "libs/web3Util";
import getContract from "libs/getContract";

import { NFTMintContract, Bank1155Contract } from "libs/contracts";

import { DeDropsNFT as mintContractABI } from "constans/abi/DeDropsNFT";

import { Bank1155 as Bank1155ABI } from "constans/abi/Bank1155";
import { parseBN } from "libs/web3Util";

// components

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

export default function CardSettings() {
  const { library, account } = useWeb3React();

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

        // setNftDetail({
        //   ...nftDataInfo,
        //   ...nftDataCondition,
        //   claimedCount,
        // });
      }
    })();
  }, [nftContract, account]);

  // nft conditions
  const [nftCon, setNftCon] = useState([]);

  // 空投活动名称
  const nameRef = useRef();

  // 空投活动图片
  const imgUrlRef = useRef();

  // 空投活动描述
  const descRef = useRef();

  // 空投项目网址
  const websiteRef = useRef();

  // 空投项目twitter
  const twitterRef = useRef();

  // 空投项目telegram
  const telegramRef = useRef();

  // 空投 token 地址
  const tokenAddrRef = useRef();

  // 空投 token 数量
  const tokenAmountRef = useRef();

  // nft 条件
  const nftConRef = useRef();

  // 空投 token 可领取的地址数量
  const tokenClaimableCountRef = useRef();

  // 空投开始时间
  const startTimeRef = useRef();

  // 空投结束时间
  const endTimeRef = useRef();

  // airdrop contract instance
  const airdropContractIns = useContract(AirdropContract, AirdropABI, account);

  const handleSubmit = async () => {
    const info = {
      name: nameRef.current.value,
      imgUrl: imgUrlRef.current.value,
      desc: descRef.current.value,
      website: websiteRef.current.value,
      twitter: twitterRef.current.value,
      telegram: telegramRef.current.value,
    };

    // 空投地址条件: 满足 nft id list
    const condition = nftCon;

    const airdrop = {
      token: tokenAddrRef.current.value,
      tokenAmount: tokenAmountRef.current.value,
      tokenClaimableCount: tokenClaimableCountRef.current.value,
      startTime: startTimeRef.current.value,
      endTime: endTimeRef.current.value,
    };

    // const mintInfo = {
    //   name: nftName.current.value,
    //   imgUrl: nftImgUrl.current.value,
    //   desc: nftDesc,
    //   nftCount: nftCount.current.value,
    // };
    // const condition = {
    //   actions: nftOnChainConCheckbox.current.checked ? onChainCon : null,
    //   money: nftMoneyCheckbox.current.checked ? nftMoney.current.value : 0,
    // };
    // console.log(mintInfo);
    // // console.log(nftOnChainConCheckbox.current.checked);
    // console.log(condition);
    // // 要上链的数据
    // const data = {
    //   amount: nftCount,
    //   info: mintInfo,
    //   info2: condition,
    // };
    // erc20 contrasct instance
    const erc20ContractIns = getContract(
      tokenAddrRef.current.value,
      IERC20ABI,
      account,
      library
    );
    // console.log(erc20ContractIns);

    const allowance = await erc20ContractIns.allowance(
      account,
      AirdropContract
    );

    console.log("allowance", toNum(allowance));
    console.log("tokenAmount", toNum(airdrop.tokenAmount));

    if (toNum(allowance) >= toNum(airdrop.tokenAmount)) {
      console.log(
        tokenAddrRef.current.value,
        toAmount(airdrop.tokenAmount, 18),
        JSON.stringify(info),
        JSON.stringify({ airdrop, condition })
      );

      // return;
      // 提交上链
      const res = await airdropContractIns.drop(
        tokenAddrRef.current.value,
        toAmount(airdrop.tokenAmount, 18),
        JSON.stringify(info),
        JSON.stringify({ airdrop, condition })
      );

      console.log(res);
      if (res.hash) {
        window.alert("提交成功,等待上链...");
      }
    } else {
      // approve token
      const resApprove = await erc20ContractIns.approve(
        AirdropContract,
        parseUnit(airdrop.tokenAmount)
      );

      console.log(resApprove);
      // window.alert("提交成功,等待上链...");

      if (resApprove.hash) {
        window.alert("提交成功,等待上链...");
      }
    }
  };

  const handleAddNtfCon = () => {
    const newNftConItem = nftConRef.current.value;

    nftCon.push(newNftConItem);

    const newNtfCon = _.union(nftCon, newNftConItem);

    console.log("newNtfCon", newNtfCon);
    setNftCon(newNtfCon);
  };

  const handleRemoveNftCon = (key) => {
    console.log(key);
    _.remove(nftCon, (item) => item === key);
    setNftCon([...nftCon]);
  };

  //平均每个地址获得空投TOKEN 数量
  const perAddrToken = () => {
    try {
      let tokenAmount = Number(tokenAmountRef.current.value);
      let tokenClaimableCount = Number(tokenClaimableCountRef.current.value);
      console.log("perAddrToken", tokenAmount / tokenClaimableCount);
      return tokenAmount / tokenClaimableCount;
    } catch (e) {
      console.log("perAddrToken error");
      return "";
    }
  };

  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6  rounded-lg bg-blueGray-100 border-0">
        <div className="rounded-t  mb-0 px-6 py-6">
          <div className="text-center flex justify-between">
            <h6 className="text-blueGray-700 text-xl font-bold">发起空投</h6>
          </div>
        </div>
        <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
          <form>
            {/* 空投项目信息 */}
            <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
              空投项目信息
            </h6>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-8/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    空投活动名称
                  </label>
                  <input
                    ref={nameRef}
                    type="text"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap">
              <div className="w-full lg:w-8/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    空投活动图片
                  </label>
                  <input
                    ref={imgUrlRef}
                    type="text"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap">
              <div className="w-full lg:w-8/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    空投活动描述
                  </label>
                  <textarea
                    ref={descRef}
                    type="text"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    rows="4"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label
                  className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                  htmlFor="grid-password"
                >
                  空投项目网址
                </label>
                <input
                  ref={websiteRef}
                  type="text"
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                />
              </div>
            </div>

            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label
                  className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                  htmlFor="grid-password"
                >
                  空投项目 Twitter
                </label>
                <input
                  ref={twitterRef}
                  type="text"
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                />
              </div>
            </div>

            <div className="w-full lg:w-6/12 px-4">
              <div className="relative w-full mb-3">
                <label
                  className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                  htmlFor="grid-password"
                >
                  空投项目 Telegram
                </label>
                <input
                  ref={telegramRef}
                  type="text"
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                />
              </div>
            </div>
            <hr className="mt-6 border-b-1 border-blueGray-300" />

            {/* 空投地址 */}
            <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
              空投地址条件
            </h6>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-8/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    选择持有以下 NFT 的地址，作为空投的目标地址
                  </label>
                  <select
                    ref={nftConRef}
                    disabled={nftDetailList.length === 0 ? true : false}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  >
                    {nftDetailList.length > 0 ? (
                      nftDetailList.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} (已领取/总数: {item.claimedCount} /{" "}
                          {item.nftCount})
                        </option>
                      ))
                    ) : (
                      <option>Loading...</option>
                    )}
                  </select>
                </div>
              </div>
              <div className="w-full mt-6 lg:w-4/12 px-4">
                <div className="relative w-full mb-3">
                  <button
                    onClick={handleAddNtfCon}
                    className="bg-blueGray-600 text-white active:bg-blueGray-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                  >
                    添加
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap">
              <div className="w-full lg:w-12/12 px-4">
                <div className="relative w-full mb-3">
                  <ul className="border border-blueGray-200 rounded-md divide-y divide-gray-200">
                    {nftDetailList.length > 0 &&
                      nftCon.map((id) => {
                        const target = _.find(
                          nftDetailList,
                          (item) => item.id.toString() === id
                        );

                        console.log(target, nftCon, nftDetailList);

                        return (
                          <li
                            key={id}
                            className="pl-3 pr-4 py-3 flex items-center justify-between text-sm"
                          >
                            <div className="w-0 flex-1 flex items-center">
                              <span className="ml-2 flex-1 w-0 truncate">
                                {target.name}
                                (已领取/总数: {target.claimedCount}/
                                {target.nftCount})
                              </span>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <button
                                onClick={() => handleRemoveNftCon(id)}
                                className="bg-red-500 text-white active:bg-red-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                type="button"
                              >
                                删除
                              </button>
                            </div>
                          </li>
                        );
                      })}
                  </ul>

                  {/* <h6
                    className="mt-4 block text-blueGray-600 text-sm font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    可空投地址总数: 200
                  </h6> */}
                </div>
              </div>
            </div>

            <hr className="mt-6 border-b-1 border-blueGray-300" />

            <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
              空投信息
            </h6>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-12/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    空投 Token 合约地址
                  </label>
                  <input
                    ref={tokenAddrRef}
                    type="text"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    defaultValue="0x67a32987a8eaa0644702c362b53b8eebd126c20b"
                  />
                </div>
              </div>

              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    可领取空投地址数
                  </label>
                  <input
                    ref={tokenClaimableCountRef}
                    type="text"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  />
                </div>
              </div>
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3"></div>
              </div>

              {/* <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    平均每个地址获得空投Token 数量
                  </label>
                  <input
                    type="text"
                    disabled="disabled"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-blueGray-200 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    defaultValue={perAddrToken}
                  />
                </div>
              </div> */}

              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    空投Token 数量
                  </label>
                  <input
                    ref={tokenAmountRef}
                    type="text"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  />
                </div>
              </div>

              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3"></div>
              </div>

              <div className="w-full lg:w-4/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    空投开始时间
                  </label>
                  <input
                    ref={startTimeRef}
                    type="date"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    defaultValue="United States"
                  />
                </div>
              </div>
              <div className="w-full lg:w-4/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    空投结束时间
                  </label>
                  <input
                    ref={endTimeRef}
                    type="date"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    defaultValue="Postal Code"
                  />
                </div>
              </div>
            </div>
            <hr className="mt-6 border-b-1 border-blueGray-300" />

            <div className="w-full mt-6 lg:w-4/12 px-4">
              <div className="relative w-full mb-3">
                <button
                  onClick={handleSubmit}
                  className="bg-blueGray-700 text-white active:bg-blueGray-600 font-bold uppercase text-lg px-12 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                  type="button"
                >
                  提交
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
