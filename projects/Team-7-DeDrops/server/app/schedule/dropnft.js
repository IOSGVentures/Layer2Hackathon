const config = require('../../conf/config.js');
const Subscription = require('./subscription')
const DropABI = require('../../res/abi/DeDropsNFT.json').abi
const db = require('../../routes/model/db')

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
                    console.log('drop event:',id, amount, info, info2)
                    ctx.handleEvent(id, amount, info, info2)
                })
            } catch (e) {
                this.isWatching = false
                console.log(e)
            }
        }
    }

    async handleEvent(id, amount, info, info2) {
        let nft = {
            id: id.toString(),
            amount: amount.toString(),
            info: info,
            rules: info2
        }
        await db.save('nft', nft)
    }
}

module.exports = DropNFT