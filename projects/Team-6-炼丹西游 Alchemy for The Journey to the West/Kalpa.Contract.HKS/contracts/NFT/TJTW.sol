// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "../access/AdminAccessable.sol";
import "../interfaces/IConsumable.sol";
import "../utils/EzSponsor.sol";
import "./DCRCL1155.sol";
import "./IPricingStrategy.sol";

contract TJTW is AdminAccessable, EzSponsor {
    using EnumerableSet for EnumerableSet.UintSet;
    using EnumerableSet for EnumerableSet.AddressSet;

    event PickCard(address indexed operator, uint256 nftId);

    string _seriesUri;

    /**
     * @dev A series stands for a character
     */
    struct Series {
        uint16[] cardCount; // count of each rarity, eg: [95, 5, 1] means 95 common, 5 rare and 1 super rare
        uint24 total; // sum of cards
        uint24 availables; // rest cards
        uint24 totalMints; // total mint counts
        uint24 minted; // rest pickable cards
        string name;
    }

    /**
     * @dev A pool is a pickable unit
     */
    struct Pool {
        uint256 poolOpen; // indicate this pool is availe during which period. See poolPeriod.
        uint16[] seriesIds; // series index in this pool
        uint24 nftIdxBegin; // beginning id of total nftId
        uint24 total; // total count of nfts
        uint24 availables; // rest card count
        bool isEnabled; // additional control for the pool
        string name;
    }

    /**
     * @dev A FNFT store information about the card
     */
    struct FNFT {
        uint16 seriesId; // this card belonged series index
        uint8 cardId; // in-series rarety index
        bool isForged; // forged mark
        bool isPicked; // picked mark
    }
    // contains last picked card index
    mapping(address => uint256) private _lastPick;

    // all series
    Series[] private _series;

    // indicate unused series index, in case of series reuse
    EnumerableSet.UintSet _setUnusedSeriesIdx;

    // all card infomation
    FNFT[] private _nfts;
    mapping(uint256 => uint256) private _nftIdMapping;

    // determine forge rule index
    mapping(bytes32 => uint256) private _forgeHashIdx;

    // initial random salt
    uint256 private _randomSalt = 0;

    // all pools
    Pool[] private _pools;

    IConsumable private _consumable;
    DCRCL1155 private _dcrcl;
    IPricingStrategy private _pricingStrategy;

    constructor(
        uint256 randomSalt,
        ICentralAdminControl adminControl_,
        IConsumable consumable_,
        DCRCL1155 dcrcl_
    ) AdminAccessable(adminControl_) {
        _randomSalt = randomSalt;
        _consumable = consumable_;
        _dcrcl = dcrcl_;
    }

    function seriesUri(uint256) external view returns (string memory) {
        return _seriesUri;
    }

    function setSeriesUri(string memory uri_) public onlyAdmin {
        _seriesUri = uri_;
    }

    function setPricingStrategy(address pricingStrategy_) external onlyAdmin {
        _pricingStrategy = IPricingStrategy(pricingStrategy_);
    }

    /**
     * @dev create series for the poool or forge
     */
    function createSeries(
        uint16[] memory cardCount,
        uint24 totalMints,
        string memory seriesName
    ) public onlyAdmin {
        require(cardCount.length > 0, "A series needs 1 card at least.");
        uint256 sId = _series.length;
        _series.push();
        _updateSeries(_series[sId], cardCount, totalMints, seriesName);
        _setUnusedSeriesIdx.add(sId); // indicate this series is not been used
    }

    /**
     * @dev update an unused series
     */
    function updateSeries(
        uint16 sId,
        uint16[] memory cardCount,
        uint24 totalMints,
        string memory seriesName
    ) public onlyAdmin {
        require(cardCount.length > 0, "A series needs 1 card at least.");
        require(_setUnusedSeriesIdx.contains(sId), "series in use");
        _updateSeries(_series[sId], cardCount, totalMints, seriesName);
    }

    function _updateSeries(
        Series storage series,
        uint16[] memory cardCount,
        uint256 totalMints,
        string memory seriesName
    ) private {
        series.cardCount = cardCount;
        series.totalMints = uint24(totalMints);
        uint256 picks = 0;
        for (uint256 idx = 0; idx < cardCount.length; ++idx) {
            picks += cardCount[idx];
        } // calculate total cards
        series.total = series.availables = uint24(picks);
        series.name = seriesName;
    }

    function getSeriesCounts() public view returns (uint256) {
        return _series.length;
    }

    /**
     * @dev list all unused series indexes
     */
    function listUnusedSeriesIndexes() public view returns (uint256[] memory seriesIdx) {
        seriesIdx = new uint256[](_setUnusedSeriesIdx.length());
        for (uint256 idx = 0; idx < seriesIdx.length; ++idx) seriesIdx[idx] = _setUnusedSeriesIdx.at(idx);
    }

    /**
     * @dev get series detail
     */
    function getSeries(uint256 idx)
        public
        view
        returns (
            uint256[] memory cardCount,
            uint256 total,
            uint256 availables,
            uint256 totalMints,
            uint256 minted,
            bool IsUnused,
            string memory seriesName
        )
    {
        Series storage series = _series[idx];
        cardCount = new uint256[](series.cardCount.length);
        for (uint256 index = 0; index < series.cardCount.length; ++index) cardCount[index] = series.cardCount[index];
        total = series.total;
        availables = series.availables;
        totalMints = series.totalMints;
        minted = series.minted;
        IsUnused = _setUnusedSeriesIdx.contains(idx);
        seriesName = series.name;
    }

    /**
     * @dev create new pool
     */
    function createPool(
        uint16[] memory seriesIds,
        string memory poolName,
        uint256 poolOpenBlock
    ) public onlyAdmin {
        require(seriesIds.length > 0, "A pool needs 1 series at least.");
        if (poolOpenBlock < block.number) poolOpenBlock = block.number;
        if (_pools.length > 0) {
            require(_pools[_pools.length - 1].poolOpen < poolOpenBlock, "Pool open should greater than last.");
        }
        uint256 poolAvailable = 0;
        for (uint256 idx = 0; idx < seriesIds.length; ++idx) {
            // check series availability and compute total supply of pool
            uint256 seriesId = seriesIds[idx];
            require(seriesId < _series.length, "seriesId not existe");
            markSeriesAsUsed(seriesId);
            poolAvailable += _series[seriesId].total;
        }
        uint256 idxPool = _pools.length;
        _pools.push();
        Pool storage newPool = _pools[idxPool];
        newPool.seriesIds = seriesIds;
        newPool.isEnabled = true;
        newPool.name = poolName;
        newPool.total = newPool.availables = uint24(poolAvailable);
        newPool.poolOpen = poolOpenBlock;
        _mintPoolNFTs(newPool);
        _pricingStrategy.reset(poolOpenBlock);
    }

    function getPoolInfo(uint256 poolId)
        external
        view
        returns (
            uint256[] memory seriesIds,
            uint256[] memory seriesAvailables,
            uint256 availables,
            uint256 picks,
            uint256 poolOpenBlock,
            bool isEnabled,
            string memory name_,
            bool isAvailable
        )
    {
        Pool storage pool = _pools[poolId];
        seriesAvailables = new uint256[](pool.seriesIds.length);
        seriesIds = new uint256[](pool.seriesIds.length);
        for (uint256 index = 0; index < seriesAvailables.length; ++index) {
            seriesIds[index] = pool.seriesIds[index];
            seriesAvailables[index] = _series[pool.seriesIds[index]].availables;
        }
        availables = pool.availables;
        picks = pool.total - availables;
        poolOpenBlock = pool.poolOpen;
        isEnabled = pool.isEnabled;
        name_ = pool.name;
        isAvailable = isPoolAvailable(pool);
    }

    /**
     * @dev mint all NFT of a pool, should only called during createPool
     */
    function _mintPoolNFTs(Pool storage pool) private {
        pool.nftIdxBegin = uint24(_nfts.length);
        // for each series
        for (uint256 idx = 0; idx < pool.seriesIds.length; ++idx) {
            uint256 seriesIdx = pool.seriesIds[idx];
            Series memory series = _series[seriesIdx];
            // for each in-series card
            for (uint256 idxCard = 0; idxCard < series.cardCount.length; ++idxCard) {
                uint256 cards = series.cardCount[idxCard];
                // create NFT
                for (uint256 cardCount = 0; cardCount < cards; ++cardCount) {
                    _nfts.push(FNFT({seriesId: uint16(seriesIdx), cardId: uint8(idxCard), isForged: false, isPicked: false}));
                }
            }
        }
    }

    /**
     * @dev a pool cannot be modified for security reasons, the only way to force close/reopen a pool is set its 'isEnable' property
     */
    function enablePool(uint256 poolId, bool isEnabled) public onlyAdmin {
        Pool storage pool = _pools[poolId];
        pool.isEnabled = isEnabled;
    }

    function getPoolCounts() public view returns (uint256 count) {
        count = _pools.length;
    }

    function getAvailablePoolIndex() external view returns (uint256 index) {
        uint256 poolCount = _pools.length;
        require(poolCount > 0, "No pool existed");

        for (index = 0; index < poolCount; ++index) {
            Pool storage pool = _pools[index];
            if (isPoolAvailable(pool)) break;
        }
        if (index == poolCount) {
            --index;
            while (!_pools[index].isEnabled && index > 0) --index;
        }
    }

    /**
     * @dev list the pool indexes which is pickable.
     * Call from contract is prohibited for security reasons
     */
    function pickCards(uint256 poolId) public nonContract {
        Pool storage pool = _pools[poolId];
        _consumeToken(pool);
        uint256 pickId = _pickFromPool(pool);
        _NFT2User(_msgSender(), pickId);
    }

    /**
     * @dev consume XIANG from token provider
     */
    function _consumeToken(Pool storage pool) private {
        uint256 amount = getNextCardPrice(pool.total - pool.availables); // get card price
        _consumable.consume(_msgSender(), amount); // consume XIANG
        _pricingStrategy.moveNext();
    }

    /**
     * @dev pick a card from minted pool
     */
    function _pickFromPool(Pool storage pool) private returns (uint256 pickId) {
        require(isPoolAvailable(pool), "Pool is not available");
        uint256 random = getRandomNumber();
        pickId = pool.total - pool.availables + pool.nftIdxBegin; // find pickable nft beginning index
        uint256 mod = random % pool.availables; // random pick
        FNFT memory source = _nfts[pickId];
        // swap picked nft to beginning index if mod != 0
        if (mod != 0) {
            _nfts[pickId] = _nfts[pickId + mod];
            _nfts[pickId + mod] = source;
        }
        // modify some values
        _nfts[pickId].isPicked = true;
        --_series[_nfts[pickId].seriesId].availables;
        --pool.availables;
    }

    /**
     * @dev determine wheather a pool is pickable
     */
    function isPoolAvailable(Pool storage pool) internal view returns (bool) {
        // pool has cards and enabled, and poolPeriod is before current
        return pool.availables > 0 && pool.poolOpen <= block.number && pool.isEnabled;
    }

    /**
     * @dev calculate card price by picked count
     */
    function getNextCardPrice(uint256 releaseCount) public view returns (uint256) {
        return _pricingStrategy.getNextCardPrice(releaseCount);
    }

    /**
     * @dev distribute nft to sender
     */
    function _NFT2User(address to, uint256 pickId) private {
        uint256 tokenId = _dcrcl.mint(to, "");
        _nftIdMapping[tokenId] = pickId + 1;
        _lastPick[_msgSender()] = tokenId + 1; // set last pick card id, 0 stands for never picked, so +1;
        emit PickCard(_msgSender(), tokenId);
    }

    /**
     * @dev get information of user's last pick
     */
    function lastPick(address owner)
        public
        view
        returns (
            uint256 total,
            uint256[] memory ids,
            uint256[] memory series,
            uint256[] memory cardIdx
        )
    {
        uint256 lastPick_ = _lastPick[owner];
        require(lastPick_ > 0, "owner not picked");
        uint256[] memory lastPicks = new uint256[](1);
        lastPicks[0] = lastPick_ - 1; //  0 stands for never picked, so -1;
        return infoOfBatch(lastPicks);
    }

    /**
     * @dev list all tokens belonged to the owner. Using tokensOf function, can be removed in production release?
     */
    function listAll(address owner)
        public
        view
        returns (
            uint256 total,
            uint256[] memory ids,
            uint256[] memory series,
            uint256[] memory cardIdx
        )
    {
        (uint256[] memory tokenIds, ) = _dcrcl.tokensOf(owner);
        return infoOfBatch(tokenIds);
    }

    /**
     * @dev get token information throught id.
     */
    function infoOfBatch(uint256[] memory tokenIds)
        public
        view
        returns (
            uint256 total,
            uint256[] memory ids,
            uint256[] memory series,
            uint256[] memory cardIdx
        )
    {
        total = tokenIds.length;
        uint256 count = 0;
        uint256[] memory pickIds = new uint256[](total);
        uint256[] memory tempoIds = new uint256[](total);

        for (uint256 idx = 0; idx < total; ++idx) {
            uint256 tokenId = tokenIds[idx];
            uint256 pickId = _nftIdMapping[tokenId];
            if (pickId > 0) {
                tempoIds[count] = tokenId;
                pickIds[count] = pickId - 1;
                ++count;
            }
        }
        total = count;
        ids = new uint256[](total);
        series = new uint256[](total);
        cardIdx = new uint256[](total);
        for (uint256 idx = 0; idx < total; ++idx) {
            FNFT memory fNFT = _nfts[pickIds[idx]];
            ids[idx] = tempoIds[idx];
            series[idx] = fNFT.seriesId;
            cardIdx[idx] = fNFT.cardId;
        }
    }

    function getRandomNumber() private returns (uint256) {
        uint256 tempo = uint256(keccak256(toBytes(uint256(blockhash(block.number - 1)) ^ _randomSalt)));
        _randomSalt ^= tempo;
        return tempo;
    }

    function toBytes(uint256 x) private pure returns (bytes memory b) {
        b = new bytes(32);
        assembly {
            mstore(add(b, 32), x)
        }
    }

    function markSeriesAsUsed(uint256 seriesId) private {
        require(_setUnusedSeriesIdx.remove(seriesId), "series in use");
    }

    modifier nonContract() {
        require(!isContract(_msgSender()), "contract caller is not allowed");
        _;
    }

    /**
     * @dev determine call is a contract or not
     */
    function isContract(address addr) public pure returns (bool) {
        return (uint160(addr) >> 159) > 0;
    }
}
