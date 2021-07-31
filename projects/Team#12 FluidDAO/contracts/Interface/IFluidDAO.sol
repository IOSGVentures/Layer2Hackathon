interface IFluidDAO {


    // activity section
    function getCurrentRound() external view returns (uint256);

    function getVoteId(
        uint256 _currentRound, 
        bytes32 _groupname
        ) external view returns (uint256 voteId);
    

    function getActivityDetail(uint256 round) external view returns (
        uint256 _startTime,
        uint256 _endTime,
        uint256 _totalGroupAmount,
        address _warrantAddress
    )

    function getCurrentActivity() external view returns (
        uint256 _startTime,
        uint256 _endTime,
        uint256 _totalGroupAmount,
        address _warrantAddress
    )

    function getRemainingVotingTime() external view returns (uint256 remainingTime)





    // group section
    function getGroupMessage(bytes32 _groupname) external view returns (
        string memory _description,
        address _fundReceiver,
        address _groupregister
    )

}