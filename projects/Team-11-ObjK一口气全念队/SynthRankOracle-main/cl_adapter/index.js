const { Requester, Validator } = require('@chainlink/external-adapter');
const { SynthetixJs } = require('synthetix-js');
var numbro = require("numbro");

const SUPPORTED_NETWORKS = {
  'mainnet': 1,
  'ropsten': 3,
  'rinkeby': 4,
  'kovan': 42 };

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
  base: ['base', 'from', 'coin'],
  quote: ['quote', 'to', 'market'],
  endpoint: false
}

const getPercent = async (rank) => {

  // basic parameters
  const network = "mainnet";
  const networkId = SUPPORTED_NETWORKS[network];
  const blockOptions =  {}; // latest block number

  // basic modules
  const snxjs = new SynthetixJs({ networkId }); 
  const toUtf8Bytes = SynthetixJs.utils.formatBytes32String;
  const formatEther = snxjs.utils.formatEther;

  // get list of contracts synths supporting
  const synths = snxjs.contractSettings.synths.map(({ name }) => name);
  //console.log(synths)

  // get all info
  let totalInUSD = 0;
  let results = await Promise.all(synths.map(async synth => {

      // synth is the name of the coin

      // number of coin
      const totalAmount = await snxjs[synth].contract.totalSupply(blockOptions);
      //console.log(totalAmount)
      const totalSupply = formatEther(totalAmount);  

      // rate or price
      const rateForSynth = (await snxjs.ExchangeRates.contract.rateForCurrency(toUtf8Bytes(synth), blockOptions)) / 1e18;

      // value of usd
      const totalSupplyInUSD = rateForSynth * totalSupply;

      // sum
      totalInUSD += totalSupplyInUSD;

      return { synth, totalAmount, totalSupply, rateForSynth, totalSupplyInUSD };
    }));

    // 排序
    results = results.sort((a, b) => a.totalSupplyInUSD > b.totalSupplyInUSD ? -1 : 1);

    // 遍历
    let strResult = "";
    results.forEach(({ synth, totalSupplyInUSD }, i) => {
      // name:              synth
      // contract address:  snxjs[synth].contract.address
      // percentage:        numbro(100*totalSupplyInUSD/totalInUSD).format('0.00')

      // provide the percentage of the Synth by the name or contract address
      if (rank == (i + 1)) {
        const strName = synth;
        const strPercent = numbro(100*totalSupplyInUSD/totalInUSD).format('0.00');
        strResult = strName + " " + strPercent;
      }
    });
    //console.log(strResult)
    return strResult;
  };

// curl -X POST -H "content-type:application/json" "http://localhost:8080/" --data '{ "id": 0, "data": { "from": "ETH", "to": "USD" } }'
// curl -X POST -H "content-type:application/json" "http://localhost:8080/" --data '{ "id": 0, "data": { "base": "Synth", "quote": "1" } }'
const createRequest = (input, callback) => {
  // The Validator helps you validate the Chainlink request data
  const validator = new Validator(callback, input, customParams)
  const jobRunID = validator.validated.id
  const type = validator.validated.data.base.toUpperCase()
  const rank = parseInt(validator.validated.data.quote)

  // run
  getPercent(rank).then((strResult) => {
      console.log(strResult);
      callback(200, {jobRunID, data: strResult, statusCode:"ok" })
    })
    .catch(error => {
      callback(500, {jobRunID, data: strResult, statusCode:"errored"})
    });

  // The Requester allows API calls be retry in case of timeout
  // or connection failure
  // Requester.request(config, customError)
  //   .then(response => {
  //     // It's common practice to store the desired value at the top-level
  //     // result key. This allows different adapters to be compatible with
  //     // one another.
  //     response.data.result = Requester.validateResultNumber(response.data, [tsyms])
  //     callback(response.status, Requester.success(jobRunID, response))
  //   })
  //   .catch(error => {
  //     callback(500, Requester.errored(jobRunID, error))
  //   })
}

// This is a wrapper to allow the function to work with
// GCP Functions
exports.gcpservice = (req, res) => {
  createRequest(req.body, (statusCode, data) => {
    res.status(statusCode).send(data)
  })
}

// This is a wrapper to allow the function to work with
// AWS Lambda
exports.handler = (event, context, callback) => {
  createRequest(event, (statusCode, data) => {
    callback(null, data)
  })
}

// This is a wrapper to allow the function to work with
// newer AWS Lambda implementations
exports.handlerv2 = (event, context, callback) => {
  createRequest(JSON.parse(event.body), (statusCode, data) => {
    callback(null, {
      statusCode: statusCode,
      body: JSON.stringify(data),
      isBase64Encoded: false
    })
  })
}

// This allows the function to be exported for testing
// or for running in express
module.exports.createRequest = createRequest
