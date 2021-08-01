// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@chainlink/contracts/src/v0.6/ChainlinkClient.sol";


interface IMcdexTrade {
    function trade() external;
}
contract TheGraphData is ChainlinkClient {
    // address private oracle;
    bytes32 private jobId;
    uint256 private fee;

    bytes32 public data;

    constructor() public {
        setPublicChainlinkToken();
        // 	oracle = 0xf6980958cc650Be283EbF3d1386b2870c87C30dC; // oracle address
        // 	jobId = "58f57eb0265b40c7b01f28f137e857e2"; //job id
        fee = 0.1 * 10**18; // 0.1 LINK
    }

    /**
     * Make TheGraph request
     */
    function requesTheGraphData(address _oracle, string memory _jobId) public {
        Chainlink.Request memory req = buildChainlinkRequest(
            stringToBytes32(_jobId),
            address(this),
            this.fulfillEthereumData.selector
        );
        req.add("project", "TR_ETH_Aave");
        req.add("index", "FinMerics");
        req.add("copyPath", "result");
        sendChainlinkRequestTo(_oracle, req, fee);
    }

    /**
     * Callback function
     *
     */
    function fulfillEthereumData(bytes32 _requestId, bytes32 _data)
        public
        recordChainlinkFulfillment(_requestId)
    {
        data = _data;

        /**
         *  Call  mcdex trade contract
         *  0  1  2  
         *  1 tradeBuy  2 tradeSell
         */
        if(_data  === stringToBytes32("1")){
            IMcdexTrade(address(0xcdd440d33D8A1Cb2c53846A6b77586F87e9b4812)).tradeBuy();
        }
        if(_data  === stringToBytes32("2")){
            IMcdexTrade(address(0xcdd440d33D8A1Cb2c53846A6b77586F87e9b4812)).tradeSell();
        }
    }

    /**
     * stringToBytes32
     *
     */
    function stringToBytes32(string memory source)
        private
        pure
        returns (bytes32 result)
    {
        bytes memory tempEmptyString = bytes(source);
        if (tempEmptyString.length == 0) {
            return 0x0;
        }

        assembly {
            // solhint-disable-line no-inline-assembly
            result := mload(add(source, 32))
        }
    }
}
