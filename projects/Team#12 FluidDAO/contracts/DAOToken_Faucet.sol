// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IFluidDAOToken.sol";
import "./Interface/IIOSGUSDTPrice.sol";

contract DAOToken_Faucet {
    
    IFluidDAOToken public faucetToken;
    IIOSGUSDTPrice public daoPrice;
    uint256 public distributionDuration; //default 5 minutes

    mapping (address => uint256) internal nextAvailableTime;


    constructor(address tokenAddress, uint256 _distributionDuration, address daoPriceAddress) {
        faucetToken = IFluidDAOToken(tokenAddress);
        distributionDuration = _distributionDuration;
        daoPrice = IIOSGUSDTPrice(daoPriceAddress);
    }

    /** ========== public mutative functions ========== */
    function distribute(uint256 amount) public requireAvailableTime {
        require(amount <= faucetToken.balanceOf(address(this)), "Sorry, no enough token to distribute, please wait for a while");
        require(distributionDuration > 0, "distribution duration must be set");

        uint newAvailableTime = block.timestamp + distributionDuration;
        nextAvailableTime[msg.sender] = newAvailableTime;
        faucetToken.transfer(msg.sender, amount);

        emit newDistributed(msg.sender, amount);
    }

    function exchangeForDAOToken() public payable requireAvailableTime {
        uint256 exchangeRate = daoPrice.getLatestUSDTPrice();
        uint256 exchangedAmount = msg.value * exchangeRate;
        
        require(faucetToken.balanceOf(address(this)) > exchangedAmount, "Sorry, no enough token to exchange");
        faucetToken.transfer(msg.sender, exchangedAmount);

        emit newExchanged(msg.sender, exchangedAmount);
    }


    /** ========== public view functions ========== */
    function faucetBalance() public view returns (uint256) {
        return faucetToken.balanceOf(address(this));
    }

    function availableTime() public view returns (uint256) {
        return nextAvailableTime[msg.sender];
    }

    /** ========== modifier ========== */
    modifier requireAvailableTime() {
        require(block.timestamp >= nextAvailableTime[msg.sender], "Sorry, please do not acquire frequently");
        _;
    }

    /** ========== event ========== */
    event newDistributed(address indexed receiver, uint256 amount);

    event newExchanged(address indexed receiver, uint256 amount);
}