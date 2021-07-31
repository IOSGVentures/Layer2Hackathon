// SPDX-License-Identifier: MIT
pragma solidity ^0.6.6;

import "@chainlink/contracts/src/v0.6/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";

interface linkToken {
    function balanceOf(address account) external returns (uint256);
}

/**
* @title IOSG 随机数合约
*/
contract RandomNumberConsumer is VRFConsumerBase {
    bytes32  _requestId;
    bytes32 internal keyHash;
    uint256 internal fee;

    uint256 public randomResult;

    constructor(address VRFCoordinator, address LINKToken, bytes32 _keyHash)
    VRFConsumerBase(
        VRFCoordinator, //Kovan VRF Coordinator 0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9
        LINKToken    // Kovan LINK Token 0xa36085F69e2889c224210F603D836748e7dC0088
    ) public
    {
        keyHash = _keyHash;
        //0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4;

        fee = 0.1 * 10 ** 18;
    }

    /**
    * @dev 获取随机数
    * @param 随机性
    */
    function getRandomNumber(uint256 randomness) public returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - fill contract with faucet");
        fulfillRandomness(requestRandomness(keyHash, fee), randomness);
        return requestRandomness(keyHash, fee);
    }

    /**
    * @dev 回调函数
    * @param requestId 请求ID
    * @param randomness 随机性
    */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        _requestId = requestId;
        randomResult = (randomness % 50) + 1;
    }

    /**
    * @dev 获得随机结果
    * @return 随机数结果
    */
    function getRandomResult() public view returns (uint256){
        return randomResult;
    }
}


/**
* @title IOSG 推特验证
*/
contract twitterVerify is ChainlinkClient {
    address private oracle;
    bytes32 private jobId;
    uint256 private fee;
    RandomNumberConsumer randomNumberConsumer;
    linkToken public link;

    struct userTwitter {
        bytes32 requestId;
        string twitterId;
        string retweetId;
        bool verified;
    }

    mapping(address => userTwitter) public userTwitterMap;

    /**
    * @dev 合约部署
    * @param _link link地址
    * @param _randomNumberConsumer 随机数合约地址
    **/
    constructor(linkToken _link, RandomNumberConsumer _randomNumberConsumer) public {
        randomNumberConsumer = _randomNumberConsumer;
        link = _link;
        setPublicChainlinkToken();
        oracle = 0xa04803C3cbd890083D668e7fc3cE44863ff9df31;
        jobId = "0c02ce5432944c3fbf0f8f7eca6ae8b8";
        fee = 1 * 10 ** 17;
    }

    /**
    * @dev 前端测试数据
    * @param _address 用户地址
    */
    function createTestUser(address _address) external {
        randomNumberConsumer.getRandomNumber(uint256(_address));
        bool test = 10 > randomNumberConsumer.getRandomResult();
        userTwitter memory testUser =
        userTwitter({
        requestId : 0,
        twitterId : "testUser",
        retweetId : "testTwitter",
        verified : test
        });
        userTwitterMap[_address] = testUser;
    }


    /**
     * @dev 验证用户
     * @param _twitterId 用户推特Id
     * @param _retweetId 推文ID
     **/
    function verifyUser(string memory _retweeted, string memory _twitterId, string memory _retweetId) public returns (bytes32) {
        require(
            link.balanceOf(address(this)) > fee,
            "Please recharge LINK in the contract"
        );
        userTwitterMap[msg.sender].verified = false;
        userTwitterMap[msg.sender].twitterId = _twitterId;
        userTwitterMap[msg.sender].retweetId = _retweetId;
        Chainlink.Request memory req =
        buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfill_verify.selector
        );
        req.add("retweeted", _retweeted);
        bytes32 Id = sendChainlinkRequestTo(oracle, req, fee);
        userTwitterMap[msg.sender].requestId = Id;
        return Id;
    }

    /**
    * @dev 完成验证
    * @param _requestId 请求ID
    * @param _address 用户地址
    */
    function fulfill_verify(bytes32 _requestId, uint256 _address)
    public
    recordChainlinkFulfillment(_requestId)
    {
        address user = address(_address);
        if (user == address(0)) {
            revert("Error occurred during verification!");
        }
        if (userTwitterMap[user].requestId == _requestId) {
            userTwitterMap[user].verified = true;
        }
    }

    /**
    * @dev 得到验证
    * @param _address 用户地址
    */
    function getVerification(address _address) external view returns (bool) {
        return userTwitterMap[_address].verified;
    }

    /**
    * @dev 获取推特
    * @param _address 用户地址
    */
    function getTwitter(address _address)
    external
    view
    returns (string memory, string memory)
    {
        return (userTwitterMap[_address].twitterId,
        userTwitterMap[_address].retweetId);
    }
}
