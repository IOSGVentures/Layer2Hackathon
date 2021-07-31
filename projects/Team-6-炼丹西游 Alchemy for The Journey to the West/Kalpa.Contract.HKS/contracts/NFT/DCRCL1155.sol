// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@confluxfans/contracts/token/CRC1155/extensions/CRC1155Metadata.sol";
import "@confluxfans/contracts/token/CRC1155/extensions/ICRC1155Enumerable.sol";
import "../utils/MinterGuard.sol";
import "../utils/EzSponsor.sol"; 

contract DCRCL1155 is Context, ERC165Storage, IERC1155, IERC1155MetadataURI, MinterGuard, EzSponsor,CRC1155Metadata, ICRC1155Enumerable {
    using EnumerableSet for EnumerableSet.UintSet;
    using Strings for uint256;
    using Math for uint256;

    mapping(uint256 => mapping(address => uint256)) internal _balances;
    mapping(address => mapping(address => bool)) internal _approvals;
    mapping(address => EnumerableSet.UintSet) internal _userTokens;
    string _uri;

    uint256 private _counter = 0;

    /*
     *     bytes4(keccak256('balanceOf(address,uint256)')) == 0x00fdd58e
     *     bytes4(keccak256('balanceOfBatch(address[],uint256[])')) == 0x4e1273f4
     *     bytes4(keccak256('setApprovalForAll(address,bool)')) == 0xa22cb465
     *     bytes4(keccak256('isApprovedForAll(address,address)')) == 0xe985e9c5
     *     bytes4(keccak256('safeTransferFrom(address,address,uint256,uint256,bytes)')) == 0xf242432a
     *     bytes4(keccak256('safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)')) == 0x2eb2c2d6
     *
     *     => 0x00fdd58e ^ 0x4e1273f4 ^ 0xa22cb465 ^
     *        0xe985e9c5 ^ 0xf242432a ^ 0x2eb2c2d6 == 0xd9b67a26
     */
    bytes4 private constant _INTERFACE_ID_ERC1155 = 0xd9b67a26;

    /*
     *     bytes4(keccak256('uri(uint256)')) == 0x0e89341c
     */
    bytes4 private constant _INTERFACE_ID_ERC1155_METADATA_URI = 0x0e89341c;

    constructor(string memory uri_, ICentralAdminControl adminControl_) CRC1155Metadata("Fake TJTW 1155","fTJTW")  MinterGuard(adminControl_) {
        _setURI(uri_);
        _registerInterface(type(ICRC1155Enumerable).interfaceId);
        _registerInterface(_INTERFACE_ID_ERC1155);
        _registerInterface(_INTERFACE_ID_ERC1155_METADATA_URI);
    }

    /**
     * @dev See {IERC1155MetadataURI-uri}.
     *
     * This implementation returns the same URI for *all* token types. It relies
     * on the token type ID substitution mechanism
     * https://eips.ethereum.org/EIPS/eip-1155#metadata[defined in the EIP].
     *
     * Clients calling this function must replace the `\{id\}` substring with the
     * actual token type ID.
     */
    function uri(uint256 id) external view virtual override returns (string memory) {
        return string(abi.encodePacked(_uri, id.toString(), ".json"));
    }

    /**
     * @dev Returns the amount of tokens of token type `id` owned by `account`.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     */
    function balanceOf(address account, uint256 id) public view override returns (uint256 balance) {
        require(account != address(0), "ERC1155: balance query for the zero address");
        return _balances[id][account];
    }

    /**
     * @dev xref:ROOT:erc1155.adoc#batch-operations[Batched] version of {balanceOf}.
     *
     * Requirements:
     *
     * - `accounts` and `ids` must have the same length.
     */
    function balanceOfBatch(address[] calldata accounts, uint256[] calldata ids) public view override returns (uint256[] memory balances) {
        require(accounts.length == ids.length, "ERC1155: accounts and ids length mismatch");
        balances = new uint256[](accounts.length);
        for (uint256 idx = 0; idx < accounts.length; ++idx) balances[idx] = _balances[ids[idx]][accounts[idx]];
        return balances;
    }

    /**
     * @dev Grants or revokes permission to `operator` to transfer the caller's tokens, according to `approved`,
     *
     * Emits an {ApprovalForAll} event.
     *
     * Requirements:
     *
     * - `operator` cannot be the caller.
     */
    function setApprovalForAll(address operator, bool approved) public override {
        require(_msgSender() != operator, "ERC1155: setting approval status for self");
        _approvals[_msgSender()][operator] = approved;
        emit ApprovalForAll(_msgSender(), operator, approved);
    }

    /**
     * @dev Returns true if `operator` is approved to transfer ``account``'s tokens.
     *
     * See {setApprovalForAll}.
     */
    function isApprovedForAll(address account, address operator) public view override returns (bool) {
        return _approvals[account][operator];
    }

    /**
     * @dev Transfers `amount` tokens of token type `id` from `from` to `to`.
     *
     * Emits a {TransferSingle} event.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - If the caller is not `from`, it must be have been approved to spend ``from``'s tokens via {setApprovalForAll}.
     * - `from` must have a balance of tokens of type `id` of at least `amount`.
     * - If `to` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155Received} and return the
     * acceptance magic value.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes calldata data
    ) public override {
        require(to != address(0), "ERC1155: transfer to the zero address");
        address operator = _msgSender();
        require(from == operator || isApprovedForAll(from, operator), "ERC1155: caller is not owner nor approved");
        require(_balances[id][from] >= amount, "ERC1155: insufficient balance for transfer");
        _removeHolds(from, id);
        _balances[id][from] -= amount;
        _addHolds(to, id);
        _balances[id][to] += amount;
        emit TransferSingle(operator, from, to, id, amount);
        _doSafeTransferAcceptanceCheck(operator, from, to, id, amount, data);
    }

    /**
     * @dev xref:ROOT:erc1155.adoc#batch-operations[Batched] version of {safeTransferFrom}.
     *
     * Emits a {TransferBatch} event.
     *
     * Requirements:
     *
     * - `ids` and `amounts` must have the same length.
     * - If `to` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155BatchReceived} and return the
     * acceptance magic value.
     */
    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] calldata ids,
        uint256[] calldata amounts,
        bytes calldata data
    ) public override {
        require(ids.length == amounts.length, "ERC1155: ids and amounts length mismatch");
        require(to != address(0), "ERC1155: transfer to the zero address");
        address operator = _msgSender();
        require(from == operator || isApprovedForAll(from, operator), "ERC1155: caller is not owner nor approved");

        for (uint256 idx = 0; idx < ids.length; ++idx) {
            uint256 id = ids[idx];
            uint256 amount = amounts[idx];
            uint256 balance = _balances[id][from];
            require(balance >= amount, "ERC1155: insufficient balance for transfer");
            _removeHolds(from, id);
            _balances[id][from] = balance - amount;
            _addHolds(to, id);
            _balances[id][to] += amount;
        }
        emit TransferBatch(operator, from, to, ids, amounts);

        _doSafeBatchTransferAcceptanceCheck(operator, from, to, ids, amounts, data);
    }

    function tokensOf(address account) public view returns (uint256[] memory ids, uint256[] memory balances) {
        EnumerableSet.UintSet storage tokens = _userTokens[account];
        ids = new uint256[](tokens.length());
        balances = new uint256[](tokens.length());
        for (uint256 idx = 0; idx < ids.length; ++idx) {
            ids[idx] = tokens.at(idx);
            balances[idx] = _balances[ids[idx]][account];
        }
    }

    /**
     * @dev Returns token IDs of specified `owner` in pagination view.
     */
    function tokensOf(
        address owner,
        uint256 offset,
        uint256 limit
    ) public view virtual returns (uint256 total, uint256[] memory tokenIds) {
        total = tokenCountOf(owner);
        if (total == 0 || offset >= total) {
            return (total, new uint256[](0));
        }

        uint256 endExclusive = total.min(offset + limit);
        tokenIds = new uint256[](endExclusive - offset);

        for (uint256 i = offset; i < endExclusive; i++) {
            tokenIds[i - offset] = tokenOfOwnerByIndex(owner, i);
        }
    }

    /**
     * @dev Returns the number of different tokenIds stored by the contract.
     */
    function totalSupply() external view override returns (uint256) {
        return _counter;
    }

    /**
     * @dev Returns the `index`-th tokenId stored by the contract.
     */
    function tokenByIndex(uint256 index) external view override returns (uint256) {
        require(index < _counter, "DCRCL1155: index not valid");
        return index;
    }

    /**
     * @dev Returns the total amount of tokens for the specified `tokenId`.
     */
    function totalSupply(uint256) external pure override returns (uint256) {
        return 1;
    }

    /**
     * @dev Indicates whether the specified `tokenId` exists or not.
     */
    function exists(uint256 tokenId) external view override returns (bool) {
        return tokenId < _counter;
    }

    /**
     * @dev Returns the number of token ids held by `owner`.
     */
    function tokenCountOf(address owner) public view override returns (uint256) {
        return _userTokens[owner].length();
    }

    /**
     * @dev Returns the `index`-th tokenId held by `owner`.
     */
    function tokenOfOwnerByIndex(address owner, uint256 index) public view override returns (uint256) {
        return _userTokens[owner].at(index);
    }

    function setURI(string calldata newuri) external onlyAdmin {
        _setURI(newuri);
    }

    /**
     * @dev Sets a new URI for all token types, by relying on the token type ID
     * substitution mechanism
     * https://eips.ethereum.org/EIPS/eip-1155#metadata[defined in the EIP].
     *
     * By this mechanism, any occurrence of the `\{id\}` substring in either the
     * URI or any of the amounts in the JSON file at said URI will be replaced by
     * clients with the token type ID.
     *
     * For example, the `https://token-cdn-domain/\{id\}.json` URI would be
     * interpreted by clients as
     * `https://token-cdn-domain/000000000000000000000000000000000000000000000000000000000004cce0.json`
     * for token type ID 0x4cce0.
     *
     * See {uri}.
     *
     * Because these URIs cannot be meaningfully represented by the {URI} event,
     * this function emits no events.
     */
    function _setURI(string memory newuri) internal virtual {
        _uri = newuri;
    }

    function mint(address account, bytes calldata data) external minterOnly returns (uint256 id) {
        id = _counter;
        _mint(account, _counter++, 1, data);
    }

    /**
     * @dev Creates `amount` tokens of token type `id`, and assigns them to `account`.
     *
     * Emits a {TransferSingle} event.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     * - If `account` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155Received} and return the
     * acceptance magic value.
     */
    function _mint(
        address account,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) internal virtual {
        require(account != address(0), "ERC1155: mint to the zero address");

        address operator = _msgSender();

        _addHolds(account, id);
        _balances[id][account] += amount;
        emit TransferSingle(operator, address(0), account, id, amount);

        _doSafeTransferAcceptanceCheck(operator, address(0), account, id, amount, data);
    }

    function mintBatch(
        address to,
        uint256[] calldata amounts,
        bytes calldata data
    ) external virtual minterOnly returns (uint256 id) {
        id = _counter;
        uint256[] memory ids = new uint256[](amounts.length);
        for (uint256 index = 0; index < amounts.length; ++index) ids[index] = id++;
        _mintBatch(to, ids, amounts, data);
        _counter = id;
        id -= amounts.length;
    }

    /**
     * @dev xref:ROOT:erc1155.adoc#batch-operations[Batched] version of {_mint}.
     *
     * Requirements:
     *
     * - `ids` and `amounts` must have the same length.
     * - If `to` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155BatchReceived} and return the
     * acceptance magic value.
     */
    function _mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual {
        require(to != address(0), "ERC1155: mint to the zero address");
        require(ids.length == amounts.length, "ERC1155: ids and amounts length mismatch");

        address operator = _msgSender();
        for (uint256 idx = 0; idx < ids.length; ++idx) {
            _addHolds(to, ids[idx]);
            _balances[ids[idx]][to] += amounts[idx];
        }
        emit TransferBatch(operator, address(0), to, ids, amounts);
        _doSafeBatchTransferAcceptanceCheck(operator, address(0), to, ids, amounts, data);
    }

    function _doSafeTransferAcceptanceCheck(
        address operator,
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) private {
        if (isContract(to)) {
            try IERC1155Receiver(to).onERC1155Received(operator, from, id, amount, data) returns (bytes4 response) {
                if (response != IERC1155Receiver(to).onERC1155Received.selector) {
                    revert("ERC1155: ERC1155Receiver rejected tokens");
                }
            } catch Error(string memory reason) {
                revert(reason);
            } catch {
                revert("ERC1155: transfer to non ERC1155Receiver implementer");
            }
        }
    }

    function _doSafeBatchTransferAcceptanceCheck(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) private {
        if (isContract(to)) {
            try IERC1155Receiver(to).onERC1155BatchReceived(operator, from, ids, amounts, data) returns (bytes4 response) {
                if (response != IERC1155Receiver(to).onERC1155BatchReceived.selector) {
                    revert("ERC1155: ERC1155Receiver rejected tokens");
                }
            } catch Error(string memory reason) {
                revert(reason);
            } catch {
                revert("ERC1155: transfer to non ERC1155Receiver implementer");
            }
        }
    }

    function _addHolds(address account, uint256 id) internal {
        _userTokens[account].add(id);
    }

    function _removeHolds(address account, uint256 id) internal {
        _userTokens[account].remove(id);
    }

    /**
     * @dev determine call is a contract or not
     */
    function isContract(address addr) public pure returns (bool) {
        return (uint160(addr) >> 159) > 0;
    }
}
