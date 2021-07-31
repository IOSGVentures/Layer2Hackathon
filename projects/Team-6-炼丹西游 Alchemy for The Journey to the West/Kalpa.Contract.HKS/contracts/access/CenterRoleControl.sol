// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

contract CentralRoleControl is AccessControlEnumerable {
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    function getAdministrators() public view returns (address[] memory addresses) {
        addresses = new address[](getRoleMemberCount(DEFAULT_ADMIN_ROLE));
        for (uint256 index = 0; index < addresses.length; ++index) addresses[index] = getRoleMember(DEFAULT_ADMIN_ROLE, index);
    }

    function grantAdministrator(address account) public onlyAdmin {
        grantRole(DEFAULT_ADMIN_ROLE, account);
    }

    function renonceAdministrator() public onlyAdmin {
        require(getRoleMemberCount(DEFAULT_ADMIN_ROLE) > 1, "CenterRoleControl: cannot revoke last admin");
        renounceRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    function revokeAdministrator(address account) public onlyAdmin {
        require(getRoleMemberCount(DEFAULT_ADMIN_ROLE) > 1, "CenterRoleControl: cannot revoke last admin");
        renounceRole(DEFAULT_ADMIN_ROLE, account);
    }

    modifier onlyAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "CenterRoleControl: require administrator account");
        _;
    }
}
