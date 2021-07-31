// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "../interfaces/ICentralAdminControl.sol";

contract AdminAccessable is Context {
    ICentralAdminControl private _adminControl;

    constructor(ICentralAdminControl adminControl_) {
        _adminControl = adminControl_;
    }

    modifier onlyAdmin() {
        require(_adminControl.isAdmin(_msgSender()), "CenterRoleControl: require administrator account");
        _;
    }
}
