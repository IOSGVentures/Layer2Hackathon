const Service = require('./service')
const ethers = require('ethers')
const config = require('../../conf/config.js')
const LinkABI = require('../../res/abi/Chainlink.json')
const BigNumber = ethers.BigNumber
const axios = require('axios')



class GraphService extends Service {
    async query(subgraph, query) {
        console.log('query:',subgraph, query)
        let resp = await axios.post(subgraph, query)
        // console.log('resp:', resp.data)
        return resp.data.data
    }

    async sushiSwapCount(address) {
        let query = {
            "query":`{\n  swaps(where:{sender:\"${address}\"}) {\n    id\n  }\n}\n`,
            "variables":null
        }
        let resp = await this.query(config.graph.sushi, query)
        return resp.swaps.length
    }

    async sushiLiquidity(address) {

    }
}

module.exports = GraphService;