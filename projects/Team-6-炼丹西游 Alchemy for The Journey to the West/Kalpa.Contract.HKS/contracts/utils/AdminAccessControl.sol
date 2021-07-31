// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/Context.sol";

abstract contract AdminAccessControl is Context {
    using EnumerableSet for EnumerableSet.AddressSet;
    EnumerableSet.AddressSet private _adminSet;

    constructor() {
        _adminSet.add(_msgSender());
    }

    function getAdministrators() public view returns (address[] memory addresses) {
        addresses = new address[](_adminSet.length());
        for (uint256 index = 0; index < addresses.length; ++index) addresses[index] = _adminSet.at(index);
    }

    function addAdministrator(address account) public onlyAdmin {
        require(_adminSet.add(account), "AccessControl: account already an administrator.");
    }

    function clearAdministrator(address account) public onlyAdmin {
        require(_adminSet.length() > 1, "AccessControl: cannot remove last administrator.");
        require(_adminSet.remove(account), "AccessControl: account not an administrator.");
    }

    modifier onlyAdmin() {
        require(_adminSet.contains(_msgSender()), "AccessControl: require administrator account");
        _;
    }
}
