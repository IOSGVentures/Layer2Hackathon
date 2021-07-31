// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./StakingBase2.sol";
import "../../buildin/Staking.sol";

abstract contract StakingOperation is StakingBase2 {
    Staking private constant STAKING = Staking(address(0x0888000000000000000000000000000000000002));

    uint8 private constant defaultDecimals = 18;

    receive() external payable {}

    function basePay() external payable {}

    function addPool(address tokenAddress, uint56 sumWuxing) public {
        _add(tokenAddress, sumWuxing);
    }

    function setPool(address tokenAddress, uint56 sumWuxing) external {
        _set(tokenAddress, sumWuxing);
    }

    function deposit(address[] calldata tokenAddress, uint256[] calldata amounts) external payable nonReentrant {
        if (msg.value == 0) _deposit(tokenAddress, amounts);
        else {
            uint256 length = tokenAddress.length;
            address[] memory withCfxAddresses = new address[](length + 1);
            uint256[] memory withCfxAmounts = new uint256[](length + 1);
            for (uint256 index = 0; index < tokenAddress.length; ++index) {
                withCfxAddresses[index] = tokenAddress[index];
                withCfxAmounts[index] = amounts[index];
            }
            withCfxAddresses[length] = address(0);
            withCfxAmounts[length] = msg.value;
            _stakeCFX(msg.value);
            _deposit(withCfxAddresses, withCfxAmounts);
        }
        for (uint256 index = 0; index < tokenAddress.length; ++index) {
            require(IERC20(tokenAddress[index]).transferFrom(_msgSender(), address(this), amounts[index]), "Staking: transfer-in failed");
        }
    } 

    function withdraw(address[] calldata tokenAddress, uint256[] calldata amounts) external nonReentrant {
        _withdraw(tokenAddress, amounts);
        uint256 unstakedCFX = 0;
        for (uint256 index = 0; index < tokenAddress.length; ++index) {
            if (tokenAddress[index] == address(0)) unstakedCFX += amounts[index];
            else require(IERC20(tokenAddress[index]).transfer(_msgSender(), amounts[index]), "Staking: transfer-out failed");
        }
        if (unstakedCFX > 0) _unstakeCFX(unstakedCFX);
    }
 
    function emergencyWithdraw() external nonReentrant {
        uint256 cfxAmount = _emergencyWithdraw();
        if (cfxAmount > 0) _unstakeCFX(cfxAmount);
    }

    function _stakeCFX(uint256 amount) private {
        STAKING.deposit(amount);
    }

    function _unstakeCFX(uint256 amount) private {
        uint256 currentBalance = address(this).balance;
        STAKING.withdraw(amount);
        payable(_msgSender()).transfer(amount);
        devAddress.transfer(address(this).balance - currentBalance);
    }
}
