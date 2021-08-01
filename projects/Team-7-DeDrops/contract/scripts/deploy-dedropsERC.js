const hre = require('hardhat')
const fs = require('fs')
const { BigNumber, utils } = require('ethers')


//matic
var tokenAddress = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'
var bankAddress = '0x13d6f4529c2a003f14cde0a356cee66637cd739a'
var DOMAIN_SEPARATOR = '0x3b4ce86ee8d7aab11e1f2deedfa185c8268cc4b1061ee70f69e020328fff4ac1'
var CLAIM_TYPEHASH = '0xa05335bcb0b0413b06aebf7578cda47f15e56bda72a634ee823fc1ef42ec1994'
var PASSWORD_TYPEHASH = '0x3dce4743a9c307489689d5a78849d8466d3d3fa3806e2e97961cead248e9a34b'
var dedropsAddress = '0xF2F2ed5f790f33e33f48D0e33addb33B002Ab4DF'


async function main() {
    const accounts = await hre.ethers.getSigners()

    // const Bank20 = await ethers.getContractFactory('Bank20')
    // let bank = await Bank20.deploy()
    // await bank.deployed()
    // DOMAIN_SEPARATOR = await bank.DOMAIN_SEPARATOR()
    // CLAIM_TYPEHASH = await bank.CLAIM_TYPEHASH()
    // PASSWORD_TYPEHASH = await bank.PASSWORD_TYPEHASH()
    // console.log('Claim deployed to:', bank.address, 'DOMAIN_SEPARATOR:', DOMAIN_SEPARATOR, 'CLAIM_TYPEHASH:', CLAIM_TYPEHASH, 'PASSWORD_TYPEHASH:', PASSWORD_TYPEHASH)

    const DeDropsERC = await ethers.getContractFactory('DeDropsERC')
    let dedrops = await DeDropsERC.deploy(bankAddress)
    await dedrops.deployed()
    console.log('DeDropsERC deployed to:', dedrops.address)
}


async function drop() {
    const accounts = await hre.ethers.getSigners()

    const tokenAbi = getAbi('./artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json')
    let token = new ethers.Contract(tokenAddress, tokenAbi, accounts[0])

	const dedropsAbi = getAbi('./artifacts/contracts/DeDropsERC.sol/DeDropsERC.json')
    let dedrops = new ethers.Contract(dedropsAddress, dedropsAbi, accounts[0])

    await token.connect(accounts[1]).approve(dedrops.address, b(100))
    console.log('approve done')

    await dedrops.connect(accounts[1]).drop(token.address, b(100), '测试空投', '测试的空投，有问题联系DeDrops.xyz', {gasLimit:BigNumber.from('8000000')})
    console.log('drop done')
}


async function view() {
    const accounts = await hre.ethers.getSigners()

    const tokenAbi = getAbi('./artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json')
    let token = new ethers.Contract(tokenAddress, tokenAbi, accounts[0])

    const dedropsAbi = getAbi('./artifacts/contracts/DeDropsERC.sol/DeDropsERC.json')
    let dedrops = new ethers.Contract(dedropsAddress, dedropsAbi, accounts[0])

    const bankAbi = getAbi('./artifacts/contracts/Bank20.sol/Bank20.json')
    let bank = new ethers.Contract(bankAddress, bankAbi, accounts[0])

    let item = await drop.idToItem(b(1))
    console.log('id', n(item.id))
    console.log('token', item.token)
    console.log('info', item.info)
    console.log('info2', item.info2)

    console.log('bank balance:', n(await token.balanceOf(bank.address)))

    let amount = n(await bank.tokenUserBalance(tokenAddress, accounts[0].address))
    console.log('account0 balance in bank:', amount)
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

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
