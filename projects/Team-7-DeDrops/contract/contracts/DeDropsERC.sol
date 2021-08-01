// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import './Bank20.sol';

// import 'hardhat/console.sol';

contract DeDropsERC is Ownable {

    uint256 public length = 0;
    Bank20 public bank;

    event Drop(uint256 indexed id, address indexed token, uint256 amount, string info, string info2);

    struct Item {
        uint256 id;
        address token;
        uint256 amount;
        string info;
        string info2;
    }

    mapping (uint256 => Item) public idToItem;


    constructor(address bankAddress) public {
        bank = Bank20(bankAddress);
    }


    function drop(address token, uint256 amount, string calldata info, string calldata info2) external {
        uint256 id = ++length;
        idToItem[id] = Item(id, token, amount, info, info2);

        IERC20(token).transferFrom(msg.sender, address(this), amount);
        IERC20(token).approve(address(bank), amount);
        bank.deposit(token, owner(), amount);

        emit Drop(id, token, amount, info, info2);
    }
}