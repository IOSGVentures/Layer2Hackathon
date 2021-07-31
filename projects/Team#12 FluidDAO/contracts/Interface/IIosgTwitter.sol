interface IIosgTwitter {
    function getVerification(address _address) external view returns (bool);

    function getTwitter(address _address)
    external
    view
    returns (string memory, string memory);
}