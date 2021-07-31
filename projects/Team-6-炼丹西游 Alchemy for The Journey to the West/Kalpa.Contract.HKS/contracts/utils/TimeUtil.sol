// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract TimeUtil {
    uint256 private constant blockPerSec = 2;
    using SafeMath for uint256;

    function blocksFromCurrent(uint256 targetTime) internal view returns (uint256) {
        return toBlocks(targetTime.sub(block.timestamp));
    }

    function blocksFromBegin(uint256 targetTime) internal view returns (uint256) {
        return blocksFromCurrent(targetTime).add(block.number);
    }

    function toBlocks(uint256 diffTime) internal pure returns (uint256) {
        return diffTime.mul(blockPerSec);
    }
}
