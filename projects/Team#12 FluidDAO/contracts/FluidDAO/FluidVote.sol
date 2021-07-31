// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {
    IConstantFlowAgreementV1
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";
import {
    ISuperfluid,
    ISuperToken,
    ISuperApp,
    ISuperAgreement,
    SuperAppDefinitions
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./FluidActivity.sol";

abstract contract FluidVote is FluidActivity {
    using SafeMath for uint256;

    address internal voteToken;
    address internal warrantAddress;
    ISuperfluid private _host; // host
    IConstantFlowAgreementV1 private _cfa; // the stored constant flow agreement class address
    ISuperToken private _acceptedToken; // accepted token
    ISuperAgreement private _sa;

    // total vote of per group on per round.
    mapping (uint256 => mapping(uint256 => uint256)) totalVotePerGroupPerRound;

    // only current round is over, the new round can be started.
    mapping (uint256 => bool) roundOver;

    constructor(
        address _initiator, 
        address voteToken_,
        address warrantAddress_,
        address host,
        address cfa,
        address acceptedToken,
        address twitterVerifyAddress
    ) FluidActivity(_initiator, warrantAddress_, twitterVerifyAddress) {
        require(address(voteToken_) != address(0), "0 address is not allowed");
        require(address(warrantAddress_) != address(0), "0 address is not allowed");
        require(address(host) != address(0), "0 address is not allowed");
        require(address(cfa) != address(0), "0 address is not allowed");
        require(address(acceptedToken) != address(0), "0 address is not allowed");

        voteToken = voteToken_;
        warrantAddress = warrantAddress_;
        _host = ISuperfluid(host);
        _cfa = IConstantFlowAgreementV1(cfa);
        _acceptedToken =  ISuperToken(acceptedToken);
        _sa = ISuperAgreement(host);
        
    }

    /** ========== public view functions ========== */
    function totalVotePerGroupPerRound(bytes32 groupname) public view returns (uint256) {
        uint256 tokenId = _getTokenIdOfPerGroup(groupname);
        uint256 _currentRound = getCurrentRound();
        uint256 groupVote = totalVotePerGroupPerRound[_currentRound][tokenId];
        return groupVote;
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
        require(ISuperToken(voteToken).balanceOf(msg.sender) >= amount, "Sorry, no enough token to vote");

        (uint256 startTime, uint256 endTime, ,) = getCurrentActivity();
        require(block.timestamp > startTime && block.timestamp < endTime, "There is no a valid activity");
        require(getRemainingVotingTime() >= 0, "voting is over");
        require(getVoteId(getCurrentRound(), groupname) == voteId, "Invalid vote");
        require(_isPerviousRoundOver(), "the previous round must be over");
        uint256 _currentRound = getCurrentRound();
        
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

        totalVotePerGroupPerRound[_currentRound][voteId] = totalVotePerGroupPerRound[_currentRound][voteId].add(amount);

        emit voted(groupname, voteId, amount);
    }

    /**
     * @dev user have the authority to cancal vote during the vote period
     * @param voteId is the number of the targeted group and the tokenId of warrant address 
     */
    function cancelVote(uint256 voteId) external {
        (dynamicBalance, , ) = _sa.realtimeBalanceOf(_acceptedToken, address(this));
        require(dynamicBalance > 0, "the stream is over");
        uint256 _currentRound = getCurrentRound();

        _host.callAgreement(
            _cfa,
            abi.encodeWithSelector(
                _cfa.deleteFlow.selector,
                _acceptedToken,
                msg.sender,
                address(this),
                new bytes(0)
            ),
            "0x"
        );

        totalVotePerGroupPerRound[_currentRound][voteId] = totalVotePerGroupPerRound[_currentRound][voteId].sub(dynamicBalance);
        
        emit voteCancelled(voteId);
    }

    /**
     * @dev user have the authority to reset vote amount during vote period
     * @param voteId is the number of the targeted group and the tokenId of warrant address 
     * @param newamount new vote amount which will be sent to group through superfluid stream
     * @param flowRate is 'amount/per second' which meaning transfer speed through superfluid stream.
     * @notice the result of flowRate is an weird number which is calculated by 'transferred number' * 1e18 / (block.timestamp - vote end time).
     * and the flowRate will be calculated by frondend.
     */
    function resetVote(uint256 voteId, uint256 newamount, uint256 newflowRate) external {
        (dynamicBalance, , ) = _sa.realtimeBalanceOf(_acceptedToken, address(this));
        require(dynamicBalance > 0, "the stream is over");
        uint256 _currentRound = getCurrentRound();

        _host.callAgreement(
            _cfa,
            abi.encodeWithSelector(
                _cfa.deleteFlow.selector,
                _acceptedToken,
                msg.sender,
                address(this),
                new bytes(0)
            ),
            "0x"
        );

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

        
        totalVotePerGroupPerRound[_currentRound][voteId] = totalVotePerGroupPerRound[_currentRound][voteId].sub(dynamicBalance);
        totalVotePerGroupPerRound[_currentRound][voteId] = totalVotePerGroupPerRound[_currentRound][voteId].add(newamount);

        emit voteReset(voteId, newamount);
    }


    /**
     * @dev finalize the vote when the current round is over. 
     * Even though currently all streaming token will not be stopped becase superfluid's constantFlow,
     * but because users only are distributed pointed amount that there will not be more token to be streamed.
     */
    function finalizeVoting() external {
        uint256 _currentRound = getCurrentRound();
        ( ,uint256 endTime, uint256 _totalGroupAmount,) = getCurrentActivity();

        require(_isPerviousRoundOver(), "the previous round must be over");
        require(block.timestamp > endTime, "the vote is still on");
        require(_totalGroupAmount == getTokenIdPerRound(_currentRound).length, "tokenIds not match");

        uint256[] voteIds = getTokenIdPerRound(_currentRound);
        (uint256 maxVote, uint256 tokenIdWithHighestVote) = _fundTokenIdWithHighestVote(_currentRound, _totalGroupAmount, voteIds);

        _sumVotePerGroupPerRound(_currentRound, _totalGroupAmount, voteIds);
        roundOver[_currentRound] = false;
        _transferToWinner(maxVote, tokenIdWithHighestVote);

        emit voteFinalized(_currentRound, maxVote, tokenIdWithHighestVote);
    }


    /** ========== internal view functions ========== */

    function _isPerviousRoundOver() internal view returns (bool) {
        uint256 previousRound = getCurrentRound() - 1;
        return roundOver[previousRound];
    }

    function _fundTokenIdWithHighestVote(uint256 currentRound, uint256 totalGroupAmount, uint256[] voteIds) internal view returns (uint256 maxVote, uint256 tokenIdWithHighestVote) {
        require(voteIds.length == _totalGroupAmount, "amount not match");

        for(uint256 i = 0; i < _totalGroupAmount; i ++ ) {
            if(maxVote - totalVotePerGroupPerRound[currentRound][voteIds[i]]] < 0 ) {
                tokenIdWithHighestVote = voteIds[i];
                maxVote = totalVotePerGroupPerRound[currentRound][voteIds[i]];
            }
        }
    }

    /** ========== internal mutative functions ========== */
    function _sumVotePerGroupPerRound(uint256 currentRound, uint256 totalGroupAmount_, uint256[] voteIds) internal returns (uint256) {
        require(voteIds.length == totalGroupAmount_, "amount not match");

        uint256 totalVote;
        for(uint256 i = 0; i < totalGroupAmount_; i ++ ) {
            totalVote = totalVote.add(totalVotePerGroupPerRound[currentRound][voteIds]);
            _cleanVote(currentRound, i);
        }

        return totalVote;
    }

    function _cleanVote(uint256 currentRound, uint256 voteId) internal {
        totalVotePerGroupPerRound[getCurrentRound()][voteId] = 0;
    }

    function _transferToWinner(uint256 maxVote, uint256 tokenIdWithHighestVote) internal {
        bytes32 groupname = getGroupname(getCurrentRound(), tokenIdWithHighestVote);
        address fundReceiver = getGroupFundReceiver(groupname);

        require(_acceptedToken.transfer(fundReceiver, maxVote), "fail to transfer");

        emit transferredToWinner(fundReceiver, tokenIdWithHighestVote, maxVote);
    }

    /** ========== event ========== */
    event voted(bytes32 indexed groupname, uint256 indexed voteId, uint256 amount);

    event voteCancelled(uint256 indexed voteId);

    event voteReset(uint256 indexed voteId, uint256 newamount);

    event voteFinalized(uint256 indexed currentRound, uint256 maxVote, uint256 tokenIdWithHighestVote);

    event transferredToWinner(address indexed fundReceiver, uint256 indexed tokenIdWithHighestVote, uint256 maxVote);
}