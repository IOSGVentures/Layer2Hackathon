import * as TYPES from "./types";
import * as API from "../assets/js/Common/API"
import axios from 'axios'
import BoboPair from "../assets/contracts/abi/BoboPair.json";
import * as BASEJS from '../assets/js/Common/base'
const mutations = {
  [TYPES.CHANGE_SKIN](state, v) {
		state.skin = v;
		localStorage.setItem("Skin", v);
	},
	[TYPES.CHANGE_HEADER](state, v) {
		state.header = v;
	},
	[TYPES.SET_ACCOUNT](state, v) {
		state.account = v;
	},
	[TYPES.SET_ISCONNECTED](state, v) {
		state.isConnected = v;
	},
	[TYPES.SET_CHAINID](state, v) {
		state.chainId = v;
	},
	[TYPES.SET_WEB3](state, v) {
		state.web3 = v;
	},
	[TYPES.SET_DRIZZLE](state, v) {
		state.drizzle = v;
	},
	[TYPES.GET_HANGQING](state, v) {
		state.hangqing = [];
		let chainId = state.chainId.toString()
		axios.get(API.getQuotation).then((quotation) => {
			//console.log(quotation)
			const list = quotation.data[chainId];
			let assets = {};
			list.assets.map(asset => {
				assets[asset.address] = asset;
			})
			for (var i = 0; i < list.pairs.length; i++) {
				const pairBaseInfo = list.pairs[i];
				for (var j = 0; j < pairBaseInfo.peerTokens.length; j++) {
					const peerAddr = pairBaseInfo.peerTokens[j];
					//var pairInfo = assets[peerAddr];
					if (assets[peerAddr] == null) {
						console.log(peerAddr + ' has no token info.')
						return;
					}
					const pairInfo = JSON.parse(JSON.stringify(assets[peerAddr]));
					pairInfo.baseTokenAddr = pairBaseInfo.baseTokenAddr;
					pairInfo.baseTokenName = pairBaseInfo.baseTokenName;
					pairInfo.coingecko_currency = pairBaseInfo.coingecko_currency;
					
					//24H涨跌幅
					let url = API.getRiseFall + "vs_currency=" + pairInfo.coingecko_currency + "&ids=" + pairInfo.coingeckoId;
					axios.get(url).then((res) => {
						if (pairInfo == null) {
							console.log(url, res);
							return;
						}
						pairInfo.high24h = res.data[0].price_change_percentage_24h.toFixed(2);
						state.hangqing.push(pairInfo);					
					});

					// 24成交量
					const boboFactory = state.drizzle.contracts.BoboFactory;
					boboFactory.methods
						.getPair(peerAddr, pairBaseInfo.baseTokenAddr)
						.call()
						.then((pairAddr) => {
							if (pairAddr != '0x0000000000000000000000000000000000000000') {
								//console.log(pairAddr, '=>', peerAddr, pairBaseInfo.baseTokenAddr);
								const boboPair = new state.web3.eth.Contract(BoboPair.abi, pairAddr);
								boboPair.methods.volumnOf24Hours().call().then(volumn => {
									console.log(pairAddr, volumn);
									pairInfo.volumnOf24Hours = volumn;
								})
							} else {
								pairInfo.volumnOf24Hours = 0;
							}
						});

					// 聚合价
				}
			}
		});
	},
	[TYPES.GET_TRADEINFO](state, v) {
		let coingeckoMap = {};
		let id2PairMap = {};
		state.hangqing.map(pairInfo => {
			if (id2PairMap[pairInfo.coingecko_currency + '-' + pairInfo.coingeckoId] == null) {
				id2PairMap[pairInfo.coingecko_currency + '-' + pairInfo.coingeckoId] = [];
				id2PairMap[pairInfo.coingecko_currency + '-' + pairInfo.coingeckoId].push(pairInfo);
			} else {
				id2PairMap[pairInfo.coingecko_currency + '-' + pairInfo.coingeckoId].push(pairInfo);
			}

			if (coingeckoMap[pairInfo.coingecko_currency] == null) {
				coingeckoMap[pairInfo.coingecko_currency] = [];
				coingeckoMap[pairInfo.coingecko_currency].push(pairInfo.coingeckoId);
			} else {
				coingeckoMap[pairInfo.coingecko_currency].push(pairInfo.coingeckoId);
			}
		});
		Object.keys(coingeckoMap).forEach((currency) => {
			let coingeckoIds = coingeckoMap[currency].join();
			let url = API.getRiseFall + "vs_currency=" + currency + "&ids=" + coingeckoIds;
			axios.get(url).then((marketInfo) => {
				marketInfo.data.map(item => {
					id2PairMap[currency + '-' + item.id].map(onePairInfo => {
						onePairInfo.high24h = item.price_change_percentage_24h.toFixed(2);	
					})
					
				})
			});
		});
	}
}
export default mutations