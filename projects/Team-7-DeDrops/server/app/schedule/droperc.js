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

                contract.on('Drop', (id, token, amount, info, info2) => {
                    // console.log('drop erc event:', id, token, amount, info, info2)
                    ctx.handleEvent(id.toString(), token, amount.toString(), JSON.parse(info), JSON.parse(info2))
                })
            } catch (e) {
                this.isWatching = false
                console.log(e)
            }
        }

        // let info = {
        //     "id" : "1",
        //     "token" : "0xeec596195470BB63843cf7D568ba14e0e4F6c6F4",
        //     "amount" : "20210801",
        //     "info" : "{\"name\":\"L2 Hackthon Airdrop\",\"imgUrl\":\"https://pbs.twimg.com/media/E7cSy8KVcAIZgRB?format=png&name=4096x4096\",\"desc\":\"In support of developers to explore more possibilities of Layer2 solutions and open up new paths, IOSG Ventures and Chainlink are going to launch a global hackathon, powered by MatterLabs, The Graph, Aurora, DODO, Polygon, Synthetix, Perpetual Protocol, MCDEX, Celer, NEAR, Hop Protocol, OpenDeFi, dYdX, Gelato, and Loopring（More projects are pending!）on the theme of Layer 2 scaling to find the real “Hacking Voyager”. The hackathon is scheduled to open for registration from TODAY to July 21 and 3 days of hacking & demo in Shanghai from July 30 to August 1.\",\"website\":\"\",\"twitter\":\"https://twitter.com/includeleec/status/1420988534895177728\",\"telegram\":\"\"}",
        //     "rules" : "{\"airdrop\":{\"token\":\"0xeec596195470bb63843cf7d568ba14e0e4f6c6f4\",\"tokenAmount\":\"20210801\",\"tokenClaimableCount\":\"80\",\"startTime\":\"2021-07-31\",\"endTime\":\"2021-08-03\",\"tokenAmountBN\":{\"type\":\"BigNumber\",\"hex\":\"0x10b7cdb7b436fff3240000\"}},\"condition\":[\"1\"]}",
        //     "time" : 1627745505990
        // }
        // info.info = JSON.parse(info.info)
        // info.rules = JSON.parse(info.rules)
        // // let rules = {"actions":[{"key":"sushi-swap","count":"1"},{"key":"gitcoin-grant","count":"1"}],"money":0}
        // this.handleEvent(info.id, info.token,info.amount, info.info, info.rules)
    }

    async handleEvent(id, token, amount, info, info2) {
        await db.deleteObj(db.Collections.erc20, {id: id})
        let item = {
            id: id,
            token: token,
            amount: amount,
            info: info,
            rules: info2
        }
        console.log('drop token event:', JSON.stringify(item))
        await db.save(db.Collections.erc20, item)
    }
}

module.exports = DropERC