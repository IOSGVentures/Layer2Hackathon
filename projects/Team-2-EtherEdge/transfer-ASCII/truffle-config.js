require('dotenv/config')

const HDWalletProvider = require('@truffle/hdwallet-provider')
const PRIVATE_KEY = 'Your private key'

module.exports = {
  compilers: {
    solc: {
      version: '0.8.0',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
      gas: 8000000,
    },
    xdai: {
      provider: function () {
        return new HDWalletProvider(
          PRIVATE_KEY,
          'https://rpc.xdaichain.com/'
        )
      },
      network_id: 100,
      gas: 10000000,
      gasPrice: 10000000000,
    },
    sokol: {
      provider: function () {
        return new HDWalletProvider(
          PRIVATE_KEY,
          'https://sokol.poa.network'
        )
      },
      network_id: '77',
      gas: 10000000,
      gasPrice: 1000000000,
    },
  },
  plugins: [
    // "truffle-contract-size",
    'truffle-plugin-verify',
  ],
}
