const config = require('../../conf/config.js');
const Subscription = require('./subscription')
const DropABI = require('../../res/abi/DeDropsNFT.json').abi
const db = require('../../routes/model/db')
const ethers = require('ethers')
const BigNumber = ethers.BigNumber

class DropNFT extends Subscription {

    get schedule() {
        // Execute a cron job every 1 Minutes 
        // return '*/1 * * * *'
        return '*/10 * * * * * '
    }

    async subscribe() {
        // console.log('drop nft subscribe')
        if (!this.isWatching) {
            const ctx = this
            console.log('watching nft drop.')
            this.isWatching = true

            try {
                let addr = config.polygon.contract.drop_nft
                console.log('contract', addr)
                let contract = this.service.polygon.getContract(addr, DropABI)

                contract.on('Drop', (id, amount, info, info2) => {
                    console.log('drop nft event:',id, amount, info, info2)
                    ctx.handleEvent(id, amount, info, info2)
                })
            } catch (e) {
                this.isWatching = false
                console.log(e)
            }
        }
        //test storage
        let info = {"name":"DEFI韭菜勋章","imgUrl":"https://i2.hhbkg.com/img/3105/fiuigydbujp.jpg","desc":"不卖！不卖！就是不卖！","nftCount":"99"}
        let rules = {"actions":[{"key":"sushi-swap","count":"1"},{"key":"gitcoin-grant","count":"1"}],"money":0}
        this.handleEvent(BigNumber.from(1), BigNumber.from(100), info, rules)
    }

    async handleEvent(id, amount, info, info2) {
        let nft = {
            id: id.toString(),
            amount: amount.toString(),
            info: info,
            rules: info2
        }
        await db.save(db.Collections.nft, nft)
    }
}

module.exports = DropNFT