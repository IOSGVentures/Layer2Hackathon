const hre = require('hardhat')
const fs = require('fs')
const { BigNumber, utils } = require('ethers')

//matic
var tokenAddress = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'
var bankAddress = '0x13d6f4529c2a003f14cde0a356cee66637cd739a'
var DOMAIN_SEPARATOR = '0x3b4ce86ee8d7aab11e1f2deedfa185c8268cc4b1061ee70f69e020328fff4ac1'
var CLAIM_TYPEHASH = '0xa05335bcb0b0413b06aebf7578cda47f15e56bda72a634ee823fc1ef42ec1994'
var PASSWORD_TYPEHASH = '0x3dce4743a9c307489689d5a78849d8466d3d3fa3806e2e97961cead248e9a34b'
var psw = '123456'


async function main() {
	const accounts = await hre.ethers.getSigners()

	const Bank20 = await ethers.getContractFactory('Bank20')
	let bank = await Bank20.deploy()
	await bank.deployed()
	DOMAIN_SEPARATOR = await bank.DOMAIN_SEPARATOR()
	CLAIM_TYPEHASH = await bank.CLAIM_TYPEHASH()
	PASSWORD_TYPEHASH = await bank.PASSWORD_TYPEHASH()
	console.log('Claim deployed to:', bank.address, 'DOMAIN_SEPARATOR:', DOMAIN_SEPARATOR, 'CLAIM_TYPEHASH:', CLAIM_TYPEHASH, 'PASSWORD_TYPEHASH:', PASSWORD_TYPEHASH)
}


async function deposit() {
	const accounts = await hre.ethers.getSigners()

	const tokenAbi = getAbi('./artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json')
    let token = new ethers.Contract(tokenAddress, tokenAbi, accounts[0])

	const bankAbi = getAbi('./artifacts/contracts/Bank20.sol/Bank20.json')
    let bank = new ethers.Contract(bankAddress, bankAbi, accounts[0])

	await token.approve(bank.address, m(1), {gasLimit:b('8000000')})
	console.log('approve done')

	await bank.deposit(token.address, m(1), accounts[0].address, {gasLimit:b('8000000')})
	console.log('deposit done')
}


async function view() {
	const accounts = await hre.ethers.getSigners()

	const bankAbi = getAbi('./artifacts/contracts/Bank20.sol/Bank20.json')
    let bank = new ethers.Contract(bankAddress, bankAbi, accounts[0])

	DOMAIN_SEPARATOR = await bank.DOMAIN_SEPARATOR()
	CLAIM_TYPEHASH = await bank.CLAIM_TYPEHASH()
	PASSWORD_TYPEHASH = await bank.PASSWORD_TYPEHASH()
	console.log('DOMAIN_SEPARATOR:', DOMAIN_SEPARATOR, 'CLAIM_TYPEHASH:', CLAIM_TYPEHASH, 'PASSWORD_TYPEHASH:', PASSWORD_TYPEHASH)

	// let balance = d(await bank.tokenUserBalance(tokenAddress, accounts[0].address))
	// console.log('balance:', balance)
}


async function signClaim() {
	const accounts = await hre.ethers.getSigners()

	let holder = accounts[0].address
	let spender = accounts[1].address
	// let spender = '0x37f88413AADb13d85030EEdC7600e31573BCa3c3'
	let value = b(100000)
	// let deadline = b(parseInt(Date.now() / 1000) + 86400)
	let deadline = b(1631141007)

	let digest = utils.keccak256(
		utils.solidityPack(
			['bytes1', 'bytes1', 'bytes32', 'bytes32'],
			[
				'0x19',
				'0x01',
				DOMAIN_SEPARATOR,
				utils.keccak256(
					utils.defaultAbiCoder.encode(
						['bytes32', 'address', 'address', 'address', 'uint256', 'uint256'],
						[CLAIM_TYPEHASH, tokenAddress, holder, spender, value, deadline]
					)
				)
			]
		)
	)

	let privateKey = '0x' + process.env.ETH_PK_0
	let signingKey = new ethers.utils.SigningKey(privateKey)
	let sign = signingKey.signDigest(digest)
	let vrs = utils.splitSignature(sign)

	console.log('token:', tokenAddress)
	console.log('owner:', holder)
	console.log('spender:', spender)
	console.log('value:', value.toString())
	console.log('deadline:', n(deadline))
	console.log('v:', vrs.v)
	console.log('r:', vrs.r)
	console.log('s:', vrs.s)
}


