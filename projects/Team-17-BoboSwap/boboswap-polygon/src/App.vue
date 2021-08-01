<template>
  <div id="app">
    <router-view />
  </div>
</template>
<script>
import Web3 from "web3";
import { Drizzle } from "@drizzle/store";
import drizzleOptions from "./assets/contracts/drizzleOptions";
import { myMixins } from "./assets/js/Wallet/ConnectWallet";
export default {
  data() {
    return {
      web3: null,
    };
  },
  mixins: [myMixins],
  async created() {
    const drizzle = new Drizzle(drizzleOptions);
    this.$store.dispatch("setDrizzle", drizzle);
    await this.connectWallet();
    this.$store.dispatch("getHangQing");
    setInterval(() => {
      this.$store.dispatch("getTradeInfo");
    }, 15000);
  },
  methods: {},
  components: {},
};
</script>


<style lang="scss">
@import "./assets/styles/base.scss";
#app {
  font-family: "Playfair Display SC";
}
</style>
