// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./GroupRegister.sol";

abstract contract FluidActivity is GroupRegister{
    
    struct Activity {
        uint256 startTime;
        uint256 endTime;
        uint256 roundGroupAmount;
        // address warrantAddress;   // each group will get one of the warrants
    }

    // activity details of per round.
    mapping (uint256 => Activity) internal votingRound;

    // voteId => group. And the voteId is the tokenId of per gruop per round.
    mapping (uint256 => mapping(uint256 => bytes32)) internal groupInVoting;

    // total group amount per round.
    mapping (uint256 => uint256) internal totalGroupAmount;

    // total tokenIds per round.
    mapping (uint256 => uint256[]) internal tokenIdsPerRound;

    uint256 internal currentRound;

    address internal initiator;

    constructor (
        address _initiator, 
        address __warrant
        ) GroupRegister(__warrant) {
        initiator = _initiator;
    }

    /** ========== public view functions ========== */
    function getCurrentRound() public view returns (uint256) {
        return currentRound;
    }

    function getGroupname(
        uint256 _currentRound, 
        uint256 voteId
        ) public view returns (bytes32 _groupname) {
        return groupInVoting[_currentRound][voteId];
    }

    function getTokenIdPerRound() public view returns (uint256[]) {
        return tokenIdsPerRound[currentRound];
    }

    function getActivityDetail(uint256 round) public view returns (
        uint256 _startTime,
        uint256 _endTime,
        uint256 _totalGroupAmount
    ) {
        Activity memory activity = votingRound[round];
        _startTime = activity.startTime;
        _endTime = activity.endTime;
        _totalGroupAmount = activity.totalGroupAmount;
    }

    function getCurrentActivity() public view returns (
        uint256 _startTime,
        uint256 _endTime,
        uint256 _totalGroupAmount
    ) {
        return getActivityDetail(getCurrentRound());
    }

    function getRemainingVotingTime() public view returns (uint256 remainingTime) {
        (uint256 startTime, uint265 endTime, ,) = getCurrentActivity();
        remainingTime = endTime - block.timestamp - startTime;
    }

    /** ========== external mutative functions ========== */

    function createNewActivity(uint256 startTime, uint256 endTime) external onlyInitiator {
        _setActivity(startTime, endTime);
    }

    function updateActivity(uint256 startTime, uint256 endTime) external onlyInitiator {
        require(block.timestamp < votingRound[currentRound].startTime, "Sorry, activity has been started");
        _setActivity(startTime, endTime);
    }

    function deleteActivity() external onlyInitiator {
        require(block.timestamp < votingRound[currentRound].startTime, "Sorry, activity has been started");
        delete votingRound[currentRound];
    }

    function registerForActivity(bytes32 groupname, string memory _tokenIdPath) external {
        _registerForActivity(groupname, _tokenIdPath);
    }

    /** ========== internal mutative functions ========== */
    function _setActivity(uint256 _startTime, uint256 _endTime) internal {
        require(endTime > startTime, "time setting is invalid");

        if(!_isFirstRound()) {
           require(block.timestamp > votingRound[currentRound-1].endTime, "Sorry, the previous activity has not been ended");
        }

        currentRound++;
        votingRound[currentRound].startTime = _startTime;
        votingRound[currentRound].endTime = _endTime;
        votingRound[currentRound].roundGroupAmount = 0;

        emit addedActivity(_startTime, _endTime);
    }

    function _registerForActivity(bytes32 groupname, string memory _tokenIdPath) internal {
        require(block.timestamp > votingRound[currentRound].startTime && block.timestamp < votingRound[currentRound].endTime, "sorry, there is no a valid activitiy");
        require(_getTokenIdOfPerGroup(groupname) == 0, "the group has been registered");

        (, address register,) = getGroupMessage(groupname);
        require(register == msg.sender, "Sorry, you are not the register of group");

        uint256 tokenId = _singleGroupRegister(register, _tokenIdPath);
        groupInVoting[currentRound][tokenId] = groupname;
        tokenIdsPerRound[currentRound].push(tokenId);
        _updateGroupAmount();

        emit newRoundGroupAdded(currentRound, register, tokenId);        
    }

    /** ========== internal view functions ========== */
    function _isFirstRound() internal view returns (bool) {
        return getCurrentRound() == 0? true : false;
    }

    /** ========== internal mutative functions ========== */
    function _updateGroupAmount() internal {
        require(totalGroupAmount[currentRound] == votingRound[currentRound].roundGroupAmount, "Sorry, the round group amount is not match");

        totalGroupAmount[currentRound] = totalGroupAmount[currentRound]+1;
        votingRound[currentRound].roundGroupAmount = totalGroupAmount[currentRound];

        emit updatedGroupAmount(currentRound, totalGroupAmount[currentRound]);
    }

    /** ========== modifier ========== */

    modifier onlyInitiator() {
        require(msg.sender == initiator, "Sorry, you do not have the authority to call");
        _;
    }

    /** ========== event ========== */
    event addedActivity(uint256 indexed currentRound, uint256 startTime, uint256 endTime, address warrant);

    event updatedGroupAmount(uint256 indexed currentRound, uint256 totalGroupAmount);

    event newRoundGroupAdded(uint256 indexed currentRound, address indexed group, uint256 tokenId);
}