async function claim() {
	const accounts = await hre.ethers.getSigners()

	const bankAbi = getAbi('./artifacts/contracts/Bank20.sol/Bank20.json')
    let bank = new ethers.Contract(bankAddress, bankAbi, accounts[0])

	let holder = accounts[0].address
	let spender = accounts[1].address
	let value = m(1)
	let deadline = b(1627273911)
	let vrs = {
		r: '0x835d7d4494d47314485ebe6d763ad6e1f6eea04d014966846e0306bdb09ec1ba',
		s: '0x75425a0e60cd8bba130d5e873bdca54eb1ce7b781c16236b3654bc6ab0149a70',
		_vs: '0xf5425a0e60cd8bba130d5e873bdca54eb1ce7b781c16236b3654bc6ab0149a70',
		recoveryParam: 1,
		v: 28
	}

	await bank.connect(accounts[1]).claim(tokenAddress, holder, spender, value, deadline
		, vrs.v, vrs.r, vrs.s, {gasLimit:BigNumber.from('800000')})
	console.log('claim done')
}


async function signPassword() {
	const accounts = await hre.ethers.getSigners()

	let holder = accounts[0].address
	let value = m(1).div(10)
	let deadline = b(parseInt(Date.now() / 1000) + 86400)

	let digest = utils.keccak256(
		utils.solidityPack(
			['bytes1', 'bytes1', 'bytes32', 'bytes32'],
			[
				'0x19',
				'0x01',
				DOMAIN_SEPARATOR,
				utils.keccak256(
					utils.defaultAbiCoder.encode(
						['bytes32', 'address', 'address', 'string', 'uint256', 'uint256'],
						[PASSWORD_TYPEHASH, tokenAddress, holder, psw, value, deadline]
					)
				)
			]
		)
	)

	let privateKey = '0x' + process.env.ETH_PK_0
	let signingKey = new ethers.utils.SigningKey(privateKey)
	let sign = signingKey.signDigest(digest)
	let vrs = utils.splitSignature(sign)
	
	console.log('token:', tokenAddress)
	console.log('owner:', holder)
	console.log('psw:', psw)
	console.log('value:', value.toString())
	console.log('deadline:', n(deadline))
	console.log('v:', vrs.v)
	console.log('r:', vrs.r)
	console.log('s:', vrs.s)
}


async function password() {
	const accounts = await hre.ethers.getSigners()

	const bankAbi = getAbi('./artifacts/contracts/Bank20.sol/Bank20.json')
    let bank = new ethers.Contract(bankAddress, bankAbi, accounts[0])

	let holder = accounts[0].address
	let value = m(1).div(10)
	let deadline = b(1627273911)
	let vrs = {
		r: '0x835d7d4494d47314485ebe6d763ad6e1f6eea04d014966846e0306bdb09ec1ba',
		s: '0x75425a0e60cd8bba130d5e873bdca54eb1ce7b781c16236b3654bc6ab0149a70',
		v: 28
	}

	await bank.connect(accounts[2]).password(tokenAddress, holder, psw, value, deadline
		, vrs.v, vrs.r, vrs.s, {gasLimit:BigNumber.from('8000000')})
	console.log('password done')
}


async function withdraw() {
	const accounts = await hre.ethers.getSigners()

	const bankAbi = getAbi('./artifacts/contracts/Bank20.sol/Bank20.json')
    let bank = new ethers.Contract(bankAddress, bankAbi, accounts[0])

	let balance = await bank.tokenUserBalance(tokenAddress, accounts[0].address)
	console.log('balance:', d(balance))

	await bank.withdraw(tokenAddress, accounts[0].address, balance, {gasLimit:BigNumber.from('800000')})
	console.log('withdraw done')
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
