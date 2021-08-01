const router = require('koa-router')();
const config = require('../../conf/config.js');
const db = require('../../routes/model/db.js');

router.get('/dropList', async (ctx) => {
	try {
		// let id = ctx.query.id
		let token = ctx.query.token
		data = await db.getERC20ClaimData({token: token})
		ctx.body = {
			code: 0,
			msg: 'ok',
			data: data
		}
	} catch (err) {
		ctx.body = { data: null, code: 1, msg: err.message }
	}
})

module.exports = router.routes();