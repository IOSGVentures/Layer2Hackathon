// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
import "./common/Minter.sol";


contract BOBOToken is ERC20, Minter {
    uint256 private constant maxSupply = 100000000 * 1e18;     // the total supply

    constructor() public ERC20("Bobo meta Token", "BOBO") {
    }

    // mint with max supply
    function mint(address _to, uint256 _amount) public onlyMinter returns (bool) {
        if (_amount.add(totalSupply()) > maxSupply) {
            return false;
        }
        _mint(_to, _amount);
        return true;
    }
}