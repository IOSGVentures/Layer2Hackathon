// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./common/OrderStore.sol";
import "./BoboPair.sol";


interface IBoboPair {
    function initialize(address _token0, address _token1, address _authAddr, address _boboFarmer) external;
    function setRouter(address _router) external;
    function addAuth(address _authAddr) external;
    function getTotalHangingTokenAmount(address _userAddr) view external returns(uint256 baseTokenAmount, uint256 quoteTokenAmount);
}

contract BoboFactoryOnMatic is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.UintSet;
    using EnumerableSet for EnumerableSet.AddressSet;
    
    
    address public constant USDT = 0xc2132D05D31c914a87C6611C10748AEb04B58e8F;
    address public constant USDC = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174;
    address public constant WMATIC = 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270;
    
    address[] public allPairs;  // 交易对列表
    mapping(address => mapping(address => address)) public getPair;
    mapping(address => address[]) public baseTokenPairs;

    IBoboFarmer public boboFarmer;
    
    EnumerableSet.AddressSet private baseTokens;
    
    event PairCreated(address indexed token0, address indexed token1, address pair, uint);
    
    constructor () public {  
        baseTokens.add(USDT);
        baseTokens.add(USDC);
    }

    function setBoboFarmer(address _boboFarmer) public onlyOwner {
        boboFarmer = IBoboFarmer(_boboFarmer);
    }
    
    function addBaseToken(address _baseToken) public onlyOwner {
        require (!baseTokens.contains(_baseToken), "BoboFactory: EXIST");
        baseTokens.add(_baseToken);
    }
    
    function createPair(address _quoteToken, address _baseToken) public onlyOwner returns (address pairAddr) {
        require(baseTokens.contains(_baseToken), "BoboFactory: base token ERROR.");
        require(_quoteToken != _baseToken, "BoboFactory: IDENTICAL_ADDRESSES");
        require(_quoteToken != address(0), "BoboFactory: ZERO_ADDRESS");
        require(getPair[_quoteToken][_baseToken] == address(0), "BoboFactory: PAIR_EXISTS"); // single check is sufficient
        bytes memory bytecode = type(BoboPair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(_quoteToken, _baseToken));
        assembly {
            pairAddr := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        IBoboPair(pairAddr).initialize(_quoteToken, _baseToken, msg.sender, address(boboFarmer));
        getPair[_quoteToken][_baseToken] = pairAddr;
        getPair[_baseToken][_quoteToken] = pairAddr; // populate mapping in the reverse direction
        allPairs.push(pairAddr);
        baseTokenPairs[_baseToken].push(_quoteToken);
        emit PairCreated(_quoteToken, _baseToken, pairAddr, allPairs.length);
    }
    
    // 批量增加支持的交易对
    function createPairs(address[] memory _quoteTokens, address _baseToken) public onlyOwner {
        for (uint256 i = 0; i < _quoteTokens.length; i++) {
            createPair(_quoteTokens[i], _baseToken);
        }
    }

    function pairNumber() view public returns(uint256) {
        return allPairs.length;
    }
    
    function setPairRouter(address _quoteToken, address _baseToken, address _router) external onlyOwner {
        address pairAddr = getPair[_quoteToken][_baseToken];
        require(pairAddr != address(0), 'BoboFactory: PAIR_NOT_EXISTS');
        IBoboPair(pairAddr).setRouter(_router);
    }
    
    function addPairAuth(address _quoteToken, address _baseToken, address _auth) external onlyOwner {
        address pairAddr = getPair[_quoteToken][_baseToken];
        require(pairAddr != address(0), 'BoboFactory: PAIR_NOT_EXISTS');
        IBoboPair(pairAddr).addAuth(_auth);
    }

    function getBaseTokenPairLength(address _baseToken) view external returns(uint256) {
        return baseTokenPairs[_baseToken].length;
    }

    function getTotalHangingTokenAmount(address _baseToken, address _userAddr) view public returns(uint256) {
        uint256 totalBaseTokenAmount;
        address[] memory quoteTokens = baseTokenPairs[_baseToken];
        for (uint256 i = 0; i < quoteTokens.length; i++) {
            address pairAddr = getPair[quoteTokens[i]][_baseToken];
            (uint256 baseTokenAmount,) = IBoboPair(pairAddr).getTotalHangingTokenAmount(_userAddr);
            totalBaseTokenAmount = totalBaseTokenAmount.add(baseTokenAmount);
        }
        return totalBaseTokenAmount;
    }

    function getClaimBaseTokenAmount(address _baseToken, address _userAddr) view public returns(uint256) {
        uint256 hangingBaseTokenAmount = boboFarmer.stakedWantTokens(_baseToken, _userAddr);
        uint256 baseTokenAmount = getTotalHangingTokenAmount(_baseToken, _userAddr);
        return hangingBaseTokenAmount.sub(baseTokenAmount);
    }
    // 此接口调用前提：需要在boboFarmer合约上为Factory合约开通权限
    function claimBaseToken(address _baseToken) public {
        uint256 amount = getClaimBaseTokenAmount(_baseToken, msg.sender);
        if (boboFarmer.tokenPidMap(_baseToken) > 0) {
            uint256 preBaseTokenAmount = IERC20(_baseToken).balanceOf(address(this));
            boboFarmer.withdraw(_baseToken, msg.sender, amount);
            uint256 newBaseTokenAmount = IERC20(_baseToken).balanceOf(address(this));
            IERC20(_baseToken).transfer(msg.sender, newBaseTokenAmount.sub(preBaseTokenAmount));
        }
    }
}