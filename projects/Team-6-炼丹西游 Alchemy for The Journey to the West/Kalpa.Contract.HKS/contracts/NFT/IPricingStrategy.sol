// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @dev Interface of the ACGNFT minter
 */
interface IPricingStrategy {
    /**
     * @dev calculate card price by picked count
     */
    function getNextCardPrice(uint256 releaseCount) external view returns (uint256);

    /**
     * @dev calculate card price by picked count
     */
    function moveNext() external;

    function reset(uint startBlock) external;
}
