//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {RedirectAll, ISuperToken, IConstantFlowAgreementV1, ISuperfluid} from "./RedirectAll.sol";

contract Warrant is ERC721URIStorage, Ownable, RedirectAll {
    using Counters for Counters.Counter;

    Counters.Counter private _newtokenId;
    string memory private baseURI_;
    mapping (address => mapping(string => bool)) private warrantToIPFSPath;

    constructor (
        string memory _name, 
        string memory _symbol,
        ISuperfluid host,
        IConstantFlowAgreementV1 cfa,
        ISuperToken acceptedToken
        ) ERC721(_name, _symbol)
        RedirectAll (
            host,
            cfa,
            acceptedToken,
            owner
        ) {}

    /** ========== public view functions ========== */
    function totalWarrant() public view returns (uint256) {
        return _newTokenId.current();
    }

    /** ========== external mutative functions ========== */
    function newWarrant(address WarrantReceiver, string memory _tokenIdPath) external returns (uint256 _newTokenId) {
        uint newtokenId = _tokenId.increment();
        warrantToIPFSPath[_msgSender()][_tokenIdPath] = true;

        _mint(_msgSender(), newtokenId);
        _setTokenIPFSPath(newtokenId, _tokenIdPath);
    }

    function burnWarrant(uint256 tokenId) external {
        burn(tokenId);
        _deleteTokenIdIPFS(tokenId);
    }

    function resetBaseURI(string memory newBaseURI) external onlyOwner {
        baseURI_ = newBaseURI;
    }

    /** ========== internal mutative functions ========== */
    // The IPFS path should be the CID + file.extension, e.g: [IPFSPath]/metadata.json
    // Therefore the length of '_path' may be longer than 46.
    function _setTokenIPFSPath(uint256 tokenId, string memory _path) internal {
        require(bytes(_path).length >= 46, "Invalid IPFS path");
        require(getCreatorUniqueIPFSHashAddress(_path), "NFT has been minted");

        address creator = _msgSender();

        _setTokenURI(tokenId, _path);

        emit IPFSPathset(creator, _path);
    }

    function _deleteTokenIdIPFS(uint256 tokenId) internal {
        delete warrantToIPFSPath[_msgSender()][tokenId];
    }

      //now I will insert a nice little hook in the _transfer, including the RedirectAll function I need
    function _beforeTokenTransfer(
        address /*from*/,
        address to,
        uint256 /*tokenId*/
    ) internal override {
        _changeReceiver(to);
    }


    /** ========== internal view functions ========== */
    function _baseURI() internal view override returns (string memory) {
        return baseURI_;
    }

    /** ========== modifier ========== */

    /** ========== event ========== */
    event IPFSPathset(address indexed creator, string _path);
}