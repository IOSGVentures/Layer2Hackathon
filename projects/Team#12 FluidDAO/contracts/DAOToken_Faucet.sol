// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IFluidDAOToken.sol";

contract DAOToken_Faucet {
    
    IFluidDAOToken public faucetToken;
    uint256 public distributionDuration; //default 5 minutes

    mapping (address => uint256) internal nextAvailableTime;


    constructor(address tokenAddress, uint256 _distributionDuration) {
        faucetToken = IFluidDAOToken(tokenAddress);
        distributionDuration = _distributionDuration;
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
}