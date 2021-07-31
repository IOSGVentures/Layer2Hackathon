const ImageNft = artifacts.require('ImageNft');

module.exports = function(deployer) {
  deployer.deploy(ImageNft);
};
