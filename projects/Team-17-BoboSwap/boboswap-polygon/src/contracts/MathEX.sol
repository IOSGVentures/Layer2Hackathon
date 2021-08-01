// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

library MathEX {
  function sqrt(uint256 x) public pure returns(uint256) {
    uint z = (x + 1 ) / 2;
    uint y = x;
    while(z < y){
      y = z;
      z = ( x / z + z ) / 2;
    }
    return y;
  }
}


