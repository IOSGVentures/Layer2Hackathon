<template>
  <div id="Header">
    <img
      :src="theme == 'dark' ? logo : logo2"
      class="logo"
      @click="chageDrawer"
    />
    <div class="address">
      <div class="div" v-if="!isConnected" @click="connectWallet">
        <img :src="theme == 'dark' ? wallet : wallet2" />
        <span>点击链接钱包</span>
      </div>
      <div class="div" v-else>
        <img src="../../assets/images/addressIcon.png" />
        <span>{{ account.substr(0, 6) + "..." + account.substr(account.length - 3) }}</span>
      </div>
    </div>
  </div>
</template>
<script>
let logo = require("../../assets/images/logo.png");
let logo2 = require("../../assets/images/logo2.png");
let wallet = require("../../assets/images/wallet.png");
let wallet2 = require("../../assets/images/wallet2.png");
import Web3 from "web3";
import { myMixins } from "../../assets/js/Wallet/ConnectWallet.js";
export default {
  name: "Header",
  mixins: [myMixins],
  data() {
    return {
      logo: logo,
      logo2: logo2,
      wallet: wallet,
      wallet2: wallet2,
      chainId: null,
      web3: null,
    };
  },
  computed: {
    theme() {
      return this.$store.state.skin;
    },
    account() {
      return this.$store.state.account;
    },
    isConnected() {
      return this.$store.state.isConnected;
    },
  },
  components: {},
  methods: {
    chageDrawer() {
      this.$emit("chageDrawer");
    },
  },
};
</script>
<style lang="scss">
@import "../../assets/styles/Header/header.scss";
</style>