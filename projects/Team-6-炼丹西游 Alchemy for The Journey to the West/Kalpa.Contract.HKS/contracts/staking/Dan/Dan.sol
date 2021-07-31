// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../../utils/MinterGuard.sol";
import "../../utils/EzSponsor.sol";
import "../../interfaces/ISamsara.sol";
import "../../interfaces/IConsumable.sol";

contract Dan is MinterGuard, ERC20("Fake XianDan No2", "fDAN2"), IConsumable, EzSponsor {
    using EnumerableSet for EnumerableSet.AddressSet;
    EnumerableSet.AddressSet consumers;

    address private _samsara;

    constructor(ICentralAdminControl adminControl_) MinterGuard(adminControl_) {}

    function changeRecycleAddress(address samsara_) public onlyAdmin {
        _samsara = samsara_;
    }

    function mint(address to, uint256 amount) public minterOnly {
        _mint(to, amount);
    }

    function consume(address account, uint256 amount) public override consumerOnly {
        _burn(account, amount);
        if (uint160(_samsara) != 0) ISamsara(_samsara).addRecycledToken(amount);
    }

    function removeConsumer(address consumer_) public onlyAdmin {
        require(consumers.remove(consumer_), "Dan: not a consumer.");
    }

    function addConsumer(address consumer_) public onlyAdmin {
        require(consumers.add(consumer_), "Dan: already a consumer.");
    }

    modifier consumerOnly() {
        require(consumers.contains(_msgSender()), "Dan: caller is not a consumer.");
        _;
    }
}
