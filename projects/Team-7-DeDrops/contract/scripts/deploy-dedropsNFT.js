const hre = require('hardhat')
const fs = require('fs')
const { BigNumber, utils } = require('ethers')


//matic
var bankAddress = '0xc44dc52e259352B6C26AfFcEf9ce280836AD6860'
var DOMAIN_SEPARATOR = '0xa88c15decb7b31a157043f3cd4b8d44025fab8127a1ace79a4e42f4b4705550c'
var CLAIM_TYPEHASH = '0xb6a24ef5c5f68d9d0b21ed8a8f65af560e5c67ed6271d8c36130e21b56be877e'
var PASSWORD_TYPEHASH = '0x892bed353848c2d77daa7dec64601cc101e9d4dabd543a881719f8f210924128'
var dedropsAddress = '0xa96e19Fd3342a52eff889EF729a81ba1Ed8a60E0'


async function main() {
	const accounts = await hre.ethers.getSigners()

	// const Bank1155 = await ethers.getContractFactory('Bank1155')
	// let bank = await Bank1155.deploy()
	// await bank.deployed()
	// DOMAIN_SEPARATOR = await bank.DOMAIN_SEPARATOR()
	// CLAIM_TYPEHASH = await bank.CLAIM_TYPEHASH()
	// PASSWORD_TYPEHASH = await bank.PASSWORD_TYPEHASH()
	// console.log('Bank1155 deployed to:', bank.address, 'DOMAIN_SEPARATOR:', DOMAIN_SEPARATOR, 'CLAIM_TYPEHASH:', CLAIM_TYPEHASH, 'PASSWORD_TYPEHASH:', PASSWORD_TYPEHASH)
	
	const DeDropsNFT = await ethers.getContractFactory('DeDropsNFT')
	let dedrops = await DeDropsNFT.deploy(bankAddress)
	await dedrops.deployed()
	console.log('DeDropsNFT deployed to:', dedrops.address)
}


async function mint() {
	const accounts = await hre.ethers.getSigners()

	const dedropsAbi = getAbi('./artifacts/contracts/DeDropsNFT.sol/DeDropsNFT.json')
    let dedrops = new ethers.Contract(dedropsAddress, dedropsAbi, accounts[0])

	await dedrops.connect(accounts[1]).mint(b(100), '测试第一批NFT', '谁都可以来领')
	console.log('mint done')
}


async function view() {
	const accounts = await hre.ethers.getSigners()

	const dedropsAbi = getAbi('./artifacts/contracts/DeDropsNFT.sol/DeDropsNFT.json')
    let dedrops = new ethers.Contract(dedropsAddress, dedropsAbi, accounts[1])

	const bankAbi = getAbi('./artifacts/contracts/Bank1155.sol/Bank1155.json')
    let bank = new ethers.Contract(bankAddress, bankAbi, accounts[1])

	let item = await dedrops.idToItem(b(4))
	console.log('id', n(item.id))
	console.log('info', item.info)
	console.log('info2', item.info2)

	console.log('bank nft:', n(await dedrops.balanceOf(bank.address, b(4))))
	console.log('account nft:', n(await dedrops.balanceOf(accounts[1].address, b(4))))

	let amount = n(await bank.tokenUserBalance(dedropsAddress, b(4), accounts[0].address))
	console.log('nft amount:', amount)
}


async function signAndClaim() {
	const accounts = await hre.ethers.getSigners()

	const dedropsAbi = getAbi('./artifacts/contracts/DeDropsNFT.sol/DeDropsNFT.json')
    let dedrops = new ethers.Contract(dedropsAddress, dedropsAbi, accounts[0])

	const bankAbi = getAbi('./artifacts/contracts/Bank1155.sol/Bank1155.json')
    let bank = new ethers.Contract(bankAddress, bankAbi, accounts[0])

	let owner = accounts[0].address
	let spender = accounts[1].address
	let deadline = b(parseInt(Date.now() / 1000) + 86400)
	let id = b(4)

	let digest = utils.keccak256(
		utils.solidityPack(
			['bytes1', 'bytes1', 'bytes32', 'bytes32'],
			[
				'0x19',
				'0x01',
				DOMAIN_SEPARATOR,
				utils.keccak256(
					utils.defaultAbiCoder.encode(
						['bytes32', 'address', 'uint256', 'address', 'address', 'uint256'],
						[CLAIM_TYPEHASH, dedrops.address, id, owner, spender, deadline]
					)
				)
			]
		)
	)
		
	let privateKey = '0x' + process.env.DEDROPS_PK;
	let signingKey = new ethers.utils.SigningKey(privateKey)
	let sign = signingKey.signDigest(digest)
	vrs = utils.splitSignature(sign)
	console.log(vrs)

	await bank.connect(accounts[1]).claim(dedrops.address, id, owner, spender, deadline
		, vrs.v, vrs.r, vrs.s, {gasLimit:BigNumber.from('8000000')})
	console.log('claim done')
}


function getAbi(jsonPath) {
	let file = fs.readFileSync(jsonPath)
	let abi = JSON.parse(file.toString()).abi
	return abi
}

function m(num) {
	return BigNumber.from('1000000').mul(num)
}

function d(bn) {
	return bn.div('1000').toNumber() / 1000
}

function b(num) {
	return BigNumber.from(num)
}

function n(bn) {
	return bn.toNumber()
}

async function delay(sec) {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, sec * 1000);
	})
}

view()
	.then(() => process.exit(0))
	.catch(error => {
		console.error(error);
		process.exit(1);
	});
