// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./BasicStruct.sol";

contract MixinAuthorizable is Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;
    EnumerableSet.AddressSet private authorities;
    
    // modifier for mint function
    modifier onlyAuthorized() {
        require(isAuthorized(msg.sender), "SENDER_NOT_AUTHORIZED");
        _;
    }
    
    constructor() public {
    }

    function addAuthorized(address _authorizedAddr) public onlyOwner returns (bool) {
        require(_authorizedAddr != address(0), "MixinAuthorizable: _addAuthorized is the zero address");
        return EnumerableSet.add(authorities, _authorizedAddr);
    }

    function delAuthorized(address _authorizedAddr) public onlyOwner returns (bool) {
        require(_authorizedAddr != address(0), "MixinAuthorizable: _delAuthorized is the zero address");
        return EnumerableSet.remove(authorities, _authorizedAddr);
    }

    function getAuthorizedLength() public view returns (uint256) {
        return EnumerableSet.length(authorities);
    }

    function isAuthorized(address _authorizedAddr) public view returns (bool) {
        return EnumerableSet.contains(authorities, _authorizedAddr);
    }

    function getAuthorized(uint256 _index) public view returns (address){
        require(_index <= getAuthorizedLength() - 1, "MixinAuthorizable: index out of bounds");
        return EnumerableSet.at(authorities, _index);
    }
    
}