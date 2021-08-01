const EthDater = require('ethereum-block-by-date');
const { ethers } = require('ethers');
const provider = new ethers.providers.CloudflareProvider();
const {uni_v2} = require('./constants')
const { request, gql, GraphQLClient } =require('graphql-request')

const tvlQuery = gql`query test($block: Int){
    uniswapFactories(block: {number: $block}){
        id
        totalVolumeUSD
        totalVolumeETH
        totalLiquidityUSD
        totalLiquidityETH
  }
}`

const getEveryDayBlocks = async (start, end) => {
    const dater = new EthDater(
        provider // Ethers provider, required.
    );
    
    let blocks = await dater.getEvery(
        'days', // Period, required. Valid value: years, quarters, months, weeks, days, hours, minutes
        start, // Start date, required. Any valid moment.js value: string, milliseconds, Date() object, moment() object.
        end, // End date, required. Any valid moment.js value: string, milliseconds, Date() object, moment() object.
        1, // Duration, optional, integer. By default 1.
        true // Block after, optional. Search for the nearest block before or after the given date. By default true.
    );
    return blocks
}


const makeCallbyBlock = (block) => {
    return new Promise((resolve, reject) => {
        request(uni_v2, tvlQuery, {
            block: block.block
        })
        .then((res) => {
            resolve({...block, ...res.uniswapFactories[0]})
        })
        .catch((error) => {
            console.error(error)
            resolve();
        })
    })
}

const calculateMovingTV = (values) => {
    for (var i=1; i<values.length; i++) {
        values[i]['24LiquidityETH'] = values[i].totalLiquidityETH - values[i-1].totalLiquidityETH
        values[i]['24LiquidityUSD'] = values[i].totalLiquidityUSD - values[i-1].totalLiquidityUSD
        values[i]['24VolumeETH'] = values[i].totalVolumeETH - values[i-1].totalVolumeETH
        values[i]['24VolumeUSD'] = values[i].totalVolumeUSD - values[i-1].totalVolumeUSD
    }
    return values
}
module.exports = {
    dailyData: async function(start, end) {
        let blocks = await getEveryDayBlocks(start, end)
        return Promise.all(
            blocks.map(makeCallbyBlock)
        ).then((values) => {
            return calculateMovingTV(values)
          })
    }
}