// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @dev Interface of the ACGNFT minter
 */
interface IConsumable {
    function consume(address account, uint256 amount) external;
}
