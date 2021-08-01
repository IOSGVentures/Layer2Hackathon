// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;
        
import "./common/MixinAuthorizable.sol";

interface IStrategy {
    // Total want tokens managed by strat
    function wantLockedTotalMap(address _wantToken) external view returns (uint256);

    // Sum of all shares of users to wantLockedTotal
    function sharesTotalMap(address _wantToken) external view returns (uint256);

    // Main want token compounding function
    function earn() external;

    // Transfer want tokens boboFarm -> strategy
    function deposit(uint256 _wantAmt, address _wantToken) external returns (uint256);

    // Transfer want tokens strategy -> boboFarm
    function withdraw(uint256 _wantAmt, address _wantToken) external returns (uint256);

    function initTotalShareAndLocked(address _tokenAddr, uint256 _totalShare, uint256 _totalLocked) external;

    function clearAndTransferTokens(address _tokenAddr) external returns(uint256, uint256);

    function farm() external;
    
    function owner() external returns(address);
}

interface BOBOToken is IERC20 {
    function mint(address _to, uint256 _amount) external returns(bool);
}

contract BoboFarmer is MixinAuthorizable, ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    struct UserInfo {
        uint256 shares;             // 用户占有的股份
        uint256 rewardDebt; 
    }

    struct PoolInfo {
        IERC20 want;                // 希望兑换的token
        uint256 allocPoint;         // 挖BOBO的权重
        uint256 lastRewardBlock;    
        uint256 accBOBOPerShare;     // 用户每股可分到的BOBO，包括mint出来的和回购的BOBO
        address strat;              // 策略地址，用于复投
    }

    address public boboTokenAddr;

    address public burnAddress = 0x000000000000000000000000000000000000dEaD;
    address public fundAddr;

    uint256 public boboPerBlock; 
    uint256 public startBlock; 

    PoolInfo[] public poolInfo; 
    mapping(uint256 => mapping(address => UserInfo)) public userInfo; 
    uint256 public totalAllocPoint = 0; 
    mapping(address => uint256) public tokenPidMap;

    mapping(address => bool) public _auth;

    event Deposit(address indexed _tokenAddr, address indexed user, uint256 amount);
    event Withdraw(address indexed _tokenAddr, address indexed user, uint256 amount);
    event EmergencyWithdraw(
        address indexed _tokenAddr,
        address indexed user,
        uint256 amount
    );
    
    constructor(
        address _boboTokenAddress, 
        uint256 _startBlock,
        address _fundAddr
    ) public {
        boboTokenAddr = _boboTokenAddress;
        startBlock = _startBlock;
        fundAddr = _fundAddr;
    }


    function setFundAddr(address _fundAddr) public onlyOwner {
        fundAddr = _fundAddr;
    }
    
    function setBoboPerBlock(          
        uint256 _boboPerBlock
    ) public onlyOwner {
        massUpdatePools();
        boboPerBlock = _boboPerBlock;
    }

    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    function add(uint256 _allocPoint, address _want, bool _withUpdate, address _strat) public onlyOwner {
        require(tokenPidMap[_want] == 0, "BoboFarmer: token EXIST.");
        require(IStrategy(_strat).owner() == address(this), "BoboFarmer: the owner of strat MUST be the same as the address of BoboFarmer.");
        if (_withUpdate) {
            massUpdatePools();
        }
        uint256 lastRewardBlock = block.number > startBlock ? block.number : startBlock;
        totalAllocPoint = totalAllocPoint.add(_allocPoint);
        poolInfo.push(
            PoolInfo({
                want: IERC20(_want),
                allocPoint: _allocPoint,
                lastRewardBlock: lastRewardBlock,
                accBOBOPerShare: 0,
                strat: _strat
            })
        );
        tokenPidMap[_want] = poolInfo.length;
    }

    function setPoolPoint(address _tokenAddr, uint256 _allocPoint, bool _withUpdate) public onlyOwner {
        require(tokenPidMap[_tokenAddr] > 0, "BoboFarmer: token NOT exist.");
        uint256 pid = tokenPidMap[_tokenAddr] - 1;
        if (_withUpdate) {
            massUpdatePools();
        }
        totalAllocPoint = totalAllocPoint.sub(poolInfo[pid].allocPoint).add(_allocPoint);
        poolInfo[pid].allocPoint = _allocPoint;
    }

    function getMultiplier(uint256 _from, uint256 _to) public pure returns (uint256) {
        return _to.sub(_from);
    }

    // 获取用户在某个池子中的分到的BOBO数量，包括了策略合约中回购的BOBO
    // 根据用户占有的股份比例来计算其可提取的bobo数量，而股份记录在策略合约中
    function pendingBOBO(address _tokenAddr, address _user) external view returns (uint256) {
        require(tokenPidMap[_tokenAddr] > 0, "BoboFarmer: token NOT exist.");
        uint256 pid = tokenPidMap[_tokenAddr] - 1;
        PoolInfo storage pool = poolInfo[pid];
        UserInfo storage user = userInfo[pid][_user];
        uint256 accBOBOPerShare = pool.accBOBOPerShare;
        uint256 sharesTotal = IStrategy(pool.strat).sharesTotalMap(address(pool.want));         // 策略合约中的总股份
        if (block.number > pool.lastRewardBlock && sharesTotal != 0) {
            uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
            uint256 boboReward = multiplier.mul(boboPerBlock).mul(pool.allocPoint).div(totalAllocPoint);   // 本池子的挖矿产出BOBO
            accBOBOPerShare = accBOBOPerShare.add(boboReward.mul(1e12).div(sharesTotal));      // 策略合约中每股可分到的新增BOBO奖励
        }
        return user.shares.mul(accBOBOPerShare).div(1e12).sub(user.rewardDebt);
    }

    // 获取用户占有的want token数量
    function stakedWantTokens(address _tokenAddr, address _user) external view returns (uint256) {
        require(tokenPidMap[_tokenAddr] > 0, "BoboFarmer: token NOT exist.");
        uint256 pid = tokenPidMap[_tokenAddr] - 1;

        PoolInfo memory pool = poolInfo[pid];
        UserInfo memory user = userInfo[pid][_user];

        uint256 sharesTotal = IStrategy(pool.strat).sharesTotalMap(address(pool.want));
        uint256 wantLockedTotal = IStrategy(pool.strat).wantLockedTotalMap(address(pool.want));
        if (sharesTotal == 0) {
            return 0;
        }
        return user.shares.mul(wantLockedTotal).div(sharesTotal);
    }

    function massUpdatePools() public {
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            updatePool(pid);
        }
    }

    function updatePool(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        if (block.number <= pool.lastRewardBlock) {
            return;
        }
        // 从策略合约中获取总的股份数
        uint256 sharesTotal = IStrategy(pool.strat).sharesTotalMap(address(pool.want));
        if (sharesTotal == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }

        // 计算当前池子中每股可以分到的直接挖矿产出的BOBO数量
        uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
        if (multiplier <= 0) {
            return;
        }
        uint256 boboReward = multiplier.mul(boboPerBlock).mul(pool.allocPoint).div(totalAllocPoint);
        BOBOToken(boboTokenAddr).mint(address(this), boboReward);
        BOBOToken(boboTokenAddr).mint(fundAddr, boboReward.div(3));
        pool.accBOBOPerShare = pool.accBOBOPerShare.add(boboReward.mul(1e12).div(sharesTotal));

        pool.lastRewardBlock = block.number;
    }

    // 抵押want代币，want代币最终被转移到策略合约中
    function deposit(address _tokenAddr, address _userAddr, uint256 _wantAmt) public nonReentrant onlyAuthorized {
        require(tokenPidMap[_tokenAddr] > 0, "BoboFarmer: token NOT exist.");
        uint256 pid = tokenPidMap[_tokenAddr] - 1;

        updatePool(pid);
        PoolInfo storage pool = poolInfo[pid];
        UserInfo storage user = userInfo[pid][_userAddr];

        if (user.shares > 0) {  // 用户抵押时，计算用户可收获的BOBO数量，并转移给用户
            uint256 pendingBOBOAmount = user.shares.mul(pool.accBOBOPerShare).div(1e12).sub(user.rewardDebt);
            if (pendingBOBOAmount > 0) {
                safeBOBOTransfer(_userAddr, pendingBOBOAmount);
            }
        }
        if (_wantAmt > 0) {   // 当用户抵押want代币的数量大于0时，want代币 => 本合约 => 策略合约（会返回新增股份数）=> 本合约更新用户股份数
            pool.want.safeTransferFrom(msg.sender, address(this), _wantAmt);  // 将want代币转移给合约

            pool.want.safeIncreaseAllowance(pool.strat, _wantAmt);  // 给策略合约授权
            uint256 sharesAdded = IStrategy(pool.strat).deposit(_wantAmt, address(pool.want));  // 将want代币deposit到策略合约，并获取股份数
            user.shares = user.shares.add(sharesAdded);  // 添加用户股份数
        }
        user.rewardDebt = user.shares.mul(pool.accBOBOPerShare).div(1e12);   // 以用户新的股份数更新用户不可提取的BOBO数量
        emit Deposit(_tokenAddr, _userAddr, _wantAmt);
    }

    // 提取BOBO和策略池中的want代币
    // 用户撤回订单、订单被动成交，订单是否为最后一个
    function withdraw(address _tokenAddr, address _userAddr, uint256 _wantAmt) public nonReentrant onlyAuthorized {
        require(tokenPidMap[_tokenAddr] > 0, "BoboFarmer: token NOT exist.");
        uint256 pid = tokenPidMap[_tokenAddr] - 1;

        updatePool(pid);

        PoolInfo storage pool = poolInfo[pid];
        UserInfo storage user = userInfo[pid][_userAddr];

        uint256 wantLockedTotal = IStrategy(pool.strat).wantLockedTotalMap(address(pool.want));  // 获取策略合约中所有的want代币
        uint256 sharesTotal = IStrategy(pool.strat).sharesTotalMap(address(pool.want));  // 获取策略合约中所有股份

        require(user.shares > 0, "BoboFarmer: user.shares is 0");
        require(sharesTotal > 0, "BoboFarmer: sharesTotal is 0");

        // 先提取BOBO，因为后面会更新用户股份数
        uint256 pending = user.shares.mul(pool.accBOBOPerShare).div(1e12).sub(user.rewardDebt);
        if (pending > 0) {
            safeBOBOTransfer(_userAddr, pending);
        }

        // 根据用户当前股份数提取want代币
        uint256 amount = user.shares.mul(wantLockedTotal).div(sharesTotal);
        if (_wantAmt > amount) {
            _wantAmt = amount;
        }
        if (_wantAmt > 0) {
            // 由策略合约将want代币提取给用户，并计算用户本次提取涉及的股份数
            uint256 sharesRemoved = IStrategy(pool.strat).withdraw(_wantAmt, address(pool.want));   

            // 更新用户股份数，减去提取的部分
            if (sharesRemoved > user.shares) {
                user.shares = 0;
            } else {
                user.shares = user.shares.sub(sharesRemoved);
            }

            // 上面策略合约在withdraw的时候，实际是把want代币打给了本合约，需要由本合约将want代币给用户，
            // 由于本合约中不保存want代币，所以可以用本合约的want代币余额来获得策略合约打了多少want代币过来
            uint256 wantBal = IERC20(pool.want).balanceOf(address(this));  
            if (wantBal < _wantAmt) {
                _wantAmt = wantBal;
            }
            pool.want.safeTransfer(address(msg.sender), _wantAmt);
        }
        user.rewardDebt = user.shares.mul(pool.accBOBOPerShare).div(1e12);
        emit Withdraw(_tokenAddr, _userAddr, _wantAmt);
    }

    function migrateNewStrat(address _tokenAddr, address _newStratAddr) external onlyOwner {
        require(tokenPidMap[_tokenAddr] > 0, "BoboFarmer: token NOT exist.");
        uint256 pid = tokenPidMap[_tokenAddr] - 1;
        PoolInfo storage pool = poolInfo[pid];
        
        (uint256 totalShares, uint256 totalLocked) = IStrategy(pool.strat).clearAndTransferTokens(_tokenAddr);
        IStrategy(pool.strat).initTotalShareAndLocked(_tokenAddr, totalShares, totalLocked);
        pool.strat = _newStratAddr;
        uint256 amount = IERC20(_tokenAddr).balanceOf(address(this));
        if (amount > 0)
            IERC20(_tokenAddr).transfer(_newStratAddr, amount);
        IStrategy(pool.strat).farm();
    }

    function safeBOBOTransfer(address _to, uint256 _boboAmt) internal {
        uint256 boboBal = IERC20(boboTokenAddr).balanceOf(address(this));
        if (_boboAmt > boboBal) {
            IERC20(boboTokenAddr).transfer(_to, boboBal);
        } else {
            IERC20(boboTokenAddr).transfer(_to, _boboAmt);
        }
    }
}