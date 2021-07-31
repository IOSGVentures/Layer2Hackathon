// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol"; 
import "../interfaces/ICentralAdminControl.sol";

contract CentralAdminControl is  ICentralAdminControl {
    using EnumerableSet for EnumerableSet.AddressSet;
    EnumerableSet.AddressSet private _adminSet;

    constructor() {
        _adminSet.add(msg.sender);
    }

    function getAdministrators() public view returns (address[] memory addresses) {
        addresses = new address[](_adminSet.length());
        for (uint256 index = 0; index < addresses.length; ++index) addresses[index] = _adminSet.at(index);
    }

    function addAdministrator(address account) public onlyAdmin {
        require(_adminSet.add(account), "AdminAccessControl: account already an administrator.");
    }

    function removeAdministrator(address account) public onlyAdmin {
        require(_adminSet.length() > 1, "AdminAccessControl: cannot remove last administrator.");
        require(_adminSet.remove(account), "AdminAccessControl: account not an administrator.");
    }

    function isAdmin(address account) public view override returns (bool) {
        return _adminSet.contains(account);
    }

    modifier onlyAdmin() {
        require(isAdmin(msg.sender), "AdminAccessControl: require administrator account");
        _;
    }
}
