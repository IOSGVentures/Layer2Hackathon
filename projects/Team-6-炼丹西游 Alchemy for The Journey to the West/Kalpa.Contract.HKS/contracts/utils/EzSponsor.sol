// SPDX-License-Identifier: MIT 
pragma solidity >=0.5.0;

abstract contract EzSponsor {
    constructor() {
        NanoSponsorControl SPONSOR = NanoSponsorControl(address(0x0888000000000000000000000000000000000001));
        address[] memory a = new address[](1);
        a[0] = address(0);
        SPONSOR.addPrivilege(a);
    }
}

interface NanoSponsorControl {
    // ------------------------------------------------------------------------
    // Add commission privilege for address `user` to some contract.
    // ------------------------------------------------------------------------
    function addPrivilege(address[] memory) external;
}
