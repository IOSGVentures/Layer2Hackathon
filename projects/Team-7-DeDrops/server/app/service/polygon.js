const Service = require('./service')
const ethers = require('ethers')
const config = require('../../conf/config.js')
const BigNumber = ethers.BigNumber
const ERC20ABI = require('../../res/abi/ERC20.json')

class PolygonService extends Service {
    get provider() {
        if (!this._provider) {
            this._provider = new ethers.providers.JsonRpcProvider(config.polygon.httpServer)
        }
        return this._provider
    }

    tokenAddress(token) {
        let addr = config.polygon.tokens[token]
        if (!addr) {
            throw new Error(`token address not found:${token}.`)
        }
        return addr
    }

    getContract(contract, abi) {
        return new ethers.Contract(contract, abi, this.provider);
    }

    async balacne(address) {
        return await this.balanceOf(address, 'matic')
    }

    async balanceOf(address, token) {
        token = token.toLowerCase();
        if (token == 'matic') {
            let balacne = await this.provider.getBalance(address)
            return {balacne: balacne.toString(), decimals: 18}
        } else {
            let contract = this.getContract(this.tokenAddress(token), ERC20ABI)
            let decimals = await contract.decimals()
            let balacne = await contract.balanceOf(address)
            return {balacne: balacne.toString(), decimals: decimals}
        }
    }
}

module.exports = PolygonService;
