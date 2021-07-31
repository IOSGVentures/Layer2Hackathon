// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
* @title IOSG USDT price
*/
contract USDTPrice {

    AggregatorV3Interface internal priceFeed;

    /**
    * @dev 部署合约
    * @param _USDTAddr USDT代理地址
    */
    constructor (AggregatorV3Interface _USDTAddr){
        priceFeed = _USDTAddr;
    }

    /**
    * @dev 获取USDT价格
    */
    function getLatestUSDTPrice() public view returns (int256) {
        (,int price,,uint timeStamp,
        ) = priceFeed.latestRoundData();
        require(timeStamp > 0, "Round not complete");
        return price;
    }
}
