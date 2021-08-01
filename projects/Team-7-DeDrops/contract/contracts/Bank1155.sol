// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import '@openzeppelin/contracts/token/ERC1155/IERC1155.sol';
import '@openzeppelin/contracts/token/ERC1155/ERC1155Receiver.sol';


contract Bank1155 is ERC1155Receiver {

    bytes32 public DOMAIN_SEPARATOR;
    bytes32 public CLAIM_TYPEHASH;
    bytes32 public PASSWORD_TYPEHASH;
    mapping(bytes32 => bool) public nonces;
    mapping(address => mapping(uint => mapping(address => uint))) public tokenUserBalance;

    event  Deposit(address indexed token, uint indexed id, address indexed to, uint value);
    event  Withdraw(address indexed token, uint indexed id, address indexed to, uint value);
    event  Claim(address indexed token, uint indexed id, address indexed from, address to);
    event  Password(address indexed token, uint indexed id, address indexed from, address to);


    constructor() public {
        uint chainId;
        assembly {
            chainId := chainid()
        }
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'),
                keccak256(bytes('Bank1155')),
                keccak256(bytes('1')),
                chainId,
                address(this)
            )
        );

        CLAIM_TYPEHASH = keccak256('Claim(address token,uint256 id,address owner,address spender,uint256 nonce,uint256 deadline)');
        PASSWORD_TYPEHASH = keccak256('Password(address token,address owner,string psw,uint256 nonce,uint256 deadline)');
    }


    function deposit(address token, uint id, address owner, uint value) public {
        IERC1155(token).safeTransferFrom(msg.sender, address(this), id, value, '');
        tokenUserBalance[token][id][owner] = tokenUserBalance[token][id][owner] + value;

        emit Deposit(token, id, owner, value);
    }


    function withdraw(address token, uint id, address spender, uint value) public {
        require(tokenUserBalance[token][id][msg.sender] >= value, 'Bank1155::withdraw: oh no');
        tokenUserBalance[token][id][msg.sender] = tokenUserBalance[token][id][msg.sender] - value;
        IERC1155(token).safeTransferFrom(address(this), spender, id, value, '');

        emit Withdraw(token, id, spender, value);
    }


    /**
        @dev Handles the receipt of a single ERC1155 token type. This function is
        called at the end of a `safeTransferFrom` after the balance has been updated.
        To accept the transfer, this must return
        `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))`
        (i.e. 0xf23a6e61, or its own function selector).
        @param operator The address which initiated the transfer (i.e. msg.sender)
        @param from The address which previously owned the token
        @param id The ID of the token being transferred
        @param value The amount of tokens being transferred
        @param data Additional data with no specified format
        @return `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))` if transfer is allowed
    */
    function onERC1155Received(address operator, address from, uint256 id, uint256 value, bytes calldata data) external override returns(bytes4) {
        address owner = (data.length == 0) ? from : bytesToAddress(data);
        tokenUserBalance[msg.sender][id][owner] = tokenUserBalance[msg.sender][id][owner] + value;
        emit Deposit(msg.sender, id, owner, value);
        
        return this.onERC1155Received.selector;
    }


    /**
        @dev Handles the receipt of a multiple ERC1155 token types. This function
        is called at the end of a `safeBatchTransferFrom` after the balances have
        been updated. To accept the transfer(s), this must return
        `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))`
        (i.e. 0xbc197c81, or its own function selector).
        @param operator The address which initiated the batch transfer (i.e. msg.sender)
        @param from The address which previously owned the token
        @param ids An array containing ids of each token being transferred (order and length must match values array)
        @param values An array containing amounts of each token being transferred (order and length must match ids array)
        @param data Additional data with no specified format
        @return `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))` if transfer is allowed
    */
    function onERC1155BatchReceived(address operator, address from, uint256[] calldata ids, uint256[] calldata values, bytes calldata data) external override returns(bytes4) {
        address owner = (data.length == 0) ? from : bytesToAddress(data);
        for (uint i = 0; i < ids.length; i++) {
            uint id = ids[i];
            uint value = values[i];
            tokenUserBalance[msg.sender][id][owner] = tokenUserBalance[msg.sender][id][owner] + value;
            emit Deposit(msg.sender, id, owner, value);
        }
        return this.onERC1155BatchReceived.selector;
    }


    function claim(address token, uint id, address owner, address spender, uint deadline, uint8 v, bytes32 r, bytes32 s) external {
        require(deadline >= block.timestamp, 'Bank1155::claim: expired deadline');
        bytes32 digest = keccak256(
            abi.encodePacked(
                '\x19\x01',
                DOMAIN_SEPARATOR,
                keccak256(abi.encode(CLAIM_TYPEHASH, token, id, owner, spender, deadline))
            )
        );
        require(!nonces[digest], 'Bank1155::claim: expired digest');
        address recoveredAddress = ecrecover(digest, v, r, s);
        require(recoveredAddress != address(0) && recoveredAddress == owner, 'Bank1155::claim: invalid signature');

        require(tokenUserBalance[token][id][owner] >= 1, 'Bank1155::claim: oh no');
        tokenUserBalance[token][id][owner] = tokenUserBalance[token][id][owner] - 1;
        IERC1155(token).safeTransferFrom(address(this), spender, id, 1, '');

        emit Claim(token, id, owner, spender);
    }


    function password(address token, uint id, address owner, string memory psw, uint deadline, uint8 v, bytes32 r, bytes32 s) external {
        require(deadline >= block.timestamp, 'Bank1155::password: expired deadline');
        bytes32 digest = keccak256(
            abi.encodePacked(
                '\x19\x01',
                DOMAIN_SEPARATOR,
                keccak256(abi.encode(PASSWORD_TYPEHASH, token, id, owner, psw, deadline))
            )
        );
        require(!nonces[digest], 'Bank1155::password: expired digest');
        address recoveredAddress = ecrecover(digest, v, r, s);
        require(recoveredAddress != address(0) && recoveredAddress == owner, 'Bank1155::password: invalid signature');

        require(tokenUserBalance[token][id][owner] >= 1, 'Bank1155::claim: oh no');
        tokenUserBalance[token][id][owner] = tokenUserBalance[token][id][owner] - 1;
        IERC1155(token).safeTransferFrom(address(this), msg.sender, id, 1, '');

        emit Password(token, id, owner, msg.sender);
    }

    
    function bytesToAddress(bytes memory bys) internal pure returns (address addr) {
        assembly {
            addr := mload(add(bys,20))
        }
    }
}