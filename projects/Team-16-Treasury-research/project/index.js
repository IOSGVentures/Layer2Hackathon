const { Requester, Validator } = require('@chainlink/external-adapter')
const config = require('./config')
// Define custom error scenarios for the API.
// Return true for the adapter to retry.
const customError = (data) => {
  if (data.Response === 'Error') return true
  return false
}

// Define custom parameters to be used by the adapter.
// Extra parameters can be stated in the extra object,
// with a Boolean value indicating whether or not they
// should be required.
const customParams = {
  p: ['TR_ETH_Aave'], // project
  index: ['FinMerics',], // 
}

const createRequest = (input, callback) => {
  // The Validator helps you validate the Chainlink request data
  const validator = new Validator(callback, input, customParams)
  const jobRunID = validator.validated.id

  const url = `https://min-api.cryptocompare.com/data/${endpoint}`
  const project = validator.validated.data.p.toUpperCase()
  const index = validator.validated.data.index.toUpperCase()

  const params = {
    fsym,
    tsyms
  }

  // This is where you would add method and headers
  // you can add method like GET or POST and add it to the config
  // The default is GET requests
  // method = 'get' 
  // headers = 'headers.....'
  const ethConfig = {
    url,
    params
  }

  const polygonConfig = {
    url,
    params
  }

  // The Requester allows API calls be retry in case of timeout
  // or connection failure
  /*
  Requester.request(config, customError)
    .then(response => {
      // It's common practice to store the desired value at the top-level
      // result key. This allows different adapters to be compatible with
      // one another.

      // handler response
      response.data.result = Requester.validateResultNumber(response.data, [tsyms])
      callback(response.status, Requester.success(jobRunID, response))
    })
    .catch(error => {
      callback(500, Requester.errored(jobRunID, error))
    })


    */

  Promise.all(Requester.request(ethConfig, customError), Requester.request(ethConfig, customError))
    .then(response => {

    })
    .catch(
      error => {
        callback(500, Requester.errored(jobRunID, error))
      }
    )


}


/**
 * calculate
 * log(beta_0)+beta_1*log(TVL)+beta_2*log(MV trading volume)
 * 
 * @params totalLiquidityUSD
 * @totalVolumeUSD totalVolumeUSD
 * 
 * https://woolen-twill-715.notion.site/modeling-9a6ee46e2c40456ea944b2d6afdbe9cb
 */
const calculate = ({ totalLiquidityUSD, totalVolumeUSD }) => {

  // -13.8673+0.9699*log(TVL)-0.0154*log(MV trading volume)
  // -13.8673+0.9699*log(TVL)-0.0154*log(MV trading volume)
  const beta_0 = -13.8673;
  const beta_1 = 0.9699;
  const beta_2 = 0.0154;

  // log(beta_0)+beta_1*log(TVL)+beta_2*log(MV trading volume)

  const result = log(beta_0) + beta_1 * log(totalLiquidityUSD, 10) + beta_2 * log(totalVolumeUSD, 10)

  return result;
}

/**
 * isOperator
 * Execution method
 * If modelPrice > realPrice, we keep current buy position on MCDEX (buy 1 UNI if no position yet)
 * If modelPrice < realPrice, we clear position on MCDEX (keep empty of no position)
 * 
 * @params chainlinkUniPrice  chainlinkUniPrice
 */

let flags = 0; // 1 buy 2 sell
const isOperator = (chainlinkUniPrice) => {

  const modelPrice = calculate()
  if (modelPrice - chainlinkUniPrice > 0 && flags !== 1) {
    flags = 1;
    return "1"
  }

  if (modelPrice - chainlinUniPrice < 0 && flags !== 2) {
    flags = 2;
    return "2"
  }

}




// This allows the function to be exported for testing
// or for running in express
module.exports.createRequest = createRequest
