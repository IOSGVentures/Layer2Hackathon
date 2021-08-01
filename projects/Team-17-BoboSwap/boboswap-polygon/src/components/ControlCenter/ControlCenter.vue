<template>
  <div class="center" :data-theme="theme">
    <img :src="theme == 'dark' ? logo : logo2" class="logo" />
    <div class="welcome" v-if="!isConnected">
      <div class="link">
        <span @click="connectWallet">点击连接钱包</span>
        <i class="iconfont icon-right"></i>
      </div>
      <div class="welcomen_text">欢迎来到BoboSwap</div>
    </div>
    <div class="user_center" v-else>
      <img src="../../assets/images/user_center_img.png" />
      <span class="address">{{ account.substr(0, 6) + "..." + account.substr(account.length - 3) }}</span>
      <span class="total_asset">账户总资产折合(USDT)</span>
      <span class="total_num">0.00000000</span>
      <span class="total_asset">≈0.00(RMB)</span>
    </div>
    <div class="control">
      <div class="control_item">
        <img :src="theme == 'dark' ? img1 : img1_1" />
        <span>流动性挖矿</span>
      </div>
      <div class="control_item">
        <img :src="theme == 'dark' ? img2 : img2_2" />
        <span>DAO</span>
      </div>
      <div class="control_item">
        <img :src="theme == 'dark' ? img3 : img3_3" />
        <span>交易挖矿</span>
      </div>
      <div class="control_item">
        <img :src="theme == 'dark' ? img4 : img4_4" />
        <span>跨链桥</span>
      </div>
      <div class="control_item seting">
        <img :src="theme == 'dark' ? img5 : img5_5" />
        <span @click="showAction = !showAction">
          {{ lang == 1 ? "简体中文" : "English" }}
          / {{ rate == 1 ? "CNY" : "USDT" }} /
          {{ skin == 1 ? "Dark" : "Light" }}
        </span>
        <i
          class="iconfont icon"
          :class="showAction ? 'icon-up1' : ' icon-down_3'"
        ></i>
        <div class="seting_box" v-show="showAction">
          <div class="item">
            <span class="title">语言</span>
            <div class="lang" @click="chageLang(1)">
              <span>简体中文</span>
              <i
                v-show="lang == 1"
                class="iconfont icon-chose"
                :class="lang == 1 ? 'actived' : null"
              ></i>
            </div>
            <div class="lang right" @click="chageLang(2)">
              <span>English</span>
              <i
                v-show="lang == 2"
                class="iconfont icon-chose"
                :class="lang == 2 ? 'actived' : null"
              ></i>
            </div>
          </div>

          <div class="item">
            <span class="title">汇率</span>
            <div class="lang" @click="chageRate(1)">
              <span>CNY</span>
              <i
                v-show="rate == 1"
                class="iconfont icon-chose"
                :class="rate == 1 ? 'actived' : null"
              ></i>
            </div>
            <div class="lang right" @click="chageRate(2)">
              <span>USDT</span>
              <i
                v-show="rate == 2"
                class="iconfont icon-chose"
                :class="rate == 2 ? 'actived' : null"
              ></i>
            </div>
          </div>

          <div class="item">
            <span class="title">主题</span>
            <div class="lang" @click="chageSkin(1)">
              <span>Dark</span>
              <i
                v-show="skin == 1"
                class="iconfont icon-chose"
                :class="skin == 1 ? 'actived' : null"
              ></i>
            </div>
            <div class="lang right" @click="chageSkin(2)">
              <span>Light</span>
              <i
                v-show="skin == 2"
                class="iconfont icon-chose"
                :class="skin == 2 ? 'actived' : null"
              ></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
let logo = require("../../assets/images/logo.png");
let logo2 = require("../../assets/images/logo2.png");
let img1 = require("../../assets/images/control_img1.png");
let img1_1 = require("../../assets/images/control_img1_1.png");
let img2 = require("../../assets/images/control_img2.png");
let img2_2 = require("../../assets/images/control_img2_2.png");
let img3 = require("../../assets/images/control_img3.png");
let img3_3 = require("../../assets/images/control_img3_3.png");
let img4 = require("../../assets/images/control_img4.png");
let img4_4 = require("../../assets/images/control_img4_4.png");
let img5 = require("../../assets/images/control_img5.png");
let img5_5 = require("../../assets/images/control_img5_5.png");

import Web3 from "web3";
import { myMixins } from "../../assets/js/Wallet/ConnectWallet.js";
export default {
  name: "ControlCenter",
  mixins: [myMixins],
  data() {
    return {
      logo: logo,
      logo2: logo2,
      img1,
      img1_1,
      img2,
      img2_2,
      img3,
      img3_3,
      img4,
      img4_4,
      img5,
      img5_5,
      theme: localStorage.getItem("Skin"),
      lang: localStorage.getItem("Lang") == "zh" ? 1 : 2,
      rate: localStorage.getItem("Rate") == "USDT" ? 1 : 2,
      skin: localStorage.getItem("Skin") == "dark" ? 1 : 2,
      showAction: false,
      web3: null,
    };
  },
  watch: {
    theme(newThem) {
      localStorage.setItem("Skin", newThem);
      this.$store.dispatch("changeSkin", newThem);
    },
  },
  computed: {
    account() {
      return this.$store.state.account;
    },
    isConnected() {
      return this.$store.state.isConnected;
    },
  },
  methods: {
    chageLang(n) {
      this.lang = n;
    },
    chageRate(n) {
      this.rate = n;
    },
    chageSkin(n) {
      this.skin = n;
      this.theme = localStorage.getItem("Skin") == "dark" ? "light" : "dark";
      localStorage.setItem("Skin", this.theme);
    },
  },
};
</script>
<style lang="scss">
@import "../../assets/styles/ControlCenter/ControlCenter.scss";
</style>