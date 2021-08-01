// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC1155/ERC1155Receiver.sol';
import './Bank1155.sol';

// import 'hardhat/console.sol';

contract DeDropsNFT is ERC1155('dedrops.xyz'), Ownable {

    uint256 public length = 0;
    Bank1155 public bank;

    event Drop(uint256 indexed id, uint256 amount, string info, string info2);

    struct Item {
        uint256 id;
        uint256 amount;
        string info;
        string info2;
    }

    mapping (uint256 => Item) public idToItem;


    constructor(address bankAddress) public {
        bank = Bank1155(bankAddress);
    }


    function mint(uint256 amount, string calldata info, string calldata info2) external {
        uint256 id = ++length;
        idToItem[id] = Item(id, amount, info, info2);

        _mint(msg.sender, id, amount, '');
        safeTransferFrom(msg.sender, address(bank), id, amount, addressToBytes(owner()));

        emit Drop(id, amount, info, info2);
    }


    function addressToBytes(address addr) internal pure returns (bytes memory) {
        bytes20 addrBytes = bytes20(uint160(addr));
        bytes memory rtn = new bytes(20);
        for (uint8 i = 0; i < 20; i++) {
            rtn[i] = addrBytes[i];
        }
        return rtn;
    }
}