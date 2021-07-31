// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./FluidVote.sol";

contract FluidDAO is FluidVote {
    
    constructor(
        address _initiator, 
        address voteToken_,
        address warrantAddress,
        address host,
        address cfa,
        address acceptedToken
    ) 
    FluidVote(
        _initiator, 
        warrantAddress, 
        voteToken_,
        host, 
        cfa, 
        acceptedToken)
    {}


}