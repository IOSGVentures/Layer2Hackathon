const ethers = require('ethers')
const utils = ethers.utils
const BigNumber = ethers.BigNumber
const config = require('../../conf/config.js')

//matic
var bank1155Address = '0x9e5f0d1028007DEB7432AF0cF3787B804207A68b'
var nftAddress = '0x72C62fA08b0209e49048C00c896100684e19e887'
var DOMAIN_SEPARATOR_1155 = '0xe63847ae1a10cb5676eb4d63bf3205a1a80c2a6f51889434c197583343aaefb0'
var CLAIM_TYPEHASH_1155 = '0x242444289e23ce6db820d71eb5a872b74ab417877a6bc4b88ff9c0c982f42aa8'
var PASSWORD_TYPEHASH_1155 = '0xe1a52c71772aeec2cad9cac0dbd56513ea655223347c5201ca618b6d314300ec'

var bank20Address = '0x13d6f4529c2a003f14cde0a356cee66637cd739a'
var DOMAIN_SEPARATOR_20 = '0x3b4ce86ee8d7aab11e1f2deedfa185c8268cc4b1061ee70f69e020328fff4ac1'
var CLAIM_TYPEHASH_20 = '0xa05335bcb0b0413b06aebf7578cda47f15e56bda72a634ee823fc1ef42ec1994'
var PASSWORD_TYPEHASH_20 = '0x3dce4743a9c307489689d5a78849d8466d3d3fa3806e2e97961cead248e9a34b'


/*================================= ERC1155签名数据 ================================*/
function signERC1155Claim(obj) {
    let id = b(obj.id)
    let spender = obj.spender
    let deadline = b(obj.deadline)
    let owner = config.eth_account
    
    let digest = utils.keccak256(
        utils.solidityPack(
            ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
            [
                '0x19',
                '0x01',
                DOMAIN_SEPARATOR_1155,
                utils.keccak256(
                    utils.defaultAbiCoder.encode(
                        ['bytes32', 'address', 'uint256', 'address', 'address', 'uint256'],
                        [CLAIM_TYPEHASH_1155, nftAddress, id, owner, spender, deadline]
                    )
                )
            ]
        )
    )

    let privateKey = '0x' + config.eth_privateKey
    let signingKey = new ethers.utils.SigningKey(privateKey)
    let sign = signingKey.signDigest(digest)
    let vrs = utils.splitSignature(sign)
    vrs.digest = digest
    console.log(vrs)

    return vrs
}


/*================================= ERC20签名数据 ================================*/
function signERC20Claim(obj) {
    let token = obj.token
	let spender = obj.spender
	let value = b(obj.value)
	let deadline = b(obj.deadline)
    let owner = config.eth_account

	let digest = utils.keccak256(
		utils.solidityPack(
			['bytes1', 'bytes1', 'bytes32', 'bytes32'],
			[
				'0x19',
				'0x01',
				DOMAIN_SEPARATOR_20,
				utils.keccak256(
					utils.defaultAbiCoder.encode(
						['bytes32', 'address', 'address', 'address', 'uint256', 'uint256'],
						[CLAIM_TYPEHASH_20, token, owner, spender, value, deadline]
					)
				)
			]
		)
	)

	let privateKey = '0x' + config.eth_privateKey
	let signingKey = new ethers.utils.SigningKey(privateKey)
	let sign = signingKey.signDigest(digest)
	let vrs = utils.splitSignature(sign)
    vrs.digest = digest
    console.log(vrs)

    return vrs
}


function b(num) {
	return BigNumber.from(num)
}

function n(bn) {
	return bn.toNumber()
}

function s(bn) {
	return bn.toString()
}


module.exports = {
    signERC1155Claim: signERC1155Claim,
    signERC20Claim: signERC20Claim
}