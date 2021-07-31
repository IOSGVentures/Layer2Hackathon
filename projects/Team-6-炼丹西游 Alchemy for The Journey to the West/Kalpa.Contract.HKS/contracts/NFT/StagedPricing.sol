// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../access/AdminAccessable.sol";
import "../utils/EzSponsor.sol";
import "./IPricingStrategy.sol";

contract StagedPricing is AdminAccessable, EzSponsor, IPricingStrategy {
    uint24[] private _counts;
    uint256[] private _prices;

    constructor(ICentralAdminControl adminControl_) AdminAccessable(adminControl_) {}

    /**
     * @dev update the card price
     */
    function updateCardPrices(uint24[] calldata counts_, uint256[] calldata prices_) external onlyAdmin {
        require(counts_.length == prices_.length, "counts length not equal to prices length.");
        require(counts_.length > 0, "Needs 1 series at least.");
        require(counts_[0] == 0, "The first release count must be 0.");
        _counts = counts_;
        _prices = prices_;
    }

    function getCardPrices() external view returns (uint24[] memory counts, uint256[] memory prices) {
        counts = _counts;
        prices = _prices;
    }

    /**
     * @dev calculate card price by picked count
     */
    function getNextCardPrice(uint256 releaseCount) external view override returns (uint256) {
        uint256 count = _counts.length;
        for (uint256 index = count - 1; ; --index) {
            if (_counts[index] <= releaseCount) return _prices[index];
        }
        return 0;
    }

    /**
     * @dev calculate card price by picked count
     */
    function moveNext() external pure override {}

    function reset(uint targetBlock) external pure override {}
}
