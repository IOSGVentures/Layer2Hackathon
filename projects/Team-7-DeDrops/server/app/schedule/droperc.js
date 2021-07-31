const config = require('../../conf/config.js');
const Subscription = require('./subscription')
const DropABI = require('../../res/abi/DeDropsERC.json').abi
const db = require('../../routes/model/db')
const ethers = require('ethers')
const BigNumber = ethers.BigNumber

class DropERC extends Subscription {

    get schedule() {
        // Execute a cron job every 1 Minutes 
        // return '*/1 * * * *'
        return '*/10 * * * * * '
    }

    async subscribe() {
        // console.log('drop nft subscribe')
        if (!this.isWatching) {
            const ctx = this
            console.log('watching erc drop.')
            this.isWatching = true

            try {
                let addr = config.polygon.contract.drop_erc
                console.log('contract', addr)
                let contract = this.service.polygon.getContract(addr, DropABI)

                contract.on('Drop', (token, amount, info, info2, event) => {
                    console.log('drop erc event:',token, amount, info, info2)
                    ctx.handleEvent(token, amount, info, info2, event)
                })
            } catch (e) {
                this.isWatching = false
                console.log(e)
            }
        }
        // //test storage
        // let info = {"name":"DEFI韭菜勋章","imgUrl":"https://i2.hhbkg.com/img/3105/fiuigydbujp.jpg","desc":"不卖！不卖！就是不卖！","nftCount":"99"}
        // let rules = {"actions":[{"key":"sushi-swap","count":"1"},{"key":"gitcoin-grant","count":"1"}],"money":0}
        // this.handleEvent(BigNumber.from(1), BigNumber.from(100), info, rules, null)
    }

    async handleEvent(token, amount, info, info2, event) {
        let from = await event.getTransaction()
        let query = {
            token: token,
            owner: from,
            spender: config.eth_account
        }
        let item = await db.getERC20ClaimData(query)
        if (!item || item.length == 0) {
            throw new Error('claim not found')
        }
        item.amount = amount.toString()
        // item.info = info
        // item.rules = info2
        await db.save(db.Collections.erc20claims, item)
    }
}

module.exports = DropERC