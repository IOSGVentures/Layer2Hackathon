// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FluidDAOToken is ERC20, Ownable {


    constructor (
        string memory _name, 
        string memory _symbol, 
        address _owner,
        uint256 initialSupply) ERC20(_name, _symbol) {
        _mint(_owner, initialSupply);
    }

    /** ========== public mutative functions ========== */

    /** ========== public view functions ========== */


    /** ========== external mutative functions ========== */
    function mint(address receiver, uint256 newsupply) external onlyOwner {
        _mint(receiver, newsupply);
    }

    /** ========== external view functions ========== */


    /** ========== modifier ========== */

    /** ========== event ========== */
}