const {dailyData} = require('./utils')

const call = async () => {
    let result = await dailyData('2021-03-02T12:00:00Z', '2021-03-04T12:00:00Z')
    console.log(result)
}

call()


/**
 * 
 * 
 * 
 * 
 * 
 */

[{
    date: '2021-03-03T12:00:00Z',
    block: 11965141,
    timestamp: 1614772813,
    id: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    totalLiquidityETH: '2647584.325292963131842595825483074',
    totalLiquidityUSD: '4238418143.592823803336185674944419',
    totalVolumeETH: '159815574.2693417130568054880081696',
    totalVolumeUSD: '107146763423.5536522856716905971492',
    '24LiquidityETH': 12118.478399678133,
    '24LiquidityUSD': 113384136.24194431,
    '24VolumeETH': 532069.0060328841,
    '24VolumeUSD': 816617655.9216003
  },
  {
    date: '2021-03-04T12:00:00Z',
    block: 11971656,
    timestamp: 1614859213,
    id: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    totalLiquidityETH: '2665069.256215768985861483156604349',
    totalLiquidityUSD: '4155351294.948917415362851255039192',
    totalVolumeETH: '160366190.2404021918000111390802408',
    totalVolumeUSD: '108021243368.3966752740072625781545',
    '24LiquidityETH': 17484.930922805797,
    '24LiquidityUSD': -83066848.6439066,
    '24VolumeETH': 550615.9710604846,
    '24VolumeUSD': 874479944.8430328
  }]