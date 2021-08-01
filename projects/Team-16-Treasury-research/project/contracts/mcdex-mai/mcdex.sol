// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity 0.7.4;


interface IPerpetual {
    /**
     * @notice Trade with AMM in the perpetual, require sender is granted the trade privilege by the trader.
     *         The trading price is determined by the AMM based on the index price of the perpetual.
     *         Trader must be initial margin safe if opening position and margin safe if closing position
     * @param perpetualIndex The index of the perpetual in the liquidity pool
     * @param trader The address of trader
     * @param amount The position amount of the trade
     * @param limitPrice The worst price the trader accepts
     * @param deadline The deadline of the trade
     * @param referrer The referrer's address of the trade
     * @param flags The flags of the trade
     * @return int256 The update position amount of the trader after the trade
     */
    function trade(
        uint256 perpetualIndex,
        address trader,
        int256 amount,
        int256 limitPrice,
        uint256 deadline,
        address referrer,
        uint32 flags
    ) external returns (int256);
    
    
    /**
     * @notice  Deposit collateral to the perpetual.
     *          Can only called when the perpetual's state is "NORMAL".
     *          This method will always increase `cash` amount in trader's margin account.
     *
     * @param   perpetualIndex  The index of the perpetual in the liquidity pool.
     * @param   trader          The address of the trader.
     * @param   amount          The amount of collateral to deposit. The amount always use decimals 18.
     */
    function deposit(
        uint256 perpetualIndex,
        address trader,
        int256 amount
    ) external;
}

interface IERC20 {
    function approve(address _spender, uint256 _value) external returns (bool success) ;
}

contract McdexTrade{
    
    /**
     * approve
     */
    function approve() public {
        IERC20(address(0x09b98F8b2395D076514037fF7D39a091a536206C)).approve(address(0xc32a2dfEe97E2bABc90a2b5e6aef41e789ef2E13), 200 * 10**18);
    }
    
    
    /**
     * deposit
     */
    function deposit() public {
        IPerpetual(address(0xc32a2dfEe97E2bABc90a2b5e6aef41e789ef2E13)).deposit(8,address(this),200 * 10**18);
    }

    /**
     *  tradeBuy
     * 如果你是合约调用并且抵押物在合约中，trader应该是你的合约地址
     * 合约调用时block.timestamp不可能改变，所以deadline填block.timestamp
     * referrer是返点地址，可以是0，也可以是你们团队
     * flag填0
     * flag为0时，要先调用deposit函数
     * index 8，amount是抵押物
     * 
     * 做多amount为正数，做空为负数
     */
     function tradeBuy() public {
        IPerpetual(address(0xc32a2dfEe97E2bABc90a2b5e6aef41e789ef2E13)).trade(8,address(this),1* 10**18,30* 10**18,block.timestamp,address(0),0);
    }


    /**
     *  tradeSell
     * 如果你是合约调用并且抵押物在合约中，trader应该是合约地址
     * 合约调用时block.timestamp不可能改变，所以deadline填block.timestamp
     * referrer是返点地址，可以是0，也可以是团队地址
     * flag填0
     * flag为0时，要先调用deposit函数
     * index 8，amount是抵押物
     * 
     * 做多amount为正数，做空为负数
     */
    function tradeSell() public {
        IPerpetual(address(0xc32a2dfEe97E2bABc90a2b5e6aef41e789ef2E13)).trade(8,address(this),1* 10**18,-30* 10**18,block.timestamp,address(0),0);
    }
}
