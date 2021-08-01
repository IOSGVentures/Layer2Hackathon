// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';


contract Bank20 {

    bytes32 public DOMAIN_SEPARATOR;
    bytes32 public CLAIM_TYPEHASH;
    bytes32 public PASSWORD_TYPEHASH;
    mapping(bytes32 => bool) public nonces;
    mapping(address => mapping(address => uint)) public tokenUserBalance;

    event  Deposit(address indexed token, address indexed to, uint value);
    event  Withdraw(address indexed token, address indexed to, uint value);
    event  Claim(address indexed token, address indexed from, address indexed to, uint value);
    event  Password(address indexed token, address indexed from, address indexed to, uint value);


    constructor() public {
        uint chainId;
        assembly {
            chainId := chainid()
        }
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'),
                keccak256(bytes('Bank20')),
                keccak256(bytes('1')),
                chainId,
                address(this)
            )
        );

        CLAIM_TYPEHASH = keccak256('Claim(address token,address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)');
        PASSWORD_TYPEHASH = keccak256('Password(address token,address owner,string psw,uint256 value,uint256 nonce,uint256 deadline)');
    }

    function deposit(address token, address owner, uint value) public {
        IERC20(token).transferFrom(msg.sender, address(this), value);
        tokenUserBalance[token][owner] = tokenUserBalance[token][owner] + value;

        emit Deposit(token, owner, value);
    }

    function withdraw(address token, address spender, uint value) public {
        require(tokenUserBalance[token][msg.sender] >= value, 'Bank20::withdraw: oh no');
        tokenUserBalance[token][msg.sender] = tokenUserBalance[token][msg.sender] - value;
        IERC20(token).transfer(spender, value);

        emit Withdraw(token, spender, value);
    }

    function claim(address token, address owner, address spender, uint value, uint deadline, uint8 v, bytes32 r, bytes32 s) external {
        require(deadline >= block.timestamp, 'Bank20::claim: expired deadline');
        bytes32 digest = keccak256(
            abi.encodePacked(
                '\x19\x01',
                DOMAIN_SEPARATOR,
                keccak256(abi.encode(CLAIM_TYPEHASH, token, owner, spender, value, deadline))
            )
        );
        require(!nonces[digest], 'Bank20::claim: expired digest');
        address recoveredAddress = ecrecover(digest, v, r, s);
        require(recoveredAddress != address(0) && recoveredAddress == owner, 'Bank20::claim: invalid signature');

        require(tokenUserBalance[token][owner] >= value, 'Bank20::claim: oh no');
        tokenUserBalance[token][owner] = tokenUserBalance[token][owner] - value;
        IERC20(token).transfer(spender, value);
        nonces[digest] = true;

        emit Claim(token, owner, spender, value);
    }

    function password(address token, address owner, string memory psw, uint value, uint deadline, uint8 v, bytes32 r, bytes32 s) external {
        require(deadline >= block.timestamp, 'Bank20::password: expired deadline');
        bytes32 digest = keccak256(
            abi.encodePacked(
                '\x19\x01',
                DOMAIN_SEPARATOR,
                keccak256(abi.encode(PASSWORD_TYPEHASH, token, owner, psw, value, deadline))
            )
        );
        require(!nonces[digest], 'Bank20::password: expired digest');
        address recoveredAddress = ecrecover(digest, v, r, s);
        require(recoveredAddress != address(0) && recoveredAddress == owner, 'Bank20::password: invalid signature');

        require(tokenUserBalance[token][owner] >= value, 'Bank20::password: oh no');
        tokenUserBalance[token][owner] = tokenUserBalance[token][owner] - value;
        IERC20(token).transfer(msg.sender, value);
        nonces[digest] = true;

        emit Password(token, owner, msg.sender, value);
    }
}