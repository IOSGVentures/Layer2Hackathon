const ethers = require('ethers')
const utils = ethers.utils
const BigNumber = ethers.BigNumber
const config = require('../../conf/config.js')

//matic
var bank1155Address = '0xc44dc52e259352B6C26AfFcEf9ce280836AD6860'
var nftAddress = '0xa96e19Fd3342a52eff889EF729a81ba1Ed8a60E0'
var DOMAIN_SEPARATOR_1155 = '0xa88c15decb7b31a157043f3cd4b8d44025fab8127a1ace79a4e42f4b4705550c'
var CLAIM_TYPEHASH_1155 = '0xb6a24ef5c5f68d9d0b21ed8a8f65af560e5c67ed6271d8c36130e21b56be877e'
var PASSWORD_TYPEHASH_1155 = '0x892bed353848c2d77daa7dec64601cc101e9d4dabd543a881719f8f210924128'

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