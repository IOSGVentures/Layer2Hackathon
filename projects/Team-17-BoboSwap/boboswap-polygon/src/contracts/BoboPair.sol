// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "./common/OrderStore.sol";


interface IExchangeManager {
    function burnTradePoints(address _userAddr, uint256 _burnedNumber) external returns(bool);
    function feeEarnedContract() view external returns(uint256);
    function maxNumberPerAMMSwap() view external returns(uint256);
    function tokenInvestRateMap(address _tokenAddr) view external returns(uint256);
    function tokenMinAmountMap(address _tokenAddr) view external returns(uint256);
}

interface IBoboFarmer {
    function deposit(address _tokenAddr, address _userAddr, uint256 _amount) external;
    function withdraw(address _tokenAddr, address _userAddr, uint256 _amount) external;

    function pendingBOBO(address _tokenAddr, address _user) external view returns (uint256);
    function stakedWantTokens(address _tokenAddr, address _user) external view returns (uint256);
    function tokenPidMap(address _tokenAddr) external view returns (uint256);
}


contract BoboPair is Ownable, OrderStore {
    using SafeMath for uint256;
    
    address private bestSwapRouter;
    uint256 public constant BasePercent = 10000;
    uint256 public constant BasePriceAmount = 1e21;
    
    IExchangeManager public exManager;
    IBoboFarmer public boboFarmer;
    address public constant OrderNFTAddr = 0x2496B071f63064F94ba763caa28913d30829683f;
    address public constant OrderDetailNFTAddr = 0xdd382d6aAD3AAc27E18B96071dD62C52448BAA20;
    
    address public factory;
    IBoboRouter public boboRouter;
    address public quoteToken;
    address public baseToken;
    uint256 public quoteTokenDecimals;
    uint256 public baseTokenDecimals;
    
    
    uint256 public constant OneDaySeconds = 24 * 3600;
    uint256 public startTime;
    uint256 public lastRecordTime;
    uint256 public volumnOf24Hours;
    uint256 public totalVolumn;
    uint256[] public volumnList;
    
    mapping(address => bool) public _auth;

    modifier onlyAuth {
        require(_auth[msg.sender], "BoboPair: no permission");
        _;
    }
    
    event SwapSuccess(address indexed owner, address indexed spender, uint value);
    
    constructor () public OrderStore(OrderNFTAddr, OrderDetailNFTAddr) {  
        factory = msg.sender;
        _auth[msg.sender] = true;
        startTime = now;
        lastRecordTime = startTime;
    }

    // called once by the factory at time of deployment
    function initialize(address _quoteToken, address _baseToken, address _authAddr, address _boboFarmer) external onlyOwner {
        quoteToken = _quoteToken;
        baseToken = _baseToken;
        quoteTokenDecimals = ERC20(quoteToken).decimals();
        baseTokenDecimals = ERC20(baseToken).decimals();
        _auth[_authAddr] = true;
        boboFarmer = IBoboFarmer(_boboFarmer);
    }
    
    
    function addAuth(address _authAddr) public onlyOwner {
        _auth[_authAddr] = true;
    }

    function removeAuth(address _authAddr) public onlyOwner {
        _auth[_authAddr] = false;
    }
    
    function setExManager(address _exManager) external onlyAuth {
        exManager = IExchangeManager(_exManager);
    }
    
    function setRouter(address _router) external onlyAuth {
        boboRouter = IBoboRouter(_router);
    }

    function getTokens() view public returns(address, address) {
        return (quoteToken, baseToken);
    }
    
    // 限价单
    // _spotPrice: 以U为单位，如1000000表示下单价格为1U
    function addLimitedOrder(bool _bBuyQuoteToken, uint256 _spotPrice, uint256 _amountIn, uint256 _slippagePercent) public {
        require(_slippagePercent <= 1000, "BoboPair: slippage MUST <= 1000(10%)");
        
        uint256 minOutAmount = 0;
        if (_bBuyQuoteToken) {
            minOutAmount = _amountIn.mul(10**quoteTokenDecimals).div(_spotPrice).mul(BasePercent - _slippagePercent).div(BasePercent);
        } else {
            minOutAmount = _amountIn.mul(_spotPrice).div(10**baseTokenDecimals).mul(BasePercent - _slippagePercent).div(BasePercent);
        }
        uint256 orderId = addOrder(_bBuyQuoteToken, _spotPrice, _amountIn, minOutAmount);
        
        (address inToken, address outToken) = _bBuyQuoteToken ? (baseToken, quoteToken) : (quoteToken, baseToken);
        require(_amountIn >= exManager.tokenMinAmountMap(inToken), "BoboPair: inAmount MUST larger than min amount.");

        (, ResultInfo memory bestSwapInfo) = boboRouter.getBestSwapPath(inToken, outToken, _amountIn);
        
        // 下限价单时满足交易条件
        if (bestSwapInfo.totalAmountOut >= minOutAmount) {  
            bool bSuccess = exManager.burnTradePoints(msg.sender, 1);
            if (bSuccess) {
                swap(orderId, bestSwapInfo, inToken, outToken, _amountIn, false);
            } else {
                setExceptionOrder(orderId, "Trade points is NOT enough.");
            }
        } else {
            ERC20(inToken).transferFrom(msg.sender, address(this), _amountIn);
            if (boboFarmer.tokenPidMap(inToken) > 0) {
                ERC20(inToken).approve(address(boboFarmer), _amountIn);
                boboFarmer.deposit(inToken, msg.sender, _amountIn);
            }
        }
    }
    
    // 市价单
    function addMarketOrder(bool _bBuyQuoteToken, uint256 _amountIn, uint256 _minOutAmount) public {
        (address inToken, address outToken) = _bBuyQuoteToken ? (baseToken, quoteToken) : (quoteToken, baseToken);
        require(_amountIn >= exManager.tokenMinAmountMap(inToken), "BoboPair: inAmount MUST larger than min amount.");

        (, ResultInfo memory bestSwapInfo) = boboRouter.getBestSwapPath(inToken, outToken, _amountIn);
        require(bestSwapInfo.totalAmountOut >= _minOutAmount, "BoboPair: can NOT satisfy your trade request.");
        // 下限价单时满足交易条件
        uint256 spotPrice = _bBuyQuoteToken ? _amountIn.mul(10**quoteTokenDecimals).div(_minOutAmount) : _minOutAmount.mul(10**quoteTokenDecimals).div(_amountIn);
        uint256 orderId = addOrder(_bBuyQuoteToken, spotPrice, _amountIn, _minOutAmount);
        bool bSuccess = exManager.burnTradePoints(msg.sender, 1);
        if (bSuccess) {
            swap(orderId, bestSwapInfo, inToken, outToken, _amountIn, false);
        } else {
            setExceptionOrder(orderId, "Trade points is NOT enough.");
        }
    }
       
    function makeStatistic(uint256 _amount) private {
        totalVolumn = totalVolumn.add(_amount);
        
        uint256 lastPeriod = lastRecordTime.sub(startTime).div(OneDaySeconds);
        uint256 currentPeriod = (now - startTime).div(OneDaySeconds);
        if (currentPeriod > lastPeriod) {
            volumnList.push(volumnOf24Hours);
            volumnOf24Hours = 0;
        }
        volumnOf24Hours = volumnOf24Hours.add(_amount);
        lastRecordTime = now;
    }
            
    function convertThreePath(address[3] memory path) private pure returns(address[] memory newPath) {
        newPath = new address[](path.length);
        for (uint256 i = 0; i < path.length; i++) {
            newPath[i] = path[i];
        }
    }
    
    function convertTwoPath(address[2] memory path) private pure returns(address[] memory newPath) {
        newPath = new address[](path.length);
        for (uint256 i = 0; i < path.length; i++) {
            newPath[i] = path[i];
        }
    }

    function swap(uint256 _orderId, ResultInfo memory _bestSwapInfo, address _inToken, address _outToken, uint256 _amountIn, bool _bInner) private returns(uint256) {
        if (!_bInner) {
            ERC20(_inToken).transferFrom(msg.sender, address(this), _amountIn);
        }
        ERC20(_inToken).approve(address(boboRouter), _amountIn);
        uint256 amountOut = boboRouter.swap(_bestSwapInfo, _inToken, _outToken, _amountIn, msg.sender);
        setAMMDealOrder(_orderId, amountOut);
        
        NFTInfo memory orderInfo = orderNFT.getOrderInfo(_orderId); 
        for (uint256 i = 0; i < _bestSwapInfo.types.length && _bestSwapInfo.types[i] != SwapPool.No; i++) {
            address middleToken = _bestSwapInfo.middleTokens[i];
            address[] memory path = middleToken != address(0) ? convertThreePath([_inToken, middleToken, _outToken]) : convertTwoPath([_inToken, _outToken]);
            addOrderDetail(orderInfo.owner, _orderId, 
                           _bestSwapInfo.partialAmountIns[i], 
                           _bestSwapInfo.partialAmountOuts[i], 
                           _bestSwapInfo.types[i],
                           path);
        }
        makeStatistic(_inToken == baseToken ? _amountIn : amountOut);
        return amountOut;
    }
    
    function getCurrentPrice() view public returns(uint256) {
        (, ResultInfo memory bestSwapInfo) = boboRouter.getBestSwapPath(baseToken, quoteToken, BasePriceAmount);
        uint256 amountOut = bestSwapInfo.totalAmountOut;
        uint256 spotPrice = BasePriceAmount.mul(10**quoteTokenDecimals).div(amountOut);
        return spotPrice;
    }

    function getTotalHangingTokenAmount(address _userAddr) view public returns(uint256 baseTokenAmount, uint256 quoteTokenAmount) {
        uint256 length = getUserHangingOrderNumber(_userAddr);
        for (uint256 i = 0; i < length; i++) {
            uint256 orderId = getUserHangingOrderId(_userAddr, i);
            NFTInfo memory orderInfo = orderNFT.getOrderInfo(orderId); 
            if (orderInfo.bBuyQuoteToken) {
                baseTokenAmount = baseTokenAmount.add(orderInfo.inAmount);
            } else {
                quoteTokenAmount = quoteTokenAmount.add(orderInfo.inAmount);
            }
        }
    }
        
    function executeInnerOrder(uint256 _orderId) private returns(uint256 amountOut) {
        NFTInfo memory orderInfo = orderNFT.getOrderInfo(_orderId); 
        (address inToken, address outToken) = orderInfo.bBuyQuoteToken ? (baseToken, quoteToken) : (quoteToken, baseToken);
        (, ResultInfo memory bestSwapInfo) = boboRouter.getBestSwapPath(inToken, outToken, orderInfo.inAmount);
        if (bestSwapInfo.totalAmountOut >= orderInfo.minOutAmount) {
            bool bSuccess = exManager.burnTradePoints(orderInfo.owner, 1);
            if (bSuccess) {
                if (boboFarmer.tokenPidMap(inToken) > 0) {
                    boboFarmer.withdraw(inToken, orderInfo.owner, orderInfo.inAmount);
                }
                amountOut = swap(_orderId, bestSwapInfo, inToken, outToken, orderInfo.inAmount, true);
            } else {
                setExceptionOrder(_orderId, "Trade points is NOT enough.");
            }
        } else {
            setExceptionOrder(_orderId, "Amount out can NOT satisfy the min amount out of order.");
        }
    }
    
    // 执行一笔买单或卖单（满足价格条件）
    function executeHeaderOrder() public returns(bool) {
        uint256 currentPrice = getCurrentPrice();
        
        (bool existOfBuy, uint256 orderIdOfBuy) = getHeaderOrderIndex(true);
        uint256 highestPriceOfBuy = existOfBuy ? getValue(orderIdOfBuy) : 0;
        
        (bool existOfSell, uint256 orderIdOfSell) = getHeaderOrderIndex(false);
        uint256 lowestPriceOfSell = existOfSell ? getValue(orderIdOfSell) : uint256(-1);
        
        uint256 executedOrderId = 0;
        if (currentPrice <= highestPriceOfBuy) {
            executedOrderId = orderIdOfBuy;
        } else if (currentPrice > lowestPriceOfSell) {
            executedOrderId = orderIdOfSell;
        }
        if (executedOrderId > 0) {  
            executeInnerOrder(executedOrderId);
            return true;
        }
        return false;
    }
    
    // 根据配置连续检查并执行多笔订单
    // 当当前价格不满足要求时，便退出
    function checkOrderList() public {
        uint256 maxNumberPerAMMSwap = exManager.maxNumberPerAMMSwap();
        while(maxNumberPerAMMSwap-- > 0) {
            bool result = executeHeaderOrder();
            if (!result) break;
        }
    }
    
    function cancelOrder(uint256 _orderId) public returns(bool) {
        setManualCancelOrder(_orderId); 
    }
    
}