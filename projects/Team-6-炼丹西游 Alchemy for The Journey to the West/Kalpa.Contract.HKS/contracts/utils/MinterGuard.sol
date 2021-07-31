// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "../access/AdminAccessable.sol";

contract MinterGuard is AdminAccessable {
    using EnumerableSet for EnumerableSet.AddressSet;
    EnumerableSet.AddressSet _minters; 

    constructor(ICentralAdminControl adminControl_) AdminAccessable(adminControl_) {}

    function removeMinter(address minter_) public onlyAdmin {
        require(_minters.remove(minter_), "MinterGuard: not a minter.");
    }

    function addMinter(address minter_) public onlyAdmin {
        require(_minters.add(minter_), "MinterGuard: already a minter.");
    }

    modifier minterOnly() {
        require(_minters.contains(_msgSender()), "MinterGuard: caller is not a minter.");
        _;
    }
}
