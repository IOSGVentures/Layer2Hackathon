// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../../interfaces/ISamsara.sol";
import "./Dan.sol";

contract StakingBase2 is ReentrancyGuard, AdminAccessable, ISamsara {
    using EnumerableSet for EnumerableSet.AddressSet;

    struct UserStakingInfo {
        uint256 periodIndex; // periode index
        uint256 stakingPoints; // deposited point
        uint256 rewardDebt; // reward debt for pending calculation
        uint256 exChanged; // total claimed token
        uint256 pending; // amount that not been collected
    }

    // Info of each pool.
    struct PoolInfo {
        address tokenAddress; // address of sataking token
        uint256 randomizer; // total rand number
        uint256 totalStaked; // total staked token per pool
        uint256 stakingFactor; // Amount * factor = stakingPoints.
    }

    struct Wuxing {
        uint56 sumPhases; // total WuXing
        uint40 metal; // jin
        uint40 wood; // mu
        uint40 water; // shui
        uint40 fire; // huo
        uint40 earth; // tu
    }

    struct Period {
        uint256 tokenPerBlock; // number of tokens release per block
        // periode that do not produce tokens
        uint128 offsetBlocks;
        // period begin block
        uint128 beginBlock;
        // Total staking points
        uint256 totalStakingPoints;
        // Accumulated token per share, times 1e32.
        uint256 accTokenPerShare;
        // Last block number that token distribution occurs.
        uint256 lastRewardBlock;
    }

    uint16 private _metalPerf; // jin performance eg:0 = 0% 10000 = 100% 40000 = 400%
    uint16 private _woodPerf; // mu performance
    uint16 private _waterPerf; // shui performance
    uint16 private _firePerf; // huo performance
    uint16 private _earthPerf; // tu performance

    // dan token
    Dan private _dan;
    uint256 private _randomSalt;
    mapping(address => UserStakingInfo) private _userStakingInfo;

    address payable public devAddress;
    bool public isEmergency;

    // // periods
    Period[] public periods;

    // Tokens that will be released
    uint256 public miningTotal;

    // the end block of mining
    uint256 public miningEndBlock;

    uint256 private _danFraction;

    // // abstraction pools, which might be an ERC1155 pool, an ERC20 pool, even a CFX pool
    // // depens on inherition
    // PoolInfo[] public poolInfo;

    EnumerableSet.AddressSet private _poolAddresses;

    mapping(address => PoolInfo) private _poolInfo;
    mapping(address => Wuxing[2]) private _poolWuxing;
    uint256 private _pingPong;

    //  account -> token -> balacne
    mapping(address => mapping(address => uint256)) public userStakedBalance;
    // token address that user had staked
    //  account -> tokens
    mapping(address => EnumerableSet.AddressSet) private _stakedTokenAddresses;

    // // Info of each user that stakes LP tokens.
    // mapping(uint256 => mapping(address => UserInfo)) public userInfo;
    uint256 private constant acc1e32 = 1e32;
    uint256 private constant perfUnit = 10000;
    uint256 private constant randBase = 0xffffffffffffffff;
    address public constant cfxAddress = address(0x0);

    event Withdraw(address indexed user, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 amount);

    constructor(
        uint256 randomSalt,
        Dan dan_,
        ICentralAdminControl adminControl_
    ) AdminAccessable(adminControl_) {
        _randomSalt = randomSalt;
        _dan = dan_;
        isEmergency = false;
    }

    function setEmergency(bool isEmergency_) external nonEmergency onlyAdmin {
        isEmergency = isEmergency_;
    }

    function updateMinintTotal(uint256 _miningTotal) public onlyAdmin {
        _updateMinintTotal(_miningTotal);
    }

    /**
     * @dev Update reserved accounts info
     * the distribution to reserved account won't work until this function is called properly
     */
    function updateReservedInfo(address payable devAddress_) public onlyAdmin {
        devAddress = devAddress_;
    }

    function currentPhase() public view returns (uint256) {
        return _pingPong;
    }

    function nextPhase() public view returns (uint256) {
        return 1 - _pingPong;
    }

    function poolCount() external view returns (uint256) {
        return _poolAddresses.length();
    }

    function poolAddressAt(uint256 index) external view returns (address) {
        return _poolAddresses.at(index);
    }

    function periodeCount() public view returns (uint256) {
        return periods.length;
    }

    function stakedPoolCount(address account) external view returns (uint256) {
        return _stakedTokenAddresses[account].length();
    }

    function stakedPoolAddressByIndex(address account, uint256 index) external view returns (address) {
        return _stakedTokenAddresses[account].at(index);
    }

    function _add(address tokenAddress, uint56 sumPhases) internal onlyAdmin {
        require(_poolAddresses.add(tokenAddress), "StakingBase: already added");
        uint256 randomizer = getRandomNumber();
        uint256[] memory subs = regenerateWuxing(randomizer, sumPhases);
        uint256 stakingFactor = recalculateStakingFactor(subs[0], subs[1], subs[2], subs[3], subs[4]);
        _poolInfo[tokenAddress] = PoolInfo({tokenAddress: tokenAddress, randomizer: randomizer, totalStaked: 0, stakingFactor: stakingFactor});
        _poolWuxing[tokenAddress][0] = _poolWuxing[tokenAddress][1] = Wuxing({
            sumPhases: sumPhases,
            metal: uint40(subs[0]),
            wood: uint40(subs[1]),
            water: uint40(subs[2]),
            fire: uint40(subs[3]),
            earth: uint40(subs[4])
        });
    }

    function _set(address tokenAddress, uint56 sumPhases) internal onlyAdmin {
        require(_poolAddresses.contains(tokenAddress), "StakingBase: pool not found");
        Wuxing storage poolNextWuxing = _poolWuxing[tokenAddress][nextPhase()];
        if (poolNextWuxing.sumPhases == sumPhases) return;
        uint256[] memory subs = regenerateWuxing(_poolInfo[tokenAddress].randomizer, sumPhases);
        poolNextWuxing.sumPhases = sumPhases;
        poolNextWuxing.metal = uint40(subs[0]);
        poolNextWuxing.wood = uint40(subs[1]);
        poolNextWuxing.water = uint40(subs[2]);
        poolNextWuxing.fire = uint40(subs[3]);
        poolNextWuxing.earth = uint40(subs[4]);
    }

    function regenerateWuxing(uint256 randomizer, uint256 sumPhases) private pure returns (uint256[] memory subs) {
        uint256 halfAvg = sumPhases / 10;
        uint256 rest = sumPhases - halfAvg * 5;
        uint256[] memory randoms = new uint256[](4);
        for (uint256 idx = 0; idx < 4; ++idx) {
            randoms[idx] = randomizer & randBase;
            randomizer >>= 64;
        }
        randoms = sort(randoms);
        uint256 sum = 0;
        subs = new uint256[](5);
        sum += subs[0] = (randoms[0] * rest) / randBase + halfAvg;
        sum += subs[1] = ((randoms[1] - randoms[0]) * rest) / randBase + halfAvg;
        sum += subs[2] = ((randoms[2] - randoms[1]) * rest) / randBase + halfAvg;
        sum += subs[3] = ((randoms[3] - randoms[2]) * rest) / randBase + halfAvg;
        sum += subs[4] = ((randBase - randoms[3]) * rest) / randBase + halfAvg;
        if (sumPhases != sum) {
            uint256 diff = sumPhases - sum;
            uint256 idxStart = randomizer % 5;
            for (uint256 count = 0; count < diff; ++count) ++subs[(idxStart + count) % 5];
        }
    }

    function recalculateStakingFactor(
        uint256 metal,
        uint256 wood,
        uint256 water,
        uint256 fire,
        uint256 earth
    ) private view returns (uint256) {
        return (metal * _metalPerf) + (wood * _woodPerf) + (water * _waterPerf) + (fire * _firePerf) + (earth * _earthPerf);
    }

    // /**
    //  * @dev modify an pool's alloc point.
    //  * in order to minimize inaccuracy, it should call before the pool opens or as soon as a periode is advanced
    //  */
    function changeWuxing(
        uint256 tokenPerBlock,
        uint128 offsetBlocks,
        uint16 metalPerf,
        uint16 woodPerf,
        uint16 waterPerf,
        uint16 firePerf,
        uint16 earthPerf
    ) external onlyAdmin {
        _updateStakingParameters();

        uint256 _tokenRest;
        if (periods.length > 0) {
            Period storage period = periods[periods.length - 1];
            uint256 startBlock = period.beginBlock + period.offsetBlocks;
            if (block.number > startBlock) startBlock = block.number;
            _tokenRest = period.tokenPerBlock * (miningEndBlock - startBlock);
        } else _tokenRest = miningTotal;
        miningEndBlock = block.number + _tokenRest / tokenPerBlock + offsetBlocks;

        uint256 pingPongNext = 1 - _pingPong;
        _metalPerf = metalPerf;
        _woodPerf = woodPerf;
        _waterPerf = waterPerf;
        _firePerf = firePerf;
        _earthPerf = earthPerf;
        for (uint256 index = 0; index < _poolAddresses.length(); ++index) {
            PoolInfo storage pool = _poolInfo[_poolAddresses.at(index)];
            Wuxing storage cWuxing = _poolWuxing[_poolAddresses.at(index)][_pingPong];
            Wuxing memory nWuxing = _poolWuxing[_poolAddresses.at(index)][pingPongNext];
            pool.stakingFactor = recalculateStakingFactor(nWuxing.metal, nWuxing.wood, nWuxing.water, nWuxing.fire, nWuxing.earth);
            pool.totalStaked = 0;
            if (cWuxing.sumPhases != nWuxing.sumPhases) {
                cWuxing.sumPhases = nWuxing.sumPhases;
                cWuxing.metal = nWuxing.metal;
                cWuxing.wood = nWuxing.wood;
                cWuxing.water = nWuxing.water;
                cWuxing.fire = nWuxing.fire;
                cWuxing.earth = nWuxing.earth;
            }
        }
        periods.push(
            Period({
                tokenPerBlock: tokenPerBlock,
                offsetBlocks: offsetBlocks,
                beginBlock: uint128(block.number),
                lastRewardBlock: block.number,
                totalStakingPoints: 0,
                accTokenPerShare: 0
            })
        );
        _pingPong = pingPongNext;
    }

    function currentWuxing()
        external
        view
        returns (
            uint256 periodBegin,
            uint256 dispatchBegin,
            uint256 tokenPerBlock,
            uint256 metalPerf,
            uint256 woodPerf,
            uint256 waterPerf,
            uint256 firePerf,
            uint256 earthPerf
        )
    {
        Period storage period = periods[periods.length - 1];
        periodBegin = period.beginBlock;
        dispatchBegin = period.offsetBlocks + periodBegin;
        tokenPerBlock = period.tokenPerBlock;
        metalPerf = _metalPerf;
        woodPerf = _woodPerf;
        waterPerf = _waterPerf;
        firePerf = _firePerf;
        earthPerf = _earthPerf;
    }

    /**
     * @dev get the balance of owner's periode token
     */
    function pendingToken(address account) public view returns (uint256 pending) {
        UserStakingInfo storage stakedInfo = _userStakingInfo[account];
        Period storage period = periods[stakedInfo.periodIndex];
        uint256 targetBlockNumber;
        // not the current period
        if (stakedInfo.periodIndex < periods.length - 1) {
            targetBlockNumber = periods[stakedInfo.periodIndex + 1].beginBlock;
        } else {
            // current period
            targetBlockNumber = block.number;
        }

        uint256 stakingPoints = stakedInfo.stakingPoints;
        if (stakingPoints > 0) {
            uint256 danReward = getPoolReward(targetBlockNumber, stakedInfo.periodIndex);
            uint256 accTokenPerShareNow = period.accTokenPerShare + (danReward * acc1e32) / period.totalStakingPoints;
            pending = stakedInfo.pending + ((stakingPoints * accTokenPerShareNow) / acc1e32 - stakedInfo.rewardDebt);
        }
    }

    /**
     * @dev Update reward variables of the given pool to be up-to-date.
     */

    function _updateStakingParameters() private {
        // if the mining is not started there is no needs to update
        if (periods.length == 0) return;

        Period storage period = periods[periods.length - 1];
        // if there is nothing in this pool
        if (period.totalStakingPoints == 0) {
            period.lastRewardBlock = block.number;
            return;
        }
        // get reward
        uint256 danReward = getPoolReward(block.number, periods.length - 1);
        // calcult accumulate token per share
        period.accTokenPerShare = period.accTokenPerShare + (danReward * acc1e32) / period.totalStakingPoints;
        // update pool last reward block
        period.lastRewardBlock = block.number;
    }

    function _deposit(address[] memory tokenAddress, uint256[] memory amounts) internal nonEmergency {
        address account = _msgSender();
        _withdrawPoolToPendings(account);
        uint256 userStakingPoints = _userStakingInfo[account].stakingPoints;
        mapping(address => uint256) storage userStaked = userStakedBalance[account];
        Period storage period = periods[periods.length - 1];
        uint256 _totalStakingPoints = period.totalStakingPoints;
        for (uint256 index = 0; index < tokenAddress.length; ++index) {
            uint256 amount = amounts[index];
            if (amount == 0) continue;
            address tokenAddr = tokenAddress[index];
            require(_poolAddresses.contains(tokenAddr), "StakingBase: token address not available");
            uint256 tokenStaked = userStaked[tokenAddr];
            if (tokenStaked == 0) _stakedTokenAddresses[account].add(tokenAddr);

            userStaked[tokenAddr] = tokenStaked + amount;
            PoolInfo storage pool = _poolInfo[tokenAddr];
            pool.totalStaked = pool.totalStaked + amount;

            uint256 diffPoints = amount * pool.stakingFactor;
            userStakingPoints += diffPoints;
            _totalStakingPoints += diffPoints;
        }
        period.totalStakingPoints = _totalStakingPoints;
        _userStakingInfo[account].stakingPoints = userStakingPoints;
        _userStakingInfo[account].rewardDebt = (userStakingPoints * period.accTokenPerShare) / acc1e32;
    }

    /**
     * @dev withdraw staking token from pool
     * any inherited contract should call this function to make a withdraw
     */
    function _withdraw(address[] memory tokenAddress, uint256[] memory amounts) internal nonEmergency {
        address account = _msgSender();
        _withdrawPoolToPendings(account);
        uint256 userStakingPoints = _userStakingInfo[account].stakingPoints;
        mapping(address => uint256) storage userStaked = userStakedBalance[account];
        Period storage period = periods[periods.length - 1];
        uint256 _totalStakingPoints = period.totalStakingPoints;
        for (uint256 index = 0; index < tokenAddress.length; ++index) {
            uint256 amount = amounts[index];
            if (amount == 0) continue;
            address tokenAddr = tokenAddress[index];
            require(_poolAddresses.contains(tokenAddr), "StakingBase: token address not available");

            uint256 userBalance = userStaked[tokenAddr];
            require(userBalance >= amount, "StakingBase: insufficient staking tokens");
            userBalance -= amount;
            userStaked[tokenAddr] = userBalance;
            if (userBalance == 0) _stakedTokenAddresses[account].remove(tokenAddr);
            PoolInfo storage pool = _poolInfo[tokenAddr];
            pool.totalStaked = pool.totalStaked - amount;

            uint256 diffPoints = amount * pool.stakingFactor;
            userStakingPoints -= diffPoints;
            _totalStakingPoints -= diffPoints;
        }
        period.totalStakingPoints = _totalStakingPoints;
        _userStakingInfo[account].stakingPoints = userStakingPoints;
        _userStakingInfo[account].rewardDebt = (userStakingPoints * period.accTokenPerShare) / acc1e32;
    }

    /**
     * @dev withdraw without tokens, emergency only
     * any inherited contract should call this function to make a emergencyWithdraw
     */
    function _emergencyWithdraw() internal onEmergency returns (uint256 cfxAmount) {
        mapping(address => uint256) storage userStaked = userStakedBalance[_msgSender()];
        for (uint256 index = 0; index < _poolAddresses.length(); ++index) {
            address tokenAddr = _poolAddresses.at(index);
            uint256 amount = userStaked[tokenAddr];
            userStaked[tokenAddr] = 0;
            PoolInfo storage pool = _poolInfo[tokenAddr];
            if (pool.totalStaked >= amount) pool.totalStaked -= amount;
            else pool.totalStaked = 0;
            if (tokenAddr == cfxAddress) cfxAmount = amount;
        }
        _userStakingInfo[_msgSender()].stakingPoints = 0;
        _userStakingInfo[_msgSender()].rewardDebt = 0;
    }

    /**
     * @dev withdraw periode token from pool(in this case is Dan)
     */
    function withdrawPool() public nonEmergency nonReentrant {
        _withdrawPool(_msgSender());
    }

    /**
     * @dev implemtation of withdraw pending tokens
     */
    function _withdrawPool(address account) internal {
        _updateStakingParameters();
        UserStakingInfo storage stakedInfo = _userStakingInfo[account];
        uint256 stakingPoints = stakedInfo.stakingPoints;
        uint256 accTokenPerShare = periods[periods.length - 1].accTokenPerShare;
        uint256 pending = stakedInfo.pending;
        if (pending > 0) stakedInfo.pending = 0;
        if (stakingPoints >= 0) {
            // calculate current pending tokens
            pending += (stakingPoints * accTokenPerShare) / acc1e32 - stakedInfo.rewardDebt;
        } else if (stakedInfo.periodIndex != periods.length - 1) {
            stakedInfo.periodIndex = periods.length - 1;
        }
        // if has pending token, then send
        if (pending > 0) {
            uint256 wholeToken = (pending / 1 ether) * (1 ether);
            uint256 fractionToken = pending - wholeToken;
            mintDan(account, wholeToken);
            stakedInfo.exChanged += wholeToken;
            emit Withdraw(account, pending);
            mintDan(devAddress, fractionToken);
            // update user reward debut
            stakedInfo.rewardDebt = (stakingPoints * accTokenPerShare) / acc1e32;
        }
    }

    /**
     * @dev implemtation of withdraw pending tokens
     */
    function _withdrawPoolToPendings(address account) private {
        _updateStakingParameters();
        UserStakingInfo storage stakedInfo = _userStakingInfo[account];
        uint256 stakingPoints = stakedInfo.stakingPoints;
        if (stakingPoints > 0) {
            require(stakedInfo.periodIndex == periods.length - 1, "StakingBase: not in newest period");
            uint256 accTokenPerShare = periods[periods.length - 1].accTokenPerShare;
            // calculate current pending tokens
            uint256 pending = (stakingPoints * accTokenPerShare) / acc1e32 - stakedInfo.rewardDebt;
            if (pending > 0) stakedInfo.pending += pending;
            stakedInfo.rewardDebt = (stakingPoints * accTokenPerShare) / acc1e32;
            // update user reward debut
        } else if (stakedInfo.periodIndex != periods.length - 1) {
            stakedInfo.periodIndex = periods.length - 1;
        }
    }

    function migrateToCurrentPeriode() external nonEmergency {
        address account = _msgSender();
        UserStakingInfo storage userStakingInfo = _userStakingInfo[account];
        uint256 periodIndex = userStakingInfo.periodIndex;
        require(periodIndex != periods.length - 1, "StakingBase: already in newest period");
        uint256 stakingPoints = userStakingInfo.stakingPoints;
        uint256 pending = userStakingInfo.pending;
        Period storage period;
        if (stakingPoints > 0) {
            period = periods[periodIndex];
            uint256 targetBlockNumber = periods[periodIndex + 1].beginBlock;
            uint256 accTokenPerShare = period.accTokenPerShare;
            if (targetBlockNumber != period.lastRewardBlock) {
                // get rewards
                uint256 danReward = getPoolReward(targetBlockNumber, period.lastRewardBlock);
                // calcult accumulate token per share
                period.accTokenPerShare = accTokenPerShare = accTokenPerShare + (danReward * acc1e32) / period.totalStakingPoints;
                // update pool last reward block
                period.lastRewardBlock = block.number;
            }
            pending += ((stakingPoints * accTokenPerShare) / acc1e32) - userStakingInfo.rewardDebt;
        }
        userStakingInfo.pending = pending;
        userStakingInfo.periodIndex = periods.length - 1;
        stakingPoints = 0;

        _updateStakingParameters();
        period = periods[periods.length - 1];
        mapping(address => uint256) storage userStaked = userStakedBalance[account];
        EnumerableSet.AddressSet storage userStakedTokenAddress = _stakedTokenAddresses[account];
        uint256 tokenCounts = userStakedTokenAddress.length();
        for (uint256 index = 0; index < tokenCounts; ++index) {
            address poolAddress = userStakedTokenAddress.at(index);
            uint256 staked = userStaked[poolAddress];
            PoolInfo storage pool = _poolInfo[poolAddress];
            pool.totalStaked += staked;

            uint256 diffPoints = staked * pool.stakingFactor;
            stakingPoints += diffPoints;
        }
        period.totalStakingPoints += stakingPoints;
        userStakingInfo.stakingPoints = stakingPoints;
        userStakingInfo.rewardDebt = (stakingPoints * period.accTokenPerShare) / acc1e32;
    }

    function stakingInfo(address account)
        external
        view
        returns (
            uint256 stakingPoints,
            uint256 totalStaked,
            uint256 estimateBlockPerDan,
            bool isInCurrentPeriod
        )
    {
        totalStaked = periods[periods.length - 1].totalStakingPoints;
        UserStakingInfo storage userStakingInfo = _userStakingInfo[account];
        stakingPoints = userStakingInfo.stakingPoints;
        if (stakingPoints != 0) {
            isInCurrentPeriod = userStakingInfo.periodIndex == periods.length - 1;
            if (isInCurrentPeriod) estimateBlockPerDan = 1 ether / ((stakingPoints * periods[periods.length - 1].tokenPerBlock) / totalStaked);
        } else isInCurrentPeriod = true;
    }

    function poolInfo(address tokenAddr)
        external
        view
        returns (
            uint256 fivePharse,
            uint256 fiveParseNext,
            uint256 stakingFactor,
            uint256 totalStaked
        )
    {
        PoolInfo storage onePool = _poolInfo[tokenAddr];
        Wuxing storage wuxing = _poolWuxing[tokenAddr][currentPhase()];

        fivePharse |= uint256(wuxing.metal) << 0;
        fivePharse |= uint256(wuxing.wood) << 48;
        fivePharse |= uint256(wuxing.water) << 96;
        fivePharse |= uint256(wuxing.fire) << 144;
        fivePharse |= uint256(wuxing.earth) << 192;

        wuxing = _poolWuxing[tokenAddr][nextPhase()];
        fiveParseNext |= uint256(wuxing.metal) << 0;
        fiveParseNext |= uint256(wuxing.wood) << 48;
        fiveParseNext |= uint256(wuxing.water) << 96;
        fiveParseNext |= uint256(wuxing.fire) << 144;
        fiveParseNext |= uint256(wuxing.earth) << 192;

        stakingFactor = onePool.stakingFactor;
        totalStaked = onePool.totalStaked;
    }

    // Safe Dan transfer function, just in case if rounding error causes pool to not have enough tokens.
    function mintDan(address to, uint256 amount) private {
        _dan.mint(to, amount);
    }

    /**
     * @dev get pool reward
     */
    function getPoolReward(uint256 _targetBlockNumber, uint256 periodIndex) private view returns (uint256) {
        Period storage period = periods[periodIndex];
        uint256 startBlock = period.beginBlock + period.offsetBlocks;
        uint256 lastRewardBlock = period.lastRewardBlock;
        if (lastRewardBlock < startBlock) lastRewardBlock = startBlock;
        if (_targetBlockNumber <= lastRewardBlock || lastRewardBlock >= miningEndBlock) return 0;
        if (_targetBlockNumber > miningEndBlock) _targetBlockNumber = miningEndBlock;
        uint256 offset = _targetBlockNumber - lastRewardBlock;
        uint256 poolRewards = offset * period.tokenPerBlock;
        return poolRewards;
    }

    function getBlockInfo() external view returns (uint256, uint256) {
        return (block.timestamp, block.number);
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

    function sort(uint256[] memory data) public pure returns (uint256[] memory) {
        uint256 size = data.length;
        for (uint256 i = 1; i < size; i++) {
            uint256 key = data[i];
            uint256 j = i;
            for (; j > 0 && data[j - 1] > key; j--) {
                data[j] = data[j - 1];
            }
            data[j] = key;
        }
        return data;
    }

    function _updateMinintTotal(uint256 _miningTotal) private {
        if (periods.length != 0) {
            Period storage period = periods[periods.length - 1];
            uint256 tokenPerBlock = period.tokenPerBlock;
            uint256 diff;
            uint256 _miningEndBlock = miningEndBlock;
            if (_miningEndBlock < block.number) _miningEndBlock = block.number;
            if (_miningTotal > miningTotal) {
                diff = _miningTotal - miningTotal;
                miningEndBlock = _miningEndBlock + diff / tokenPerBlock;
            } else {
                diff = miningTotal - _miningTotal;
                miningEndBlock = _miningEndBlock + diff / tokenPerBlock;
            }
            _danFraction = diff % tokenPerBlock;
        }
        miningTotal = _miningTotal;
    }

    function addRecycledToken(uint256 amount) external override {
        require(_msgSender() == address(_dan), "StakingBase: caller not vaild");
        uint256 karma = (amount * 7) / 100;
        _dan.mint(devAddress, karma);
        uint256 _miningTotal = miningTotal + amount - karma + _danFraction;
        if (block.number > miningEndBlock) _updateStakingParameters();
        _updateMinintTotal(_miningTotal);
    }

    modifier onEmergency() {
        require(isEmergency, "StakingBase: not in emergency");
        _;
    }

    modifier nonEmergency() {
        require(!isEmergency, "StakingBase: cannot perform during emergency");
        _;
    }
}
