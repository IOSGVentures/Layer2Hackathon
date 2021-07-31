// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@superfluid-finance/ethereum-contracts/contracts/interfaces/IConstantFlowAgreementV1.sol";
import "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../Interface/IWarrant.sol";
import "./FluidActivity.sol";

contract FluidVote {

    address internal voteToken;
    address internal warrantAddress;
    ISuperfluid private _host; // host
    IConstantFlowAgreementV1 private _cfa; // the stored constant flow agreement class address
    ISuperToken private _acceptedToken; // accepted token

    constructor(
        address voteToken_,
        address warrantAddress_,
        ISuperfluid host,
        IConstantFlowAgreementV1 cfa,
        ISuperToken acceptedToken
    ) {
        require(address(voteToken_) != address(0), "0 address is not allowed");
        require(address(groupAddress_) != address(0), "0 address is not allowed");
        require(address(host) != address(0), "0 address is not allowed");
        require(address(cfa) != address(0), "0 address is not allowed");
        require(address(acceptedToken) != address(0), "0 address is not allowed");

        voteToken = voteToken_;
        warrantAddress = warrantAddress_;
        _host = host;
        _cfa = cfa;
        _acceptedToken =  acceptedToken;
    }
    

    /** ========== external mutative functions ========== */

    /**
     * @dev user vote to their targeted group
     * @param voteId is the number of the targeted group and the tokenId of warrant address 
     * @param amount vote amount which will be sent to group through superfluid stream
     * @param flowRate is 'amount/per second' which meaning transfer speed through superfluid stream.
     * @notice the result of flowRate is an weird number which is calculated by 'transferred number' * 1e18 / (block.timestamp - vote end time).
     * and the flowRate will be calculated by frondend.
     */
    function vote(bytes32 groupname, uint256 voteId, uint256 amount, uint256 flowRate) external {
        require(IERC20(voteToken).balanceOf(msg.sender) >= amount, "Sorry, no enough token to vote");
        require(IWarrant(warrantAddress).ownerOf(voteId) != address(0), "Sorry, voting Id is invalid");

        require(getRemainingVotingTime() >= 0, "voting is over");
        require(getVoteId(getCurrentRound(), groupname) == voteId, "Invalid vote");
        
        _host.callAgreement(
            _cfa,
            abi.encodeWithSelector(
                _cfa.createFlow.selector,
                _acceptedToken,
                address(this),
                flowRate,
                new bytes(0)
            ),
            "0x"
        );

    }

    function finalizeVoting() external {

    }


    /** ========== internal mutative functions ========== */
}
