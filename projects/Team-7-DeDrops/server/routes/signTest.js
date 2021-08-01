const router = require('koa-router')()
const sign = require('./tools/sign.js')



/*================================= NFT签名数据 ================================*/
router.get('/getNFTClaimData', async (ctx) => {
    try {
        // let body = {}
        // body.id = ctx.request.body.id
        // body.spender = ctx.request.body.spender
        // body.deadline = ctx.request.body.deadline

        //test
        let body = {
            id: '1',
            spender: '0xE44081Ee2D0D4cbaCd10b44e769A14Def065eD4D',
            deadline: '1627457471'
        }

        let vrs = sign.signERC1155Claim(body)

        ctx.body = { data: vrs, code: 0, msg: 'success' }
    } catch (err) {
        ctx.body = { data: null, code: 1, msg: err.message }
    }
})



/*================================= ERC20签名数据 ================================*/
router.get('/getERC20ClaimData', async (ctx) => {
    try {
        // let obj = {}
        // obj.token = ctx.request.body.token
        // obj.owner = ctx.request.body.owner
        // obj.spender = ctx.request.body.spender
        // obj.value = ctx.request.body.value
        // obj.deadline = ctx.request.body.deadline

        //test
        let body = {
            token: '0x55d398326f99059ff775485246999027b3197956',
            owner: '0xE44081Ee2D0D4cbaCd10b44e769A14Def065eD4D',
            spender: '0x37f88413AADb13d85030EEdC7600e31573BCa3c3',
            value: '1000000000000000000',
            deadline: '1627457471'
        }

        let vrs = sign.signERC20Claim(body)

        ctx.body = { data: vrs, code: 0, msg: 'success' }
    } catch (err) {
        ctx.body = { data: null, code: 1, msg: err.message }
    }
})


module.exports = router.routes()