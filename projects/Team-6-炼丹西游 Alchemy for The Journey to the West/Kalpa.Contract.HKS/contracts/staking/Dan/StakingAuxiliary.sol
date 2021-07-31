// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./StakingBase2.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract StakingAuxiliary {
    using Math for uint256;

    function poolInfoBatch(
        address contractAddress,
        uint256 offset,
        uint256 limit
    )
        public
        view
        returns (
            uint256 count,
            address[] memory tokenAddr,
            uint256[] memory fivePharse,
            uint256[] memory fiveParseNext,
            uint256[] memory stakingFactor,
            uint256[] memory totalStaked
        )
    {
        StakingBase2 stakingBase = StakingBase2(contractAddress);
        uint256 poolCount = stakingBase.poolCount();

        if (offset + limit > poolCount) count = poolCount - offset;
        else count = limit;
        tokenAddr = new address[](count);
        fivePharse = new uint256[](count);
        fiveParseNext = new uint256[](count);
        stakingFactor = new uint256[](count);
        totalStaked = new uint256[](count);
        for (uint256 index = 0; index < count; ++index) {
            address tokenAddress = stakingBase.poolAddressAt(index);
            tokenAddr[index] = tokenAddress;
            (fivePharse[index], fiveParseNext[index], stakingFactor[index], totalStaked[index]) = stakingBase.poolInfo(tokenAddress);
        }
    }

    function stakingInfoBatch(
        address contractAddress,
        address account,
        address[] memory tokenAddresses
    )
        public
        view
        returns (
            uint256[] memory stakings,
            uint256[] memory balances,
            uint256[] memory allowances
        )
    {
        StakingBase2 stakingBase = StakingBase2(contractAddress);
        uint256 count = tokenAddresses.length;
        stakings = new uint256[](count);
        balances = new uint256[](count);
        allowances = new uint256[](count);
        for (uint256 index = 0; index < count; ++index) {
            address tokenAddress = tokenAddresses[index];
            if (tokenAddress == stakingBase.cfxAddress()) {
                stakings[index] = stakingBase.userStakedBalance(account, tokenAddress);
                balances[index] = allowances[index] = account.balance;
            } else {
                IERC20 iERC20 = IERC20(tokenAddress);
                stakings[index] = stakingBase.userStakedBalance(account, tokenAddress);
                balances[index] = iERC20.balanceOf(account);
                allowances[index] = iERC20.allowance(account, contractAddress);
            }
        }
    }

    function stakingDetail(address contractAddress, address account)
        external
        view
        returns (
            uint256 stakingPoints,
            uint256 totalStaked,
            uint256 estimateBlockPerDan,
            bool isInCurrentPeriod,
            address[] memory tokenAddr,
            uint256[] memory stakings,
            uint256[] memory balances,
            uint256[] memory allowances
        )
    {
        StakingBase2 stakingBase = StakingBase2(contractAddress);
        (stakingPoints, totalStaked, estimateBlockPerDan, isInCurrentPeriod) = stakingBase.stakingInfo(account);
        uint256 stakedPoolCount = stakingBase.stakedPoolCount(account);
        tokenAddr = new address[](stakedPoolCount);
        stakings = new uint256[](stakedPoolCount);
        balances = new uint256[](stakedPoolCount);
        allowances = new uint256[](stakedPoolCount);
        for (uint256 index = 0; index < stakedPoolCount; ++index) tokenAddr[index] = stakingBase.stakedPoolAddressByIndex(account, index);
        (stakings, balances, allowances) = stakingInfoBatch(contractAddress, account, tokenAddr);
    }

    function poolDetail(address contractAddress)
        external
        view
        returns (
            uint256 totalStakingPoints,
            uint256 count,
            address[] memory tokenAddr,
            uint256[] memory fivePharse,
            uint256[] memory fiveParseNext,
            uint256[] memory stakingFactor,
            uint256[] memory totalStaked
        )
    {
        StakingBase2 stakingBase = StakingBase2(contractAddress);
        uint256 periodeCount = stakingBase.periodeCount();
        if (periodeCount > 0) (, , , totalStakingPoints, , ) = stakingBase.periods(periodeCount - 1);
        (count, tokenAddr, fivePharse, fiveParseNext, stakingFactor, totalStaked) = poolInfoBatch(contractAddress, 0, stakingBase.poolCount());
    }
}
