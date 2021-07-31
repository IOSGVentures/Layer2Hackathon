const { expect, assert } = require('chai')
const { BigNumber, utils} = require('ethers')
const fs = require('fs')
const hre = require('hardhat')


describe('drop-nft-test', function () {
    let DOMAIN_SEPARATOR = ''
    let CLAIM_TYPEHASH = ''
    let PASSWORD_TYPEHASH = ''
    let accounts
	let dedrops
    let id = b(1)
	let bank
	let deadline
    let vrs
    let owner
    let spender
    let chainId

	before(async function () {
		accounts = await ethers.getSigners()
        
		console.log('account 0', accounts[0].address)
		console.log('account 1', accounts[1].address)
		console.log('account 2', accounts[2].address)
	})
	
	it('deploy', async function () {
		const Bank1155 = await ethers.getContractFactory('Bank1155')
		bank = await Bank1155.deploy()
		await bank.deployed()
        DOMAIN_SEPARATOR = await bank.DOMAIN_SEPARATOR()
        CLAIM_TYPEHASH = await bank.CLAIM_TYPEHASH()
        PASSWORD_TYPEHASH = await bank.PASSWORD_TYPEHASH()
		console.log('Bank1155 deployed to:', bank.address, 'DOMAIN_SEPARATOR:'
            , DOMAIN_SEPARATOR, 'CLAIM_TYPEHASH:', CLAIM_TYPEHASH, 'PASSWORD_TYPEHASH:', PASSWORD_TYPEHASH)
		
		const DeDropsNFT = await ethers.getContractFactory('DeDropsNFT')
		dedrops = await DeDropsNFT.deploy(bank.address)
		await dedrops.deployed()
		console.log('DeDropsNFT deployed to:', dedrops.address)

        let info = '比特币BTC：全部靠矿机挖出，每4年产量减半。因为刚开始那2年没什么人关注，只有中本聪自己在挖，所以他挖了400多万枚（总量2100万），占比不小，但是他至今一个币没卖，简直是神人，没人知道他是谁。BTC的市值占整个加密货币里面一半以上，每个涨跌都牵系着整个币圈的震荡。现在越来越多的人把BTC当作数字黄金，而不是货币，因为货币是一直贬值，黄金一直增值。说到比特币，不得不提挖矿，虽然很耗电，但是这是一种公平的发行方式，股票不可能因为你经常买这家公司的产品，而送你股票，即使你给这家公司打工，股票也会酌情给老员工，而且只给一丢丢。挖矿就不一样了，参与者都有BTC奖励，可以快速聚拢起矿工社群，大矿工比如宝二爷，会去推广，让越来越多的人参与进来，人多了，就有了价值。'
        let info2 = '以太坊ETH：ETH对币圈的影响太深远了，今天的BTC是精神图腾的存在，ETH是大半个加密世界的基础设施。BTC在转账的时候，可以加一段备注，后来发展为可以发一段简单的程序代码，这个就是智能合约的雏形。ETH对这项功能进行了重新设计，使得图灵完备，即可以实现复杂的程序，而且ETH的挖矿算法也改进到了极致，速度快，抗asic，刚好在LTC被asic化之后，简直就是显卡矿工之家，直到今天也是显卡挖矿第一选择。未来会转POS，即淘汰POW矿机挖矿，把ETH抵押给节点就能挖出ETH，如果你怕节点跑路，那最好你自己运行一个节点（服务器），由此来去中心化，这个是技术发展的必然，因为POS的速度更快（快100倍以上），可以容纳更多的应用，以及更好的稳定币价，还省电。ETH已经建立了庞大的社群，矿工人数占比不高了，如今DEFI成为ETH新的发动机，让更多生态进来是ETH的挑战，制约生态的正是POW挖矿的性能瓶颈和高昂手续费，也因此价值溢出让BSC、polygon等EVM公链崛起，所以POS是未来的方向。'
        await dedrops.connect(accounts[1]).mint(b(100), info, info2)
        console.log('mint done')
        
        let item = await dedrops.idToItem(b(1))
        console.log('id', n(item.id))
        console.log('amount', n(item.amount))
        console.log('info', item.info)
        console.log('info2', item.info2)

        await print()
	})

	it('sign claim', async function () {
        owner = accounts[0].address
        spender = accounts[1].address
        deadline = b(parseInt(Date.now() / 1000) + 86400)
        chainId = accounts[0].provider._network.chainId
    
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
            
        let privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' //account0 pk
        let signingKey = new ethers.utils.SigningKey(privateKey)
        let sign = signingKey.signDigest(digest)
        vrs = utils.splitSignature(sign)
        console.log(vrs)
	})

    it('claim', async function () {
        await bank.connect(accounts[1]).claim(dedrops.address, id, owner, spender, deadline
            , vrs.v, vrs.r, vrs.s, {gasLimit:BigNumber.from('8000000')})
        console.log('claim')
        
        await print()
    })

    async function print() {
        console.log('')

        console.log('account0 nft1:', n(await dedrops.balanceOf(accounts[0].address, b(1))))
        console.log('account1 nft1:', n(await dedrops.balanceOf(accounts[1].address, b(1))))
        console.log('account2 nft1:', n(await dedrops.balanceOf(accounts[2].address, b(1))))
        console.log('bank nft1:', n(await dedrops.balanceOf(bank.address, b(1))))

        let amount = n(await bank.tokenUserBalance(dedrops.address, b(1), accounts[0].address))
	    console.log('account0  nft1 in bank:', amount)
        amount = n(await bank.tokenUserBalance(dedrops.address, b(1), accounts[1].address))
	    console.log('account1  nft1 in bank:', amount)

        console.log('')
	}


	function getAbi(jsonPath) {
		let file = fs.readFileSync(jsonPath)
		let abi = JSON.parse(file.toString()).abi
		return abi
	}

	function m(num) {
		return BigNumber.from('1000000000000000000').mul(num)
	}

	function d(bn) {
		return bn.div('1000000000000000').toNumber() / 1000
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
})