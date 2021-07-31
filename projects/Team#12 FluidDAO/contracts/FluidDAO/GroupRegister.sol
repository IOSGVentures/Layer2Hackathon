// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../Interface/IWarrant.sol";
import "../Interface/IIosgTwitter.sol";

abstract contract GroupRegister {

    struct GroupMessage {
        string memory description;
        address groupregister;
        address fundReceiver;
    }

    // byte32 groupname
    mapping (bytes32 => GroupMessage) internal groups;

    mapping (bytes32 => uint256) internal tokenIdOfPerGroup;

    IWarrant internal warrant;

    IIosgTwitter internal twitterVerify;
    constructor(address warrantAddress, address twitterVerifyAddress) {
        warrant = IWarrant(warrantAddress);
        twitterVerify = IIosgTwitter(twitterVerifyAddress);
    }

    /** ========== external mutative functions ========== */

    function addGroup(
        bytes32 groupname,
        string memory description,
        address fundReceiver
    ) external {
        _requireTwitterVerified(msg.sender);
        require(!requireGroupMessageFillout(groupname), "Sorry, the group has been registered");
        _groupMessageSetting(groupname, description, msg.sender, fundReceiver);
    }

    function updateGroupMessage(
        bytes32 groupname, 
        string memory newdescription, 
        address newfundReceiver
    ) external {

        require(groups[groupname].GroupRegister == msg.sender, "Sorry, you are not the register of calling group");
        _groupMessageSetting(groupname, newdescription, msg.sender, newfundReceiver);
    }


    /** ========== external view functions ========== */
    function getGroupMessage(bytes32 _groupname) public view returns (
        string memory _description,
        address _fundReceiver,
        address _groupregister
    ) {
        _description = groups[_groupname].description;
        _fundReceiver = groups[_groupname].fundReceiver;
        _groupregister = groups[_groupname].groupregister;
    }

    function getGroupFundReceiver(byte32 _groupname) public view returns (address fundReceiver) {
        fundReceiver = groups[_groupname].fundReceiver;
    }

    /** ========== internal mutative functions ========== */

    function _groupMessageSetting(
        bytes32 _groupname,
        string memory _description,
        address _fundReceiver,
        address _groupregister
    ) internal {

        groups[_groupname].description = _description;
        groups[_groupname].fundReceiver = _fundReceiver;
        groups[_groupname].GroupRegister = _groupregister;

        emit groupMessageUpdated(_groupname, _description,  _groupregister, _fundReceiver);
    }

    // todo add twitter retweet verification through chainlink
    function _singleGroupRegister(bytes32 _groupname, string memory _tokenIdPath) internal returns (uint256 tokenId) {
        require(!requireGroupMessageFillout(groupname), "you must fill out group messages at first");
        address register = groups[_groupname].groupregister;
        tokenId = warrant.newWarrant(register, _tokenIdPath);

        tokenIdOfPerGroup[_groupname] = tokenId;

        emit groupRegistered(register, tokenId);
    }

    /** ========== internal view functions ========== */
    function requireGroupMessageFillout(bytes32 groupname) internal view returns (bool blanked) {
        blanked = !groups[groupname].description? false: true;
    }

    function _getTokenIdOfPerGroup(bytes32 groupname) internal view returns (uint256 tokenId) {
        return tokenIdOfPerGroup[_groupname];
    }

    function _requireTwitterVerified(address account) internal view returns (bool) {
         require(twitterVerify.getVerification(account) == true, "Sorry, you must verify your account first");
    }

    /** ========== event ========== */
    event groupMessageUpdated(bytes32 indexed groupname, string description, address register, address fundReceiver);

    event groupRegistered(address indexed register, uint256 tokenId);
}