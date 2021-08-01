const Service = require('./service')
const ethers = require('ethers')
const config = require('../../conf/config.js')
const LinkABI = require('../../res/abi/Chainlink.json')
const BigNumber = ethers.BigNumber
const axios = require('axios')
const db = require('../../routes/model/db')


class VerifyService extends Service {
    async checkNftDrop(address, indexedId) {
        console.log('check nft drop:',address, indexedId)
        let nft = await db.get(db.Collections.nft, {id: indexedId})
        if (!nft || nft.length == 0) {
            throw new Error('nft not found')
        }
        nft = nft[0]
        // console.log('nft:',nft)
        let resp = {drop: nft, match: true}
        if (BigNumber.from(nft.rules.money).gt(0)) {
            let assets = await this.service.chainlink.totalAssets(address)
            resp.money = {
                assets: assets,
                match: BigNumber.from(assets.total).gte(nft.rules.money)
            }
            resp.match = resp.match && resp.money.match
        }
        if (nft.rules.actions && nft.rules.actions.length > 0) {
            resp.actions = {}
            for (let act of nft.rules.actions) {
                switch(act.key) {
                    case 'sushi-swap':
                        let count = await this.service.graph.sushiSwapCount(address)
                        resp.actions[act.key] = {
                            swap: count,
                            match: BigNumber.from(count).gte(act.count)
                        }
                        resp.match = resp.match && resp.actions[act.key].match
                }
            }
        }
        return resp
    }

    async checkTokenDrop(address, indexedId) {
        console.log('check token drop:',address, indexedId)
        let token = await db.get(db.Collections.erc20, {id: indexedId})
        if (!token || token.length == 0) {
            throw new Error('token not found')
        }
        token = token[0]

        let resp = {drop: token, nfts:{}, match: true, value: '0'}

        for (let nft of token.rules.condition) {
            let nftResp = await this.checkNftDrop(address, nft)
            console.log('nftResp:', nftResp)
            resp.nfts[nft] = nftResp
            resp.match = resp.match && nftResp.match
        }
        if (resp.match) {
            resp.value = BigNumber.from(token.amount).div(token.rules.airdrop.tokenClaimableCount).toString()
        }
        return resp
    }
}

module.exports = VerifyService;