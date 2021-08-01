import * as TYPES from "./types"
const actions = {
  changeSkin(vuex, v) {
    vuex.commit(TYPES.CHANGE_SKIN, v)
    
  },
  chageHeader(vuex, v) {
    vuex.commit(TYPES.CHANGE_HEADER, v)
  },
  setAccount(vuex, v) {
    vuex.commit(TYPES.SET_ACCOUNT,v)
  },
  setIsConnected(vuex, v) {
    vuex.commit(TYPES.SET_ISCONNECTED,v)
  },
  setChainId(vuex, v) {
    vuex.commit(TYPES.SET_CHAINID,v)
  },
  setWeb3(vuex, v) {
    vuex.commit(TYPES.SET_WEB3,v)
  },
  setDrizzle(vuex, v) {
    vuex.commit(TYPES.SET_DRIZZLE,v)
  },
  getHangQing(vuex, v) {
    vuex.commit(TYPES.GET_HANGQING,v)
  },
  getTradeInfo(vuex, v) {
    vuex.commit(TYPES.GET_TRADEINFO,v)
  }
}
export default actions