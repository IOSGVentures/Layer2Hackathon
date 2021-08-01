const Service = require('./service')
const ethers = require('ethers')
const config = require('../../conf/config.js')
const LinkABI = require('../../res/abi/Chainlink.json')
const BigNumber = ethers.BigNumber


class LinkService extends Service {
    _tokens() {
        let tokens = []
        for (let t in config.chainlink) {
            tokens.push(t)
        }
        return tokens
    }
    
    async getPrice(token) {
        let addr = config.chainlink[token]
        let contract = this.service.eth.getContract(addr, LinkABI)
        let decimals = await contract.decimals()
        // update time
        // let timestamp = await contract.latestTimestamp()
        let price = await contract.latestAnswer()
        return {price: price.toString(), decimals: decimals}
    }

    async totalAssets(address) {
        let assets = {
            total: '0',
        }
        let tokens = this._tokens()
        for (let token of tokens) {
            let balacne = await this.service.polygon.balanceOf(address, token)
            if (BigNumber.from(balacne.balacne).gt(0)) {
                let price = await this.getPrice(token)
                assets[token] = {
                    price: price,
                    balacne: balacne
                }
                assets.total = BigNumber.from(balacne.balacne).mul(price.price).div(price.decimals).div(balacne.decimals).add(assets.total).toString()
            }
        }
        return assets
    }
}

module.exports = LinkService;