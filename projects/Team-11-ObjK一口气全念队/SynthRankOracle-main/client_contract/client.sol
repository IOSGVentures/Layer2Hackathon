pragma solidity 0.4.24;

import "https://github.com/smartcontractkit/chainlink/contracts/src/v0.4/ChainlinkClient.sol";
import "https://github.com/smartcontractkit/chainlink/contracts/src/v0.4/vendor/Ownable.sol";

contract ATestnetConsumer is ChainlinkClient, Ownable {
  uint256 constant private ORACLE_PAYMENT = LINK / 100;

  bytes32 public rank0;
  bytes32 public rank1;
  bytes32 public rank2;
  bytes32 public rank3;
  bytes32 public rank4;
  
  string public jobId0;
  string public jobId1;
  string public jobId2;
  string public jobId3;
  string public jobId4;

  event RequestEthereumPriceFulfilled(
    bytes32 indexed requestId,
    uint256 indexed price
  );

  event RequestEthereumChangeFulfilled(
    bytes32 indexed requestId,
    int256 indexed change
  );

  event RequestEthereumLastMarket(
    bytes32 indexed requestId,
    bytes32 indexed market
  );

  constructor() public Ownable() {
    setPublicChainlinkToken();
  }
  
  function setJobId(uint256 _rank, string _jobId)
    public
    onlyOwner
  {
      if(_rank == 0)
      {
          jobId0 = _jobId;
      }else if(_rank == 1)
      {
          jobId1 = _jobId;
      }else if(_rank == 2)
      {
          jobId2 = _jobId;
      }else if(_rank == 3)
      {
          jobId3 = _jobId;
      }else if(_rank == 4)
      {
          jobId4 = _jobId;
      }
  }
  
  function request(address _oracle)
    public
  {
    requestEthereumByte32_0(_oracle, jobId0);
    requestEthereumByte32_1(_oracle, jobId1);
    requestEthereumByte32_2(_oracle, jobId2);
    requestEthereumByte32_3(_oracle, jobId3);
    requestEthereumByte32_4(_oracle, jobId4);
  }

  function requestEthereumByte32_0(address _oracle, string _jobId)
    public
    onlyOwner
  {
    Chainlink.Request memory req = buildChainlinkRequest(stringToBytes32(_jobId), this, this.fulfillEthereumByte32_0.selector);
    sendChainlinkRequestTo(_oracle, req, ORACLE_PAYMENT);
  }

  function requestEthereumByte32_1(address _oracle, string _jobId)
    public
    onlyOwner
  {
    Chainlink.Request memory req = buildChainlinkRequest(stringToBytes32(_jobId), this, this.fulfillEthereumByte32_1.selector);
    sendChainlinkRequestTo(_oracle, req, ORACLE_PAYMENT);
  }
  
  function requestEthereumByte32_2(address _oracle, string _jobId)
    public
    onlyOwner
  {
    Chainlink.Request memory req = buildChainlinkRequest(stringToBytes32(_jobId), this, this.fulfillEthereumByte32_2.selector);
    sendChainlinkRequestTo(_oracle, req, ORACLE_PAYMENT);
  }
  
  function requestEthereumByte32_3(address _oracle, string _jobId)
    public
    onlyOwner
  {
    Chainlink.Request memory req = buildChainlinkRequest(stringToBytes32(_jobId), this, this.fulfillEthereumByte32_3.selector);
    sendChainlinkRequestTo(_oracle, req, ORACLE_PAYMENT);
  }
  
  function requestEthereumByte32_4(address _oracle, string _jobId)
    public
    onlyOwner
  {
    Chainlink.Request memory req = buildChainlinkRequest(stringToBytes32(_jobId), this, this.fulfillEthereumByte32_4.selector);
    sendChainlinkRequestTo(_oracle, req, ORACLE_PAYMENT);
  }
  
  function fulfillEthereumByte32_0(bytes32 _requestId, bytes32 _data)
    public
    recordChainlinkFulfillment(_requestId)
  {
    emit RequestEthereumLastMarket(_requestId, _data);
    rank0 = _data;
  }

  function fulfillEthereumByte32_1(bytes32 _requestId, bytes32 _data)
    public
    recordChainlinkFulfillment(_requestId)
  {
    emit RequestEthereumLastMarket(_requestId, _data);
    rank1 = _data;
  }
  
  function fulfillEthereumByte32_2(bytes32 _requestId, bytes32 _data)
    public
    recordChainlinkFulfillment(_requestId)
  {
    emit RequestEthereumLastMarket(_requestId, _data);
    rank2 = _data;
  }
  
  function fulfillEthereumByte32_3(bytes32 _requestId, bytes32 _data)
    public
    recordChainlinkFulfillment(_requestId)
  {
    emit RequestEthereumLastMarket(_requestId, _data);
    rank3 = _data;
  }
  
  function fulfillEthereumByte32_4(bytes32 _requestId, bytes32 _data)
    public
    recordChainlinkFulfillment(_requestId)
  {
    emit RequestEthereumLastMarket(_requestId, _data);
    rank4 = _data;
  }

  function getChainlinkToken() public view returns (address) {
    return chainlinkTokenAddress();
  }

  function withdrawLink() public onlyOwner {
    LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
    require(link.transfer(msg.sender, link.balanceOf(address(this))), "Unable to transfer");
  }

  function cancelRequest(
    bytes32 _requestId,
    uint256 _payment,
    bytes4 _callbackFunctionId,
    uint256 _expiration
  )
    public
    onlyOwner
  {
    cancelChainlinkRequest(_requestId, _payment, _callbackFunctionId, _expiration);
  }

  function stringToBytes32(string memory source) private pure returns (bytes32 result) {
    bytes memory tempEmptyStringTest = bytes(source);
    if (tempEmptyStringTest.length == 0) {
      return 0x0;
    }

    assembly { // solhint-disable-line no-inline-assembly
      result := mload(add(source, 32))
    }
  }

}