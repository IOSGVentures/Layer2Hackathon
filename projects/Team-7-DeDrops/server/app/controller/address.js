const router = require('koa-router')();
const date = require("silly-datetime");
const utils = require('../../routes/tools/utils.js');
const config = require('../../conf/config.js');
const service = require('../service/service')
const sign = require('../../routes/tools/sign')

// 查询地址资产
router.get('/assets', async (ctx) => {
	try {
		let address = ctx.query.address
		let assets = await ctx.service.chainlink.totalAssets(address)

		console.log(assets)
		ctx.body = {
			code: 0,
			msg: 'ok',
			data: assets
		}
	} catch (err) {
		ctx.body = { data: null, code: 1, msg: err.message }
	}
})

router.get('/check', async (ctx) => {
	try {
		let address = ctx.query.address
		let id = ctx.query.id
		let resp = await ctx.service.nft.check(address, id)

		if (resp.match) {
			let body = {
				token: '0x55d398326f99059ff775485246999027b3197956',
				owner: '0xE44081Ee2D0D4cbaCd10b44e769A14Def065eD4D',
				spender: '0x37f88413AADb13d85030EEdC7600e31573BCa3c3',
				value: '1000000000000000000',
				deadline: '1627457471'
			}
	
			resp.sign = sign.signERC20Claim(body)
		}
		ctx.body = {
			code: 0,
			msg: 'ok',
			data: resp
		}
	} catch (err) {
		ctx.body = { data: null, code: 1, msg: err.message }
	}
})

module.exports = router.routes();