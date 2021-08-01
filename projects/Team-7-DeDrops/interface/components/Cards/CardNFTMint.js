import React, { useRef, useState } from "react";

import { mintConditions } from "libs/nftConfig";
import { NFTMintContract } from "libs/contracts";
import { useWeb3React } from "@web3-react/core";

import _ from "lodash";

import useContract from "hooks/useContract";
import { DeDropsNFT as mintContractABI } from "constans/abi/DeDropsNFT";
import { big, toAmount } from "libs/web3Util";

// components

export default function CardNFTMint() {
  const { library, account } = useWeb3React();

  const nftName = useRef();
  const nftCount = useRef();
  const nftImgUrl = useRef();
  const nftDesc = useRef();

  // 链上条件
  const nftOnChainConCheckbox = useRef();

  const nftOnChainCon = useRef();

  // 条件最小值
  const nftOnChainConCount = useRef();

  // 链上资产
  const nftMoneyCheckbox = useRef();

  const nftMoney = useRef();

  // on-chain action conditions
  const [onChainCon, setOnChainCon] = useState([]);

  // mint contract instance
  const mintContract = useContract(NFTMintContract, mintContractABI, account);

  const handleSubmit = async () => {
    const mintInfo = {
      name: nftName.current.value,
      imgUrl: nftImgUrl.current.value,
      desc: nftDesc.current.value,
      nftCount: nftCount.current.value,
    };

    const condition = {
      actions: nftOnChainConCheckbox.current.checked ? onChainCon : null,
      money: nftMoneyCheckbox.current.checked ? nftMoney.current.value : 0,
    };

    console.log(mintInfo);

    // console.log(nftOnChainConCheckbox.current.checked);

    console.log(condition);

    // 要上链的数据
    const data = {
      amount: nftCount,
      info: mintInfo,
      info2: condition,
    };

    console.log(data);

    // 提交上链
    const res = await mintContract.mint(
      toAmount(nftCount.current.value),
      JSON.stringify(mintInfo),
      JSON.stringify(condition)
    );
    console.log(res);

    if (res.hash) {
      window.alert("提交成功,等待上链...");
    }
  };

  const handleAddOnChainAction = () => {
    console.log(nftOnChainCon.current.value);

    onChainCon.push({
      key: nftOnChainCon.current.value,
      count: nftOnChainConCount.current.value,
    });

    const newOnChainCon = _.unionBy(onChainCon, (item) => item.key);

    console.log("newOnChainCon", newOnChainCon);
    setOnChainCon(newOnChainCon);
  };

  const handleRemoveOnChainAction = (key) => {
    console.log(key);
    _.remove(onChainCon, (item) => item.key === key);
    setOnChainCon([...onChainCon]);
  };

  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6  rounded-lg bg-blueGray-100 border-0">
        <div className="rounded-t  mb-0 px-6 py-6">
          <div className="text-center flex justify-between">
            <h6 className="text-blueGray-700 text-xl font-bold">铸造 NFT</h6>
          </div>
        </div>
        <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
          <form>
            {/* NFT 信息 */}
            <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
              NFT 信息
            </h6>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-8/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    NFT 名称
                  </label>
                  <input
                    ref={nftName}
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
                    NFT 图片
                  </label>
                  <input
                    ref={nftImgUrl}
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
                    NFT 描述
                  </label>
                  <textarea
                    ref={nftDesc}
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
                  NFT 铸造数量
                </label>
                <input
                  ref={nftCount}
                  type="text"
                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                />
              </div>
            </div>

            <hr className="mt-6 border-b-1 border-blueGray-300" />

            {/* 空投地址 */}
            <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
              NFT申领条件
            </h6>
            <div className="flex flex-wrap">
              <div className="w-full px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-sm font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    <input
                      ref={nftOnChainConCheckbox}
                      type="checkbox"
                      className="appearance-none checked:bg-blue-600 checked:border-transparent mr-2"
                    ></input>
                    选择参与过的链上活动
                  </label>

                  <div className="flex items-center">
                    <div className="md:w-6/12">
                      <select
                        ref={nftOnChainCon}
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      >
                        {mintConditions.map((item) => (
                          <option key={item.key} value={item.key}>
                            {item.text}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:w-2/12 px-4 flex items-center">
                      <input
                        ref={nftOnChainConCount}
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        placeholder="至少交易次数"
                        defaultValue="1"
                      />
                      <span className="px-2">次</span>
                    </div>

                    <div className="md:w-2/12 px-4">
                      <button
                        onClick={handleAddOnChainAction}
                        className="bg-blueGray-600 text-white active:bg-blueGray-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                        type="button"
                      >
                        添加
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap">
              <div className="w-full lg:w-12/12 px-4">
                <div className="relative w-full mb-3">
                  <ul className="border border-blueGray-200 rounded-md divide-y divide-gray-200">
                    {onChainCon.map((item) => (
                      <li
                        key={item.key}
                        className="pl-3 pr-4 py-3 flex items-center justify-between text-sm"
                      >
                        <div className="w-0 flex-1 flex items-center">
                          <span className="ml-2 flex-1 w-0 truncate">
                            {_.find(mintConditions, { key: item.key }).text}
                            ，至少 {item.count} 次
                          </span>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <button
                            onClick={() => handleRemoveOnChainAction(item.key)}
                            className="bg-red-500 text-white active:bg-red-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                            type="button"
                          >
                            删除
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            {/* end: 参与过的链上活动 */}

            <div className="flex flex-wrap">
              <div className="w-full px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-sm font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    <input
                      ref={nftMoneyCheckbox}
                      type="checkbox"
                      className="appearance-none checked:bg-blue-600 checked:border-transparent mr-2"
                    ></input>
                    链上资产
                  </label>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-4/12 px-4">
                <div className="relative w-full mb-3 ">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="grid-password"
                  >
                    地址上的资产总额
                  </label>
                  <div className="flex  items-center">
                    <input
                      ref={nftMoney}
                      type="text"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="主流资产总额"
                    />

                    <span className="px-2">USD</span>
                  </div>
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
                  铸造
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
