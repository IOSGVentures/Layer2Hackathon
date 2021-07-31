// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @dev Interface of the ACGNFT minter
 */
interface ICentralAdminControl {
    function isAdmin(address account) external view returns (bool);
}
