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
        return BigNumber.from(price).div(BigNumber.from(10).pow(decimals)).toString()
    }

    async totalAssets(address) {
        let assets = {
            total: '0',
        }
        let tokens = this._tokens()
        for (let token of tokens) {
            let price = await this.getPrice(token)
            let balacne = await this.service.eth.balanceOf(address, token)
            if (BigNumber.from(balacne).gt(0)) {
                assets[token] = {
                    price: price,
                    balacne: balacne,
                }
                assets.total = BigNumber.from(balacne).mul(price).add(assets.total).toString()
            }
        }
        return assets
    }
}

module.exports = LinkService;