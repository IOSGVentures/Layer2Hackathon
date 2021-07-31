// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../access/AdminAccessable.sol";
import "../utils/EzSponsor.sol";
import "./IPricingStrategy.sol";

contract DutchPricing is AdminAccessable, EzSponsor, IPricingStrategy {
    address public operator;

    uint256 private _startPrice;
    uint256 private _dropPerBlock;
    uint256 private _offset;
    uint256 private _raisePerOffset;
    uint256 private _lastBlock;

    constructor(address operator_, ICentralAdminControl adminControl_) AdminAccessable(adminControl_) {
        operator = operator_;
    }

    function setOperator(address operator_) external onlyAdmin {
        operator = operator_;
    }

    /**
     * @dev update the card price
     */
    function updateParameters(
        uint256 startPrice_,
        uint256 dropPerBlock_,
        uint256 raisePerOffset_
    ) external onlyAdmin {
        _startPrice = startPrice_;
        _dropPerBlock = dropPerBlock_;
        _raisePerOffset = raisePerOffset_;
    }

    function getParameters()
        external
        view
        returns (
            uint256 startPrice,
            uint256 dropPerBlock,
            uint256 offset,
            uint256 raisePerOffset,
            uint256 lastBlock
        )
    {
        startPrice = _startPrice;
        dropPerBlock = _dropPerBlock;
        offset = _offset;
        raisePerOffset = _raisePerOffset;
        lastBlock = _lastBlock;
    }

    /**
     * @dev calculate card price by picked count
     */
    function getNextCardPrice(uint256 releaseCount) external view override returns (uint256) {
        if (_lastBlock >= block.number) return _startPrice;
        uint256 diff = _dropPerBlock * (block.number - _lastBlock);
        uint256 startPrice = _startPrice + releaseCount * _raisePerOffset;
        unchecked {
            return startPrice > diff ? startPrice - diff : 0;
        }
    }

    /**
     * @dev calculate card price by picked count
     */
    function moveNext() external override onlyOperator {
        _lastBlock = block.number;
    }

    function reset(uint256 targetBlock) external override onlyOperator {
        _lastBlock = targetBlock;
    }

    modifier onlyOperator() {
        require(msg.sender == operator, "Should call from operator");
        _;
    }
}
